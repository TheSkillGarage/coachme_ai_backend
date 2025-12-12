import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class NotificationApplicationDto {
  @IsString()
  @Expose()
  id!: string;

  @IsString()
  @Expose()
  company!: string;

  @IsString()
  @Expose()
  position!: string;

  @IsOptional()
  @IsString()
  @Expose()
  location: string | null = null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Expose()
  interviewDate: Date | null = null;
}

export class NotificationResponseDto {
  @IsString()
  @Expose()
  id!: string;

  @IsString()
  @Expose()
  title!: string;

  @IsString()
  @Expose()
  description!: string;

  @IsString()
  @Expose()
  priority!: string;

  @IsBoolean()
  @Expose()
  isRead!: boolean;

  @IsDate()
  @Type(() => Date)
  @Expose()
  createdAt!: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationApplicationDto)
  @Expose()
  application?: NotificationApplicationDto | null = null;
}
