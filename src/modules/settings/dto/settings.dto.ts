import { IsOptional } from 'class-validator';
import { UpdateWorkAuthDto } from './work-authorization.dto';
import { UpdateDemographicsDto } from './demographics.dto';
import { UpdatePreferencesDto } from './preferences.dto';
import { UpdateAISettingsDto } from './ai-settings.dto';

export class UpdateSettingsDto {
  @IsOptional()
  workAuth?: UpdateWorkAuthDto;

  @IsOptional()
  demographics?: UpdateDemographicsDto;

  @IsOptional()
  preferences?: UpdatePreferencesDto;

  @IsOptional()
  aiSettings?: UpdateAISettingsDto;
}
