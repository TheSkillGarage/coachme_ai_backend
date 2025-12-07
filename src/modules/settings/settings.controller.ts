import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateWorkAuthDto } from './dto/work-authorization.dto';
import { UpdateDemographicsDto } from './dto/demographics.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';
import { UpdateAISettingsDto } from './dto/ai-settings.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateSettingsDto } from './dto/settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  async getAll(@CurrentUser('id') userId: string) {
    return this.settings.getAll(userId);
  }

  @Put()
  async updateBulkSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settings.updateSettings(userId, dto);
  }

  @Get('work-auth')
  async getWorkAuth(@CurrentUser('id') userId: string) {
    return this.settings.getWorkAuth(userId);
  }

  @Put('work-auth')
  async updateWorkAuth(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateWorkAuthDto,
  ) {
    return this.settings.updateWorkAuth(userId, dto);
  }

  @Get('demographics')
  async getDemographics(@CurrentUser('id') userId: string) {
    return this.settings.getDemographics(userId);
  }

  @Put('demographics')
  async updateDemographics(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateDemographicsDto,
  ) {
    return this.settings.updateDemographics(userId, dto);
  }

  @Get('ai-settings')
  async getAISettings(@CurrentUser('id') userId: string) {
    return this.settings.getAISettings(userId);
  }

  @Put('ai-settings')
  async updateAISettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAISettingsDto,
  ) {
    return this.settings.updateAISettings(userId, dto);
  }

  @Get('preferences')
  async getPreferences(@CurrentUser('id') userId: string) {
    return this.settings.getPreferences(userId);
  }

  @Put('preferences')
  async updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.settings.updatePreferences(userId, dto);
  }
}
