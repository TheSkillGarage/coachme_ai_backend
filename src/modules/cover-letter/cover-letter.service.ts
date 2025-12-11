/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
// src/cover-letter/cover-letter.service.ts
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    // C - Create/Save
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
            // P2002: Unique constraint failed (e.g., if you had a unique title per user)
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('A cover letter with this unique field already exists.');
            }
            throw new InternalServerErrorException('Failed to create cover letter due to a database error.');
        }
    }

    // R - Read All
    async findAll(userId: string): Promise<any[]> {
        return await this.prisma.coverLetter.findMany({
            where: { userId: userId }
        });
    }

    // R - Read One (Refactored to handle findFirst failure explicitly)
    async findOne(id: string, userId: string): Promise<any> {
        const letter = await this.prisma.coverLetter.findFirst({
            where: { id: id, userId: userId },
        });

        if (!letter) {
            // This is the core ownership/existence check
            throw new NotFoundException(`Cover Letter with ID ${id} not found or access denied.`);
        }
        return letter;
    }

    // U - Update
    async update(id: string, userId: string, data: UpdateCoverLetterDto): Promise<any> {
        // Step 1: Ensure ownership/existence (This throws NotFoundException if access is denied)
        await this.findOne(id, userId);

        try {
            // Step 2: Perform the update
            return await this.prisma.coverLetter.update({
                where: { id: id }, // ID is the unique key for the update
                data: data,
            });
        } catch (error) {
            // P2025: Record to update not found (Should be caught by findOne, but a safety net)
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Cover Letter with ID ${id} not found.`);
            }
            // P2002: Unique constraint violation on update
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Update failed: Unique constraint violation.');
            }
            throw new InternalServerErrorException('Failed to update cover letter due to a database error.');
        }
    }

    // D - Delete
    async remove(id: string, userId: string): Promise<void> {
        // Step 1: Ensure ownership/existence
        await this.findOne(id, userId);

        try {
            // Step 2: Perform the delete
            await this.prisma.coverLetter.delete({
                where: { id: id },
            });
        } catch (error) {
            // P2025: Record to delete not found (Should be caught by findOne, but safety is key)
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Cover Letter with ID ${id} not found.`);
            }
            throw new InternalServerErrorException('Failed to delete cover letter due to a database error.');
        }
    }
}