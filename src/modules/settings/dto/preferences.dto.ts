import {
  IsArray,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdatePreferencesDto {
  @IsBoolean()
  @IsOptional()
  autoApplyEnabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredJobTypes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredLocations?: string[];

  @IsInt()
  @Min(0)
  @IsOptional()
  minSalary?: number;
}
