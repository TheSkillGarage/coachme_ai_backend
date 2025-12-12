import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/prisma/prisma.service';
import { ApplicationStatus } from '@/generated/client/enums';
import { ApplicationStatusUpdatedEvent } from '../../events/application-status-updated.event';
import { InterviewScheduledEvent } from '../../events/interview-scheduled.event';
import { ApplicationCreatedEvent } from '../../events/application-created.event';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createApplication(userId: string, createData: CreateApplicationDto) {
    const application = await this.prisma.application.create({
      data: {
        jobId: createData.jobId,
        userId,
      },
      include: {
        job: true,
      },
    });

    this.eventEmitter.emit(
      'application.created',
      new ApplicationCreatedEvent(
        userId,
        application.id,
        application.job.company,
        application.job.title,
        application.job.location,
      ),
    );

    return application;
  }

  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    newStatus: ApplicationStatus,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const oldStatus = application.status;

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    if (oldStatus !== newStatus) {
      this.eventEmitter.emit(
        'application.status.updated',
        new ApplicationStatusUpdatedEvent(
          userId,
          applicationId,
          application.job.company,
          application.job.title,
          oldStatus,
          newStatus,
        ),
      );
    }

    return updatedApplication;
  }

  async scheduleInterview(
    applicationId: string,
    userId: string,
    interviewData: ScheduleInterviewDto,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const interviewDate = new Date(interviewData.date);

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.INTERVIEW,
        interviewDate,
        interviewLocation: interviewData.location ?? null,
        interviewType: interviewData.type ?? null,
      },
    });

    this.eventEmitter.emit(
      'interview.scheduled',
      new InterviewScheduledEvent(
        userId,
        applicationId,
        application.job.company,
        application.job.title,
        interviewDate,
        interviewData.location ?? '',
        interviewData.type ?? '',
      ),
    );

    return updatedApplication;
  }
}
