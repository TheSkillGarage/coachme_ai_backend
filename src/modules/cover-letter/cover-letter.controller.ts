/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Get, Put, Delete, Param, HttpCode, HttpStatus, UseGuards, } from '@nestjs/common';
import { CoverLetterService } from './cover-letter.service';
import { GenerateCoverLetterDto, CreateCoverLetterDto, UpdateCoverLetterDto } from './dto/create-coverletter-dto';

// --- Import the new decorator ---
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

interface AuthUser {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
}

@Controller('cover-letter')
@UseGuards(JwtAuthGuard)
export class CoverLetterController {
    constructor(private readonly coverLetterService: CoverLetterService) { }

    // ====================================================================
    // 1. AI GENERATION ENDPOINT
    // ====================================================================
    @Post('generate')
    @HttpCode(HttpStatus.OK)
    async generateCoverLetter(@Body() body: GenerateCoverLetterDto, @CurrentUser() user: AuthUser) {
        const userName = [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ') || 'Candidate Name';
        const htmlContent = await this.coverLetterService.generate(body, userName);
        return {
            success: true,
            message: 'Cover letter generated as HTML, ready for editing.',
            html: htmlContent
        };
    }


    // C - Create (Save Generated Letter)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() createDto: CreateCoverLetterDto,
        // Use the decorator to get only the 'id' property of the user object
        @CurrentUser('id') authenticatedUserId: string
    ): Promise<any> {
        // Overwrite the potentially insecure userID from the body with the authenticated one
        const dataWithUser = { ...createDto, userID: authenticatedUserId };
        return this.coverLetterService.create(dataWithUser);
    }

    // R - Read All (List)
    @Get()
    async findAll(
        @CurrentUser('id') authenticatedUserId: string
    ): Promise<any[]> {
        return this.coverLetterService.findAll(authenticatedUserId);
    }

    // R - Read One (Detail)
    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @CurrentUser('id') authenticatedUserId: string
    ): Promise<any> {
        return this.coverLetterService.findOne(id, authenticatedUserId);
    }

    // U - Update
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateCoverLetterDto,
        @CurrentUser('id') authenticatedUserId: string
    ): Promise<any> {
        return this.coverLetterService.update(id, authenticatedUserId, updateDto);
    }

    // D - Delete
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') id: string,
        @CurrentUser('id') authenticatedUserId: string
    ): Promise<void> {
        await this.coverLetterService.remove(id, authenticatedUserId);
    }
}