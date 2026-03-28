import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPushToken } from './push-token.entity';
import { NotificationEntity } from './notification.entity';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default';
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserPushToken)
    private readonly tokenRepo: Repository<UserPushToken>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  /**
   * Register or update an Expo push token for a user.
   */
  async registerToken(userId: string, token: string, platform?: string) {
    const existing = await this.tokenRepo.findOne({
      where: { userId, token },
    });

    if (!existing) {
      const newToken = this.tokenRepo.create({ userId, token, platform });
      await this.tokenRepo.save(newToken);
    }

    return { registered: true };
  }

  /**
   * Get all push tokens for a given user UUID.
   */
  async getTokensForUser(userId: string): Promise<string[]> {
    const tokens = await this.tokenRepo.find({ where: { userId } });
    return tokens.map((t) => t.token);
  }

  /**
   * Send push notifications to a list of Expo push tokens.
   */
  async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    if (!tokens || tokens.length === 0) return;

    const messages: ExpoPushMessage[] = tokens
      .filter((t) => t.startsWith('ExponentPushToken['))
      .map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
      }));

    if (messages.length === 0) return;

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      console.log('[Notifications] Push sent:', JSON.stringify(result));
    } catch (err) {
      console.error('[Notifications] Error sending push:', err);
    }
  }

  /**
   * Notify all devices of a specific user.
   */
  async notifyUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    // Save the notification in the database
    try {
      const notification = this.notificationRepo.create({
        userId,
        title,
        message: body,
        type: data?.type,
        data: data || {},
      });
      await this.notificationRepo.save(notification);
    } catch (dbErr) {
      console.error('[Notifications] Error saving notification to DB:', dbErr);
    }

    // Send push notification
    const tokens = await this.getTokensForUser(userId);
    await this.sendPushNotifications(tokens, title, body, data);
  }

  /**
   * Get all notifications for a specific user, ordered by creation date descending.
   */
  async getUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(id: string) {
    await this.notificationRepo.update(id, { isRead: true });
    return { success: true };
  }

  /**
   * Mark all notifications as read for a specific user.
   */
  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}
