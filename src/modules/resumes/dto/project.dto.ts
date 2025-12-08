import { IsString, IsOptional } from 'class-validator';

export class ProjectDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString({ each: true })
  technologies!: string[];

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
