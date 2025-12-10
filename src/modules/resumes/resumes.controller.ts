import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ResumesService } from './resumes.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { CreateResumeDto } from './dto/create-resume.dto';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private resumes: ResumesService) {}

  @Get()
  async getAllResumes(@CurrentUser('id') userId: string) {
    return this.resumes.getAllResumes(userId);
  }

  @Get(':id')
  async getResume(
    @Param('id') resumeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.resumes.getResume(resumeId, userId);
  }

  @Post()
  async createResume(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateResumeDto,
  ) {
    return this.resumes.createResume(userId, dto);
  }

  @Put(':id/file')
  @UseInterceptors(FileInterceptor('resume'))
  async updateResumeFile(
    @Param('id') resumeId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.resumes.updateResumeFile(resumeId, userId, file);
  }

  @Delete(':id/file')
  async removeResumeFile(
    @Param('id') resumeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.resumes.removeResumeFile(resumeId, userId);
  }

  @Get(':id/download')
  async downloadResume(
    @Param('id') resumeId: string,
    @CurrentUser('id') userId: string,
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    return this.resumes.downloadResume(resumeId, userId, res);
  }

  @Put(':id')
  async updateResume(
    @Param('id') resumeId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumes.updateResume(resumeId, userId, dto);
  }

  @Delete(':id')
  async deleteResume(
    @Param('id') resumeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.resumes.deleteResume(resumeId, userId);
  }
}
