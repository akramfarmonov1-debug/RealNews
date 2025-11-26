import type { ArticleWithCategory } from "@shared/schema";

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "Markdown";
  disable_web_page_preview?: boolean;
}

export class TelegramBot {
  private botToken: string;
  private chatId: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    this.chatId = process.env.TELEGRAM_CHAT_ID || "";
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    if (!this.botToken || !this.chatId) {
      console.warn("Telegram Bot not configured. TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing.");
    }
  }

  private isConfigured(): boolean {
    return !!(this.botToken && this.chatId);
  }

  private async sendRequest(method: string, data: TelegramMessage): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("Telegram Bot not configured, skipping message");
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${method}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Telegram API error: ${response.status} - ${errorText}`);
        return false;
      }

      const result = await response.json();
      return result.ok;
    } catch (error) {
      console.error("Error sending Telegram message:", error);
      return false;
    }
  }

  private formatArticleMessage(article: ArticleWithCategory, siteUrl: string = "https://realnews.uz"): string {
    const categoryIcon = this.getCategoryIcon(article.category.name);
    const articleUrl = `${siteUrl}/article/${article.slug}`;
    
    // Telegram HTML formatda xabar
    const message = `
${categoryIcon} <b>${article.category.name}</b>

<b>${article.title}</b>

${article.description ? article.description.substring(0, 200) + "..." : ""}

<a href="${articleUrl}">📖 To'liq o'qish</a>

<i>📅 ${this.formatDate(article.publishedAt)}</i>
<i>👁 ${article.views} ko'rishlar</i> • <i>❤️ ${article.likes} yoqtirish</i>

#${article.category.slug} #RealNews
`.trim();

    return message;
  }

  private getCategoryIcon(categoryName: string): string {
    const icons: Record<string, string> = {
      "O'zbekiston": "🇺🇿",
      "Dunyo": "🌍", 
      "Sport": "⚽",
      "Texnologiya": "💻",
      "Iqtisodiyot": "💰",
      "Madaniyat": "🎭",
      "Siyosat": "🏛"
    };
    return icons[categoryName] || "📰";
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  async sendArticle(article: ArticleWithCategory): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const message = this.formatArticleMessage(article);
    
    const telegramMessage: TelegramMessage = {
      chat_id: this.chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: false
    };

    const success = await this.sendRequest("sendMessage", telegramMessage);
    
    if (success) {
      console.log(`✅ Telegram'ga yuborildi: ${article.title}`);
    } else {
      console.error(`❌ Telegram'ga yuborishda xatolik: ${article.title}`);
    }
    
    return success;
  }

  async sendBreakingNews(article: ArticleWithCategory): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const message = `
🚨 <b>SHOSHILINCH YANGILIK!</b> 🚨

<b>${article.title}</b>

${article.description ? article.description.substring(0, 250) + "..." : ""}

<a href="https://realnews.uz/article/${article.slug}">📖 Batafsil ma'lumot</a>

#ShoshilinchYangilik #RealNews
`.trim();

    const telegramMessage: TelegramMessage = {
      chat_id: this.chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: false
    };

    const success = await this.sendRequest("sendMessage", telegramMessage);
    
    if (success) {
      console.log(`🚨 Shoshilinch yangilik Telegram'ga yuborildi: ${article.title}`);
    }
    
    return success;
  }

  async sendDailyStats(articlesCount: number, totalViews: number): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const message = `
📊 <b>KUNLIK HISOBOT</b>

📰 Bugun qo'shilgan yangiliklar: <b>${articlesCount}</b>
👀 Jami ko'rishlar: <b>${totalViews.toLocaleString()}</b>
📅 Sana: <b>${new Date().toLocaleDateString("uz-UZ")}</b>

🔥 Eng mashhur kategoriyalar:
• O'zbekiston yangilikları 
• Jahon yangilikları
• Sport yangilikları
• Texnologiya yangilikları

#KunlikHisobot #RealNewsStats
`.trim();

    const telegramMessage: TelegramMessage = {
      chat_id: this.chatId,
      text: message,
      parse_mode: "HTML"
    };

    return await this.sendRequest("sendMessage", telegramMessage);
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error("Telegram Bot not configured");
      return false;
    }

    const testMessage: TelegramMessage = {
      chat_id: this.chatId,
      text: `🤖 RealNews Bot test xabari - Bot muvaffaqiyatli ulandi!
      
📊 Konfiguratsiya:
Chat ID: ${this.chatId}
Vaqt: ${new Date().toLocaleString("uz-UZ")}

${this.chatId.startsWith("-100") ? "✅ Channel ID formati to'g'ri" : "⚠️ Bu shaxsiy chat yoki guruh ID'si"}`
    };

    const success = await this.sendRequest("sendMessage", testMessage);
    
    if (success) {
      console.log("✅ Telegram Bot muvaffaqiyatli ulandi!");
      console.log(`📍 Xabar yuborilgan chat: ${this.chatId}`);
    } else {
      console.error("❌ Telegram Bot ulanishida xatolik!");
    }
    
    return success;
  }
}

export const telegramBot = new TelegramBot();