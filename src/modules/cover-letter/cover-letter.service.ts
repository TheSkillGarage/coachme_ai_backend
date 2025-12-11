/* eslint-disable prettier/prettier */
// src/cover-letter/cover-letter.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { GenerateCoverLetterDto } from './dto/create-coverletter-dto';
import { CreateCoverLetterDto } from './dto/create-coverletter-dto';
import { UpdateCoverLetterDto } from './dto/create-coverletter-dto';
import { PrismaService } from '@/prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class CoverLetterService {
    constructor(
        private readonly geminiService: GeminiService,
        private readonly prisma: PrismaService,
    ) { }

    // ====================================================================
    // 1. AI GENERATION (Unchanged)
    // ====================================================================

    async generate(data: GenerateCoverLetterDto, userName: string): Promise<string> {
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

    // ====================================================================
    // Create/Save
    // ====================================================================


    async create(data: CreateCoverLetterDto): Promise<any> {
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
    }

    // Read All
    async findAll(userId: string): Promise<any[]> {
        return await this.prisma.coverLetter.findMany({
            where: { userId: userId }
        });
    }

    //Read One
    async findOne(id: string, userId: string): Promise<any> {
        const letter = await this.prisma.coverLetter.findFirst({
            where: { id: id, userId: userId },
        });

        if (!letter) {
            throw new NotFoundException(`Cover Letter with ID ${id} not found for user.`);
        }
        return letter;
    }

    // Update
    async update(id: string, userId: string, data: UpdateCoverLetterDto): Promise<any> {
        // Ensure ownership and existence before update
        await this.findOne(id, userId);

        return await this.prisma.coverLetter.update({
            where: { id: id },
            data: data,
        });
    }

    // Delete
    async remove(id: string, userId: string): Promise<void> {
        await this.findOne(id, userId);

        await this.prisma.coverLetter.delete({
            where: { id: id },
        });
    }
}