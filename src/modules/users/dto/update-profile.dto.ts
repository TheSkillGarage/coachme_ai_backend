import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsExperience?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];
}
