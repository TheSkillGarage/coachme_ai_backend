import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';
import { EmailService } from '@/common/email/email.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
    private email: EmailService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isEmailVerified: false,
      },
    });

    // Send verification OTP
    await this.sendVerificationOtp(user.id, user.email, user.firstName);

    return {
      message:
        'Registration successful. Please check your email for verification code.',
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email verified
    if (!user.isEmailVerified) {
      throw new BadRequestException('Please verify your email first');
    }

    // Generate tokens
    return this.generateTokens(user.id);
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);

    return { message: 'Logged out successfully' };
  }

  async sendVerificationOtp(
    userId: string,
    email: string,
    firstName?: string | null,
  ) {
    const otp = this.generateOtp();
    const key = `otp:verify:${userId}`;

    if (!firstName) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true },
      });
      firstName = user?.firstName;
    }

    // Store in Redis with 10 minute expiry
    await this.redis.set(key, otp, 600);

    // Also store in database for audit
    await this.prisma.otpCode.create({
      data: {
        userId,
        code: otp,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send email
    await this.email.sendOtp(email, otp, 'verify', firstName || undefined);

    return { message: 'OTP sent to email' };
  }

  async verifyEmail(userId: string, otp: string) {
    const key = `otp:verify:${userId}`;
    const storedOtp = await this.redis.get(key);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Update user
    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    // Delete OTP
    await this.redis.del(key);

    // Mark OTP as used in database
    await this.prisma.otpCode.updateMany({
      where: {
        userId,
        type: 'EMAIL_VERIFICATION',
        used: false,
      },
      data: { used: true },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendVerificationOtp(user.id, user.email);
    return { message: 'OTP resent successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security)
    if (!user) {
      return { message: 'If email exists, OTP has been sent' };
    }

    const firstName = user?.firstName;
    const otp = this.generateOtp();
    const key = `otp:reset:${user.id}`;

    // Store in Redis
    await this.redis.set(key, otp, 600);

    // Store in database
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otp,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send email
    await this.email.sendOtp(email, otp, 'reset', firstName || undefined);

    return { message: 'If email exists, OTP has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid request');
    }

    const key = `otp:reset:${user.id}`;
    const storedOtp = await this.redis.get(key);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete OTP
    await this.redis.del(key);

    return { message: 'Password reset successful' };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(
        refreshToken,
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
        },
      );

      return await this.generateTokens(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Helper methods
  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  private async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
