import {
  Controller,
  Put,
  Body,
  UseGuards,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ApplicationStatus } from '@/generated/client/enums';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applications: ApplicationsService) {}

  @Post()
  async createApplication(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applications.createApplication(userId, dto);
  }

  @Put(':id/status')
  async updateApplicationStatus(
    @Param('id') applicationId: string,
    @CurrentUser('id') userId: string,
    @Query('status') status: ApplicationStatus,
  ) {
    return this.applications.updateApplicationStatus(
      applicationId,
      userId,
      status,
    );
  }

  @Put(':id/interview')
  async scheduleInterview(
    @Param('id') applicationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ScheduleInterviewDto,
  ) {
    return this.applications.scheduleInterview(applicationId, userId, dto);
  }
}
