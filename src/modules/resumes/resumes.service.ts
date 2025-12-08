import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Readable } from 'stream';
import axios from 'axios';
import type { Response } from 'express';

import { PrismaService } from '@/prisma/prisma.service';
import { CloudinaryService } from '@/integrations/storage/cloudinary.service';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { CreateResumeDto } from './dto/create-resume.dto';

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async getAllResumes(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      userId,
    };

    const total = await this.prisma.resume.count({ where });

    const resumes = await this.prisma.resume.findMany({
      where,
      skip,
      take: limit,
    });

    return {
      resumes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getResume(resumeId: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) throw new NotFoundException('Resume not found');

    return resume;
  }

  async createResume(userId: string, dto: CreateResumeDto) {
    const { isDefault, content, title } = dto;

    if (isDefault) {
      await this.prisma.resume.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const resume = await this.prisma.resume.create({
      data: {
        title,
        userId,
        isDefault: !!isDefault,
        content: content ? { create: content } : undefined,
      },
      include: {
        content: true,
      },
    });

    return resume;
  }

  async updateResume(
    resumeId: string,
    userId: string,
    updateData: UpdateResumeDto,
  ) {
    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
      include: {
        content: true,
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (updateData.isDefault) {
      await this.prisma.resume.updateMany({
        where: {
          userId,
          id: { not: resumeId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const { content, ...resumeData } = updateData;

    const updatedResume = await this.prisma.resume.update({
      where: { id: resumeId },
      data: {
        ...resumeData,
        content: content
          ? resume.content
            ? {
                update: content,
              }
            : {
                create: content,
              }
          : undefined,
      },
      include: {
        content: true,
      },
    });

    return updatedResume;
  }

  async updateResumeFile(
    resumeId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.originalFileUrl) {
      try {
        const publicId = this.extractCloudinaryPublicId(resume.originalFileUrl);
        await this.cloudinary.delete(publicId);
      } catch (err) {
        console.error('Failed to delete old resume file:', err);
      }
    }

    const uploaded = await this.cloudinary.uploadResume(file);

    await this.prisma.resume.update({
      where: { id: resumeId },
      data: { originalFileUrl: uploaded.secure_url },
    });

    return { originalFileUrl: uploaded.secure_url };
  }

  async removeResumeFile(resumeId: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.originalFileUrl) {
      try {
        const publicId = this.extractCloudinaryPublicId(resume.originalFileUrl);
        await this.cloudinary.delete(publicId);
      } catch (err) {
        console.error('Failed to delete resume file:', err);
      }
    }

    await this.prisma.resume.update({
      where: { id: resumeId },
      data: { originalFileUrl: null },
    });

    return { message: 'Resume file removed successfully' };
  }

  async downloadResume(resumeId: string, userId: string, res: Response) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (!resume.originalFileUrl) {
      throw new BadRequestException('No file uploaded for this resume');
    }

    try {
      const fileStream = await axios.get(resume.originalFileUrl, {
        responseType: 'stream',
      });

      const contentType =
        (fileStream.headers['content-type'] as string | undefined) ||
        'application/octet-stream';
      const extension = this.getFileExtension(
        contentType,
        resume.originalFileUrl,
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="resume-${resumeId}${extension}"`,
      );
      res.setHeader('Content-Type', contentType);

      const contentLength = fileStream.headers['content-length'] as
        | string
        | undefined;
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      (fileStream.data as unknown as Readable).pipe(res);
    } catch (error) {
      console.error('Download resume error:', error);
      throw new BadRequestException('Failed to download file');
    }
  }

  async deleteResume(resumeId: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) throw new NotFoundException('Resume not found');

    try {
      await this.prisma.resume.delete({ where: { id: resumeId } });
    } catch (error) {
      console.error('Delete resume error:', error);
      throw new InternalServerErrorException('Failed to delete resume');
    }

    return { message: 'Resume deleted successfully' };
  }

  private extractCloudinaryPublicId(url: string): string {
    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return `resumes/${filename.split('.')[0]}`;
  }

  private getFileExtension(contentType: string, url: string): string {
    const urlMatch = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    if (urlMatch) {
      return `.${urlMatch[1]}`;
    }

    const mimeMap: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'application/msword': '.doc',
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/svg+xml': '.svg',
    };

    return mimeMap[contentType] || '';
  }
}
