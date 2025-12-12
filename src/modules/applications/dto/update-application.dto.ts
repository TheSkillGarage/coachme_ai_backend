import { IsOptional, IsEnum } from 'class-validator';
import { ApplicationStatus } from '@/generated/client/enums';

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
