import { NotificationType } from '../../../generated/client/client';
import { DateFormatter } from './date-formatter';
import { FieldFormatter } from './field-formatter';

interface NotificationMetadata {
  companyName?: string;
  positionName?: string;
  newStatus?: string;
  oldStatus?: string;
  interviewDate?: string;
  location?: string;
  interviewType?: string;
  message?: string;
  updatedFields?: string[];
}

export class NotificationDescriptionBuilder {
  build(notification: {
    type: NotificationType;
    title: string;
    data: unknown;
  }): string {
    const metadata = notification.data as NotificationMetadata;

    switch (notification.type) {
      case NotificationType.APPLICATION_UPDATE:
        return this.buildApplicationUpdate(metadata);

      case NotificationType.INTERVIEW_SCHEDULED:
        return this.buildInterviewScheduled(metadata);

      case NotificationType.SYSTEM:
        return this.buildSystem(metadata);

      default:
        return notification.title;
    }
  }

  private buildApplicationUpdate(metadata: NotificationMetadata): string {
    const position = metadata.positionName ?? 'unknown position';
    const company = metadata.companyName ?? 'unknown company';
    const status = metadata.newStatus?.toLowerCase() ?? 'new';

    return `Your application for ${position} at ${company} has moved to the ${status} stage.`;
  }

  private buildInterviewScheduled(metadata: NotificationMetadata): string {
    const company = metadata.companyName ?? 'unknown company';
    const position = metadata.positionName ?? 'unknown position';

    const interviewDate = metadata.interviewDate
      ? new Date(metadata.interviewDate)
      : null;

    const dateString = interviewDate
      ? DateFormatter.formatInterviewDate(interviewDate)
      : 'a scheduled time';

    return `Your interview with ${company} for ${position} position has been scheduled for ${dateString}.`;
  }

  private buildSystem(metadata: NotificationMetadata): string {
    if (metadata.updatedFields && metadata.updatedFields.length > 0) {
      const fieldList = FieldFormatter.formatFieldList(metadata.updatedFields);
      return `Your profile has been updated successfully. Updated fields: ${fieldList}`;
    }

    return metadata.message ?? 'System notification';
  }
}
