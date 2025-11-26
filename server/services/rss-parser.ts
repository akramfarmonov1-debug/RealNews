import { parseStringPromise } from 'xml2js';
import { storage } from '../storage';
import { aiGenerator } from './ai-generator';
import { telegramBot } from './telegram-bot';
import type { InsertArticle } from '@shared/schema';

interface RssItem {
  title: string[];
  description?: string[];
  link: string[];
  pubDate: string[];
  'media:content'?: Array<{ $: { url: string } }>;
  enclosure?: Array<{ $: { url: string, type: string } }>;
}

interface RssChannel {
  title: string[];
  description?: string[];
  item: RssItem[];
}

interface RssFeed {
  rss: {
    channel: RssChannel[];
  };
}

export class RssParser {
  private async fetchFeedContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RealNews RSS Parser 1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Error fetching RSS feed from ${url}:`, error);
      throw error;
    }
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  }

  private extractImageUrl(item: RssItem): string | undefined {
    // Try to get image from media:content
    if (item['media:content'] && item['media:content'][0]) {
      const mediaContent = item['media:content'][0];
      if (mediaContent.$ && mediaContent.$.url) {
        return mediaContent.$.url;
      }
    }
    
    // Try to get image from media:thumbnail
    if (item['media:thumbnail'] && item['media:thumbnail'][0]) {
      const thumbnail = item['media:thumbnail'][0];
      if (thumbnail.$ && thumbnail.$.url) {
        return thumbnail.$.url;
      }
    }
    
    // Try to get image from enclosure
    if (item.enclosure && item.enclosure[0]) {
      const enclosure = item.enclosure[0];
      if (enclosure.$ && enclosure.$.url) {
        const type = enclosure.$.type || '';
        if (type.startsWith('image/') || enclosure.$.url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
          return enclosure.$.url;
        }
      }
    }
    
    // Try to extract image from content:encoded
    if (item['content:encoded'] && item['content:encoded'][0]) {
      const imgMatch = item['content:encoded'][0].match(/<img[^>]+src=["']([^"'>]+)["']/);
      if (imgMatch) {
        return imgMatch[1];
      }
    }
    
    // Try to extract image from description
    if (item.description && item.description[0]) {
      const imgMatch = item.description[0].match(/<img[^>]+src=["']([^"'>]+)["']/);
      if (imgMatch) {
        return imgMatch[1];
      }
    }
    
    // Default image for each category - placeholder
    return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop";
  }

  private cleanContent(content: string): string {
    // Remove HTML tags and normalize whitespace
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async parseFeed(feedUrl: string, categoryId: string, sourceName: string): Promise<InsertArticle[]> {
    try {
      const xmlContent = await this.fetchFeedContent(feedUrl);
      const parsed: RssFeed = await parseStringPromise(xmlContent);
      
      if (!parsed.rss?.channel?.[0]?.item) {
        console.warn(`No items found in RSS feed: ${feedUrl}`);
        return [];
      }
      
      const items = parsed.rss.channel[0].item.slice(0, 5); // Har feeddan max 5 ta maqola
      const articles: InsertArticle[] = [];
      
      for (const item of items) {
        if (!item.title?.[0] || !item.link?.[0]) {
          continue;
        }
        
        const title = this.cleanContent(item.title[0]);
        const slug = this.createSlug(title);
        const sourceUrl = item.link[0];
        
        // Check if article already exists by sourceUrl (more reliable than slug)
        const existingArticle = await storage.getArticleBySourceUrl(sourceUrl);
        if (existingArticle) {
          console.log(`Article already exists, skipping: ${sourceUrl}`);
          continue;
        }
        
        const description = item.description?.[0] 
          ? this.cleanContent(item.description[0]).substring(0, 300)
          : undefined;
        
        const content = item.description?.[0] 
          ? this.cleanContent(item.description[0])
          : undefined;
        
        // RSS feeddan rasm olish (Unsplash ishlatilmaydi)
        const imageUrl = this.extractImageUrl(item);
        
        // Attribution fields (RSS rasmlar uchun kerak emas)
        const imageAttribution: string | undefined = undefined;
        const imageAuthor: string | undefined = undefined;
        const imageAuthorUrl: string | undefined = undefined;
        
        const publishedAt = item.pubDate?.[0] 
          ? new Date(item.pubDate[0])
          : new Date();
        
        // AI orqali maqolani yaxshilash va tarjima qilish
        let enhancedArticle: { title: string; slug: string; description?: string; content?: string } = {
          title,
          slug,
          description,
          content
        };

        try {
          if (process.env.GEMINI_API_KEY && content && aiGenerator) {
            const category = await storage.getCategoryById(categoryId);
            if (category) {
              const enhanced = await aiGenerator.translateAndRewriteArticle(
                title,
                content,
                category
              );
              enhancedArticle = {
                title: enhanced.title,
                slug: enhanced.slug,
                description: enhanced.description,
                content: enhanced.content
              };
            }
          }
        } catch (error) {
          console.error("AI enhancement failed, using original content:", error);
        }

        const article: InsertArticle = {
          title: enhancedArticle.title,
          slug: enhancedArticle.slug,
          description: enhancedArticle.description,
          content: enhancedArticle.content,
          imageUrl,
          imageAttribution,
          imageAuthor,
          imageAuthorUrl,
          sourceUrl,
          sourceName,
          categoryId,
          publishedAt,
          isBreaking: "false",
          isFeatured: "false"
        };
        
        articles.push(article);
      }
      
      return articles;
      
    } catch (error) {
      console.error(`Error parsing RSS feed ${feedUrl}:`, error);
      return [];
    }
  }

  async fetchAllFeeds(): Promise<void> {
    const feeds = await storage.getActiveRssFeeds();
    
    for (const feed of feeds) {
      try {
        console.log(`Fetching RSS feed: ${feed.name}`);
        const articles = await this.parseFeed(feed.url, feed.categoryId, feed.name);
        
        for (const article of articles) {
          const createdArticle = await storage.createArticle(article);
          
          // Telegram kanaliga yuborish
          try {
            const fullArticle = await storage.getArticleById(createdArticle.id);
            if (fullArticle) {
              await telegramBot.sendArticle(fullArticle);
              
              // Agar breaking news bo'lsa, alohida yuborish
              if (fullArticle.isBreaking === "true") {
                await telegramBot.sendBreakingNews(fullArticle);
              }
            }
          } catch (error) {
            console.error(`Telegram'ga yuborishda xatolik: ${error}`);
          }
        }
        
        await storage.updateRssFeedLastFetched(feed.id);
        console.log(`Successfully processed ${articles.length} articles from ${feed.name}`);
        
      } catch (error) {
        console.error(`Failed to process RSS feed ${feed.name}:`, error);
      }
    }
  }
}

export const rssParser = new RssParser();
