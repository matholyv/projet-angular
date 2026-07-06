import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  async getMyNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getMyNotifications(userId);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: number, @Body('userId') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('read-all')
  async markAllAsRead(@Body('userId') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }
}
