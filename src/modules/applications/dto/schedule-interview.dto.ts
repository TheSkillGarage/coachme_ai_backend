import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class ScheduleInterviewDto {
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
