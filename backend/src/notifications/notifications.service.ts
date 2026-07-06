import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async createNotification(userId: string | null, title: string, message: string, type: string, link?: string): Promise<Notification | null> {
    const notification = this.notificationRepository.create({
      userId: userId as any,
      title,
      message,
      type,
      link
    });
    return this.notificationRepository.save(notification);
  }

  async getMyNotifications(userId: string): Promise<Notification[]> {
    // Get notifications where userId is the user's ID
    // Order by createdAt DESC
    return this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .take(50) // Limit to 50 recent notifications
      .getMany();
  }

  async markAsRead(id: number, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (notification && (notification.userId === userId || notification.userId === null)) {
      notification.isRead = true;
      return this.notificationRepository.save(notification);
    }
    return null;
  }
  
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId', { userId })
      .execute();
      
    // Global notifications can't easily be marked read per-user without a many-to-many relationship.
    // For now, marking all as read will only affect user-specific notifications.
  }
}
