import { IsString, IsOptional } from 'class-validator';

export class WorkExperienceDto {
  @IsString()
  company!: string;

  @IsString()
  position!: string;

  @IsString()
  startDate!: string;

  @IsOptional()
  @IsString()
  endDate?: string | null;

  @IsString()
  description!: string;

  @IsString()
  location!: string;
}
