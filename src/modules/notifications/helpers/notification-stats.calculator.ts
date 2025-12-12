import { PrismaService } from '@/prisma/prisma.service';
import { NotificationType } from '@/generated/client/client';

interface NotificationMetadata {
  interviewDate?: string;
}

export class NotificationStatsCalculator {
  private readonly INTERVIEW_REMINDER_WINDOW_DAYS = 2;

  constructor(private readonly prisma: PrismaService) {}

  async calculate(userId: string) {
    const [total, unread, highPriority, interviewReminders] = await Promise.all(
      [
        this.prisma.notification.count({ where: { userId } }),
        this.countUnread(userId),
        this.countHighPriority(userId),
        this.countUpcomingInterviewReminders(userId),
      ],
    );

    return {
      all: total,
      unread,
      highPriority,
      interviewReminders,
    };
  }

  private async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  private async countHighPriority(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, priority: 'HIGH', isRead: false },
    });
  }

  private async countUpcomingInterviewReminders(
    userId: string,
  ): Promise<number> {
    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(
      windowEnd.getDate() + this.INTERVIEW_REMINDER_WINDOW_DAYS,
    );

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        type: NotificationType.INTERVIEW_SCHEDULED,
        isRead: false,
      },
    });

    return notifications.filter((notification) => {
      const metadata = notification.data as NotificationMetadata;

      if (!metadata?.interviewDate) {
        return false;
      }

      const interviewDate = new Date(metadata.interviewDate);
      return interviewDate >= now && interviewDate <= windowEnd;
    }).length;
  }
}
