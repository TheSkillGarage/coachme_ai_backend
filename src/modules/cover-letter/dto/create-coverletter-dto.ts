import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
export class CreateCoverLetterDto {
  @IsString()
  userID!: string;
  @IsString()
  title!: string;
  @IsString()
  jobTitle!: string;
  @IsString()
  companyName!: string;
  @IsString()
  content!: string;
  @IsBoolean()
  isGenerated!: boolean;
}

export class GenerateCoverLetterDto {
  @IsNotEmpty()
  @IsString()
  jobTitle!: string;

  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @IsString()
  @IsIn(['conversational', 'formal'])
  tone: 'conversational' | 'formal' = 'conversational';

  @IsNotEmpty()
  @IsString()
  jobDescription!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  keySkills!: string[];
}

export class UpdateCoverLetterDto extends PartialType(CreateCoverLetterDto) {}
