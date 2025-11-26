import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Service Worker'ni ro'yxatdan o'tkazish
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW muvaffaqiyatli ro\'yxatdan o\'tkazildi:', registration);
        
        // Yangilanishlarni tekshirish
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Yangi SW mavjud. Sahifani yangilang.');
                // Bu yerda foydalanuvchiga yangilanish haqida xabar berish mumkin
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW ro\'yxatdan o\'tkazishda xatolik:', error);
      });
  });
}
