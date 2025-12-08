import { IsString, IsOptional } from 'class-validator';

export class CertificationDto {
  @IsString()
  name!: string;

  @IsString()
  issuer!: string;

  @IsString()
  date!: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  credentialId?: string;
}
