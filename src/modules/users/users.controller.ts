import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.users.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateProfile(userId, dto);
  }

  @Put('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.users.updateAvatar(userId, file);
  }

  @Delete('avatar')
  async removeAvatar(@CurrentUser('id') userId: string) {
    return this.users.removeAvatar(userId);
  }

  @Put('password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.users.changePassword(userId, dto);
  }

  @Delete('account')
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.users.deleteAccount(userId);
  }
}
