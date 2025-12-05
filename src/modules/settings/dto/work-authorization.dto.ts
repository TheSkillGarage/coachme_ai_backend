import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateWorkAuthDto {
  @IsString()
  @IsOptional()
  authorizedRegions?: string[];

  @IsBoolean()
  @IsOptional()
  requiresSponsorship?: boolean;
}
