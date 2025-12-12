import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { ApplicationStatusUpdatedEvent } from '../../events/application-status-updated.event';
import { InterviewScheduledEvent } from '../../events/interview-scheduled.event';
import { ProfileUpdatedEvent } from '../../events/profile-updated.event';
import { ApplicationCreatedEvent } from '../../events/application-created.event';
import { NotificationType } from '../../generated/client/client';

@Injectable()
export class NotificationListener {
  constructor(private notificationService: NotificationsService) {}

  @OnEvent('application.status.updated' as const)
  async handleApplicationStatusUpdated(event: ApplicationStatusUpdatedEvent) {
    await this.notificationService.createNotification({
      userId: event.userId,
      type: NotificationType.APPLICATION_UPDATE,
      title: 'Application Status Updated',
      message: 'Application Status was updated',
      priority: this.isPriorityStatus(event.newStatus) ? 'HIGH' : 'NORMAL',
      applicationId: event.applicationId,
      metadata: {
        companyName: event.company,
        positionName: event.position,
        newStatus: event.newStatus,
        oldStatus: event.oldStatus,
      },
    });
  }

  @OnEvent('interview.scheduled' as const)
  async handleInterviewScheduled(event: InterviewScheduledEvent) {
    await this.notificationService.createNotification({
      userId: event.userId,
      type: NotificationType.INTERVIEW_SCHEDULED,
      title: 'Interview Scheduled',
      message: 'Interview Scheduled',
      priority: 'HIGH',
      applicationId: event.applicationId,
      metadata: {
        companyName: event.company,
        positionName: event.title,
        interviewDate: event.interviewDate.toISOString(),
        location: event.location,
        interviewType: event.interviewType,
      },
    });
  }

  @OnEvent('profile.updated' as const)
  async handleProfileUpdated(event: ProfileUpdatedEvent) {
    await this.notificationService.createNotification({
      userId: event.userId,
      type: NotificationType.SYSTEM,
      title: 'Profile Updated',
      message: 'Profile Updated',
      priority: 'NORMAL',
      metadata: {
        message: 'Your profile has been updated successfully',
        updatedFields: event.updatedFields,
      },
    });
  }

  @OnEvent('application.created')
  async handleApplicationCreated(event: ApplicationCreatedEvent) {
    await this.notificationService.createNotification({
      userId: event.userId,
      type: NotificationType.APPLICATION_UPDATE,
      title: 'New Application Submitted',
      priority: 'NORMAL',
      message: 'New Application Submitted',
      applicationId: event.applicationId,
      metadata: {
        companyName: event.company,
        positionName: event.position,
        newStatus: 'APPLIED',
        oldStatus: null,
      },
    });
  }

  private isPriorityStatus(status: string): boolean {
    return ['INTERVIEW', 'OFFER', 'REJECTED', 'ACCEPTED'].includes(
      status.toUpperCase(),
    );
  }
}
