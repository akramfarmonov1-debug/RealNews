import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface PushNotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // Brauzer push notifications'ni qo'llab-quvvatlaydimi tekshirish
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied'
    }));

    // Agar allaqachon obuna bo'lgan bo'lsa, tekshirish
    if (isSupported) {
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription
      }));
    } catch (error) {
      console.error('Obunani tekshirishda xatolik:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Brauzer push notifications\'ni qo\'llab-quvvatlamaydi' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({ 
        ...prev, 
        permission,
        isLoading: false 
      }));

      if (permission === 'granted') {
        return await subscribeToNotifications();
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Bildirishnomalar uchun ruxsat berilmadi' 
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Ruxsat so\'rashda xatolik yuz berdi' 
      }));
      return false;
    }
  };

  const subscribeToNotifications = async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Service Worker'ni kutish
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key'ni serverdan olish
      const response = await apiRequest('GET', '/api/push/vapid-key');
      const { publicKey } = await response.json();
      
      // Push obunasini yaratish
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Obunani serverga yuborish
      await apiRequest('/api/push/subscribe', 'POST', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        }
      });

      setState(prev => ({ 
        ...prev, 
        isSubscribed: true,
        isLoading: false 
      }));

      console.log('Push notifications uchun muvaffaqiyatli obuna bo\'ldingiz!');
      return true;

    } catch (error: any) {
      console.error('Obuna bo\'lishda xatolik:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Obuna bo\'lishda xatolik yuz berdi: ' + (error.message || 'Noma\'lum xatolik')
      }));
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        setState(prev => ({ 
          ...prev, 
          isSubscribed: false,
          isLoading: false 
        }));
        console.log('Push notifications dan muvaffaqiyatli obuna bekor qilindi');
        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return true;

    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Obunani bekor qilishda xatolik: ' + (error.message || 'Noma\'lum xatolik')
      }));
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    subscribe: subscribeToNotifications,
    unsubscribe
  };
}

// Yordamchi funksiyalar
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
}