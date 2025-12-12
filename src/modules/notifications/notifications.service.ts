import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { NotificationType, Prisma } from '../../generated/client/client';
import { NotificationMapper } from './helpers/notification-mapper';
import { NotificationStatsCalculator } from './helpers/notification-stats.calculator';
import { PaginationBuilder } from './helpers/pagination.builder';

@Injectable()
export class NotificationsService {
  private readonly mapper: NotificationMapper;
  private readonly statsCalculator: NotificationStatsCalculator;

  constructor(private readonly prisma: PrismaService) {
    this.mapper = new NotificationMapper();
    this.statsCalculator = new NotificationStatsCalculator(prisma);
  }

  async getNotifications(userId: string, query: GetNotificationsQueryDto) {
    const { page = 1, limit = 20, type, isRead, priority } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead }),
      ...(priority && { priority }),
    };

    const [notifications, stats] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            include: {
              job: true,
            },
          },
        },
      }),
      this.statsCalculator.calculate(userId),
    ]);

    return {
      notifications: notifications.map((n) => this.mapper.toResponse(n)),
      pagination: PaginationBuilder.build(stats.all, page, limit),
      stats,
    };
  }

  async getNotificationById(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
      include: {
        application: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.isRead) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return this.mapper.toResponse(notification);
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    priority?: 'NORMAL' | 'HIGH';
    applicationId?: string;
    metadata?: Record<string, unknown>;
    message?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        priority: data.priority ?? 'NORMAL',
        applicationId: data.applicationId,
        data: (data.metadata ?? {}) as Prisma.InputJsonValue,
        message: data.message ?? '',
      },
    });
  }
}
