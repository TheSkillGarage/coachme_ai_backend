import { IsString, IsNumber } from 'class-validator';

export class EducationDto {
  @IsString()
  institution!: string;

  @IsString()
  degree!: string;

  @IsString()
  field!: string;

  @IsString()
  graduationYear!: string;

  @IsNumber()
  gpa!: number;
}
