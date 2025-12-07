import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/client/client';
import { UpdateWorkAuthDto } from './dto/work-authorization.dto';
import { UpdateDemographicsDto } from './dto/demographics.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';
import { UpdateAISettingsDto } from './dto/ai-settings.dto';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async getWorkAuth(userId: string) {
    const settings = await this.getAll(userId);
    return {
      authorizedRegions: settings.authorizedRegions,
      requiresSponsorship: settings.requiresSponsorship,
    };
  }

  async updateWorkAuth(userId: string, dto: UpdateWorkAuthDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  async getDemographics(userId: string) {
    const settings = await this.getAll(userId);
    return {
      gender: settings.gender,
      ethnicity: settings.ethnicity,
      veteranStatus: settings.veteranStatus,
      disabilityStatus: settings.disabilityStatus,
    };
  }

  async updateDemographics(userId: string, dto: UpdateDemographicsDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  async getAISettings(userId: string) {
    const settings = await this.getAll(userId);
    return {
      aiApplyEnabled: settings.aiApplyEnabled,
      applicationFrequency: settings.applicationFrequency,
      jobMatchThreshold: settings.jobMatchThreshold,
      autoFillEnabled: settings.autoFillEnabled,
      notifyBeforeAutoFill: settings.notifyBeforeAutoFill,
    };
  }

  async updateAISettings(userId: string, dto: UpdateAISettingsDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const updateData: Prisma.UserSettingsUpdateInput = {};
    const createData: Prisma.UserSettingsCreateInput = {
      user: { connect: { id: userId } },
    };

    // Work Authorization
    if (dto.workAuth) {
      const authData = {
        authorizedRegions: dto.workAuth.authorizedRegions || [],
        requiresSponsorship: dto.workAuth.requiresSponsorship,
      };
      Object.assign(updateData, authData);
      Object.assign(createData, authData);
    }

    // Demographics
    if (dto.demographics) {
      const demoData = {
        gender: dto.demographics.gender,
        ethnicity: dto.demographics.ethnicity || [],
        veteranStatus: dto.demographics.veteranStatus,
        disabilityStatus: dto.demographics.disabilityStatus,
      };
      Object.assign(updateData, demoData);
      Object.assign(createData, demoData);
    }

    // AI Settings
    if (dto.aiSettings) {
      const aiData = {
        aiApplyEnabled: dto.aiSettings.aiApplyEnabled,
        applicationFrequency: dto.aiSettings.applicationFrequency,
        jobMatchThreshold: dto.aiSettings.jobMatchThreshold,
        autoFillEnabled: dto.aiSettings.autoFillEnabled,
        notifyBeforeAutoFill: dto.aiSettings.notifyBeforeAutoFill,
      };
      Object.assign(updateData, aiData);
      Object.assign(createData, aiData);
    }

    return this.prisma.userSettings.upsert({
      where: { userId },
      create: createData,
      update: updateData,
    });
  }

  async getPreferences(userId: string) {
    const settings = await this.getAll(userId);
    return {
      autoApplyEnabled: settings.autoApplyEnabled,
      preferredJobTypes: settings.preferredJobTypes,
      preferredLocations: settings.preferredLocations,
      minSalary: settings.minSalary,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }
}
