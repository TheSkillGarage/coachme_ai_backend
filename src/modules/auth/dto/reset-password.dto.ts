import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Length,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword!: string;
}
