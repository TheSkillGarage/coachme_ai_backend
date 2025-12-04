import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as fs from 'fs/promises';
import * as path from 'path';

interface EmailResponse {
  messageId: string;
  envelope: nodemailer.SentMessageInfo['envelope'];
  accepted: string[];
  rejected: string[];
  pending?: string[];
  response: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private config: ConfigService) {
    const smtpUsername = this.config.get<string>('BREVO_SMTP_USERNAME');
    const smtpPassword = this.config.get<string>('BREVO_SMTP_PASSWORD');

    if (!smtpUsername || !smtpPassword) {
      throw new Error('BREVO SMTP credentials are not configured');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
    }
  }

  private getTemplatesDir(): string {
    // Always use the src directory for templates
    // process.cwd() gets the project root
    return path.join(process.cwd(), 'src/common/email/templates');
  }

  // Load template from file
  private async loadTemplate(templateName: string): Promise<string> {
    const templatesDir = this.getTemplatesDir();
    const templatePath = path.join(templatesDir, `${templateName}.html`);

    console.log(`📧 Loading template from: ${templatePath}`); // Debug log

    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error(`❌ Failed to load template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found at ${templatePath}`);
    }
  }

  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  async sendOtp(
    to: string,
    otp: string,
    type: 'verify' | 'reset',
    firstName?: string,
  ): Promise<EmailResponse> {
    const platformName =
      this.config.get<string>('PLATFORM_NAME') || 'CoachmeAI';
    const emailFrom =
      this.config.get<string>('EMAIL_FROM') || 'info@theskillgarage.com';

    // Choose template based on type
    const templateName =
      type === 'verify' ? 'verification-email' : 'reset-password';

    try {
      // Load template
      let template = await this.loadTemplate(templateName);

      template = this.replaceTemplateVariables(template, {
        otp,
        firstName: firstName || 'User',
        platformName,
        currentYear: new Date().getFullYear().toString(),
      });

      const subject =
        type === 'verify'
          ? `Verify your email - ${platformName}`
          : `Reset your password - ${platformName}`;

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${platformName}" <${emailFrom}>`,
        to,
        subject,
        html: template,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ ${type} email sent to ${to}: ${info.messageId}`);
      return info as EmailResponse;
    } catch (error) {
      console.error(`❌ Failed to send ${type} email:`, error);
      throw new Error(`Failed to send ${type} email`);
    }
  }

  // Optional: Send generic email with template
  async sendTemplateEmail(
    to: string,
    templateName: string,
    variables: Record<string, string>,
  ): Promise<EmailResponse> {
    try {
      let template = await this.loadTemplate(templateName);
      template = this.replaceTemplateVariables(template, variables);

      const platformName =
        this.config.get<string>('PLATFORM_NAME') || 'CoachmeAI';
      const emailFrom =
        this.config.get<string>('EMAIL_FROM') || 'noreply@coachmeai.com';

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${platformName}" <${emailFrom}>`,
        to,
        subject: variables.subject || `Message from ${platformName}`,
        html: template,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Template email sent to ${to}`);
      return info as EmailResponse;
    } catch (error) {
      console.error('❌ Failed to send template email:', error);
      throw error;
    }
  }
}
