import {
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateResumeContentDto } from './update-resume-content.dto';

export class CreateResumeDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateResumeContentDto)
  content?: UpdateResumeContentDto;
}
