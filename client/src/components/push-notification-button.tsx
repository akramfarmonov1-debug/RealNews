import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useState } from "react";

export function PushNotificationButton() {
  const [showDialog, setShowDialog] = useState(false);
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    unsubscribe
  } = usePushNotifications();

  // Brauzer qo'llab-quvvatlamasa, hech narsa ko'rsatmaymiz
  if (!isSupported) {
    return null;
  }

  const handleSubscribe = async () => {
    const success = await requestPermission();
    if (success) {
      setShowDialog(false);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
  };

  // Agar allaqachon obuna bo'lgan bo'lsa, obunani bekor qilish tugmasini ko'rsatamiz
  if (isSubscribed && permission === 'granted') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnsubscribe}
        disabled={isLoading}
        className="flex items-center gap-2"
        data-testid="button-unsubscribe-notifications"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        Bildirishnomalarni o'chirish
      </Button>
    );
  }

  // Agar ruxsat berilmagan bo'lsa yoki obuna bo'lmagan bo'lsa
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          data-testid="button-enable-notifications"
        >
          <Bell className="h-4 w-4" />
          Bildirishnomalar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Bildirishnomalar
          </DialogTitle>
          <DialogDescription>
            Eng so'nggi yangiliklar va shoshilinch xabarlardan xabardor bo'ling
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Bildirishnomalarni yoqish orqali siz:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>🚨 Shoshilinch yangiliklar haqida darhol xabardor bo'lasiz</li>
              <li>📱 Muhim voqealarni o'tkazib yubormaysiz</li>
              <li>⚡ Eng tez yangiliklar manbaiga aylaning</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full"
              data-testid="button-subscribe-notifications"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obuna bo'lmoqda...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Bildirishnomalarni yoqish
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="w-full"
              data-testid="button-cancel-notifications"
            >
              Keyinroq
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              💡 <strong>Eslatma:</strong> Bildirishnomalarni istalgan vaqtda sozlamalarda o'chirib qo'yishingiz mumkin.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}