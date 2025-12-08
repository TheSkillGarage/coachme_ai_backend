import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';
import { Prisma } from '@/generated/client/client';

export class UpdateResumeContentDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  experience?: Prisma.InputJsonValue[];

  @IsOptional()
  education?: Prisma.InputJsonValue[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  certifications?: Prisma.InputJsonValue[];

  @IsOptional()
  projects?: Prisma.InputJsonValue[];
}
