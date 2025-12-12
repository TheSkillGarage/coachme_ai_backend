import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationWithApplication } from '../types/notification-with-application.type';
import { NotificationDescriptionBuilder } from './notification-description.builder';

export class NotificationMapper {
  private descriptionBuilder: NotificationDescriptionBuilder;

  constructor() {
    this.descriptionBuilder = new NotificationDescriptionBuilder();
  }

  toResponse(
    notification: NotificationWithApplication,
  ): NotificationResponseDto {
    return {
      id: notification.id,
      title: notification.title,
      description: this.descriptionBuilder.build(notification),
      priority: notification.priority,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      application: this.mapApplication(notification.application),
    };
  }

  private mapApplication(
    application: NotificationWithApplication['application'],
  ) {
    if (!application) {
      return null;
    }

    return {
      id: application.id,
      company: application.job.company,
      position: application.job.title,
      location: application.job.location,
      interviewDate: application.interviewDate ?? null,
    };
  }
}
