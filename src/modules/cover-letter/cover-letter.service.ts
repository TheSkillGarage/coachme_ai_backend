import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GenerateCoverLetterDto } from './dto/create-coverletter-dto';
import { CreateCoverLetterDto } from './dto/create-coverletter-dto';
import { UpdateCoverLetterDto } from './dto/create-coverletter-dto';
import { PrismaService } from '@/prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class CoverLetterService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    data: GenerateCoverLetterDto,
    userName: string,
  ): Promise<string> {
    const { jobTitle, companyName, tone, jobDescription, keySkills } = data;
    const prompt = `
            You are an expert career coach. Write a cover letter for a ${jobTitle} position at ${companyName}.
            
            SETTINGS: Tone: ${tone}. Skills to Emphasize: ${keySkills.join(', ')}.
            Job Context: Use details from this description: "${jobDescription}"
            
            STRICT FORMATTING RULES:
            1. Output **ONLY** raw HTML string (no markdown, no \`\`\`html).
            2. Use semantic HTML tags: <p>, <strong>, <ul>, <li>.
            3. Use the candidate's actual name: **${userName}** for the closing signature and return address.
        `;

    return this.geminiService.generateText(prompt);
  }

  async create(data: CreateCoverLetterDto): Promise<any> {
    try {
      return await this.prisma.coverLetter.create({
        data: {
          userId: data.userID,
          title: data.title,
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          content: data.content,
          isGenerated: data.isGenerated,
        },
      });
    } catch (error) {
      // Unique constraint failed (e.g., if you had a unique title per user)
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A cover letter with this unique field already exists.',
        );
      }
      throw new InternalServerErrorException(
        'Failed to create cover letter due to a database error.',
      );
    }
  }

  async findAll(userId: string): Promise<any[]> {
    return await this.prisma.coverLetter.findMany({
      where: { userId: userId },
    });
  }

  async findOne(id: string, userId: string): Promise<any> {
    const letter = await this.prisma.coverLetter.findFirst({
      where: { id: id, userId: userId },
    });

    if (!letter) {
      throw new NotFoundException(
        `Cover Letter with ID ${id} not found or access denied.`,
      );
    }
    return letter;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateCoverLetterDto,
  ): Promise<any> {
    await this.findOne(id, userId);

    try {
      return await this.prisma.coverLetter.update({
        where: { id: id },
        data: data,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cover Letter with ID ${id} not found.`);
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Update failed: Unique constraint violation.',
        );
      }
      throw new InternalServerErrorException(
        'Failed to update cover letter due to a database error.',
      );
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    try {
      await this.prisma.coverLetter.delete({
        where: { id: id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cover Letter with ID ${id} not found.`);
      }
      throw new InternalServerErrorException(
        'Failed to delete cover letter due to a database error.',
      );
    }
  }
}
