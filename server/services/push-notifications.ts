import webpush from 'web-push';
import type { DbStorage } from '../db-storage';

export class PushNotificationService {
  private storage: DbStorage;
  
  constructor(storage: DbStorage) {
    this.storage = storage;
    this.setupWebPush();
  }

  private setupWebPush() {
    // VAPID kalitlari - production'da environment variable'lardan olinadi
    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NlQpHBJcHdnL2q0uYDLK5FE7s8-Y3KD0q8lzn5kNOGqXs8oBjGNjD8',
      privateKey: process.env.VAPID_PRIVATE_KEY || 'dUiDdw3fEg4mBFAiXvPONtHdC1Z0n-OUhWMPJ3l8SYc'
    };

    webpush.setVapidDetails(
      'mailto:admin@realnews.uz',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  }

  // Barcha aktiv obunachilarga xabar yuborish
  async sendToAllSubscribers(payload: {
    title: string;
    body: string;
    url?: string;
    icon?: string;
  }) {
    try {
      const subscriptions = await this.storage.getAllActivePushSubscriptions();
      
      const promises = subscriptions.map(async (subscription: any) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys as { p256dh: string; auth: string }
            },
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              url: payload.url || '/',
              icon: payload.icon || '/icon-192.png'
            })
          );
          console.log(`Push notification yuborildi: ${subscription.endpoint}`);
        } catch (error: any) {
          console.error(`Push notification yuborishda xatolik:`, error);
          
          // Agar obuna yaroqsiz bo'lsa, uni o'chirish
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.storage.deletePushSubscription(subscription.endpoint);
            console.log(`Yaroqsiz obuna o'chirildi: ${subscription.endpoint}`);
          }
        }
      });

      await Promise.all(promises);
      console.log(`${subscriptions.length} ta obunachiga xabar yuborildi`);
    } catch (error) {
      console.error('Push notification yuborishda xatolik:', error);
      throw error;
    }
  }

  // Shoshilinch yangilik uchun avtomatik xabar
  async sendBreakingNewsNotification(article: {
    title: string;
    description?: string;
    slug: string;
  }) {
    await this.sendToAllSubscribers({
      title: '🚨 Shoshilinch yangilik',
      body: article.title,
      url: `/article/${article.slug}`,
      icon: '/icon-192.png'
    });
  }

  // VAPID public key'ni olish (frontend uchun)
  getVapidPublicKey(): string {
    return process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NlQpHBJcHdnL2q0uYDLK5FE7s8-Y3KD0q8lzn5kNOGqXs8oBjGNjD8';
  }
}