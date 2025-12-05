import {
  IsBoolean,
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class UpdateAISettingsDto {
  @IsBoolean()
  @IsOptional()
  aiApplyEnabled?: boolean;

  @IsString()
  @IsOptional()
  applicationFrequency?: string; // "Conservative", "Moderate", "Aggressive"

  @IsInt()
  @Min(50)
  @Max(100)
  @IsOptional()
  jobMatchThreshold?: number; // 90, 80, etc.

  @IsBoolean()
  @IsOptional()
  autoFillEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyBeforeAutoFill?: boolean;
}
