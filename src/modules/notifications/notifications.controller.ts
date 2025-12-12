import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: GetNotificationsQueryDto,
  ) {
    const result = await this.notificationService.getNotifications(
      userId,
      query,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async getNotificationById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const notification = await this.notificationService.getNotificationById(
      userId,
      id,
    );

    return {
      success: true,
      data: notification,
    };
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const notification = await this.notificationService.markAsRead(userId, id);

    return {
      success: true,
      data: notification,
    };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  @Delete(':id')
  async deleteNotification(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.notificationService.deleteNotification(userId, id);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }
}
