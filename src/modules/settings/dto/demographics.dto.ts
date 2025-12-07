import { IsString, IsOptional } from 'class-validator';

export class UpdateDemographicsDto {
  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  ethnicity?: string[];

  @IsString()
  @IsOptional()
  veteranStatus?: string;

  @IsString()
  @IsOptional()
  disabilityStatus?: string;
}
