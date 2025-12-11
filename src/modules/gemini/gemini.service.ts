/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: null | ReturnType<GoogleGenerativeAI['getGenerativeModel']> =
        null;

    constructor(private configService: ConfigService) {
        this.genAI = new GoogleGenerativeAI(
            this.configService.get<string>('GEMINI_API_KEY') || '',
        );
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    async generateText(prompt: string): Promise<string> {
        try {
            if (!this.model) {
                throw new Error('Gemini model is not initialized');
            }
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Generic cleanup to remove Markdown code blocks (useful for all rich text use cases)
            return text
                .replace(/^```html/g, '')
                .replace(/^```/g, '')
                .replace(/```$/g, '');
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('Failed to communicate with AI provider');
        }
    }
}
