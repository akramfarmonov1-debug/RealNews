import { z } from "zod";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  console.warn("UNSPLASH_ACCESS_KEY not found. Image fetching will be disabled.");
}

interface UnsplashPhoto {
  id: string;
  urls: {
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description?: string;
  description?: string;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download_location: string;
  };
}

interface UnsplashImageData {
  imageUrl: string;
  attribution: string;
  author: string;
  authorUrl: string;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export class UnsplashService {
  private readonly baseUrl = "https://api.unsplash.com";
  private readonly accessKey: string;

  constructor() {
    this.accessKey = UNSPLASH_ACCESS_KEY || "";
  }

  private getHeaders() {
    return {
      "Authorization": `Client-ID ${this.accessKey}`,
      "Accept-Version": "v1"
    };
  }

  /**
   * Search for images based on a query string
   */
  async searchPhotos(query: string, count: number = 1): Promise<UnsplashPhoto[]> {
    if (!this.accessKey) {
      console.warn("Unsplash API key not configured");
      return [];
    }

    try {
      const url = new URL(`${this.baseUrl}/search/photos`);
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", count.toString());
      url.searchParams.set("orientation", "landscape");
      url.searchParams.set("content_filter", "high");

      const response = await fetch(url.toString(), {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data: UnsplashSearchResponse = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching from Unsplash:", error);
      return [];
    }
  }

  /**
   * Get image with attribution for an article based on its title and category
   */
  async getArticleImage(title: string, category: string): Promise<UnsplashImageData | null> {
    // Extract specific keywords from title
    const titleKeywords = this.extractKeywords(title);
    const categorySpecific = this.getCategorySpecificTerms(category);
    
    // Create diverse search queries with specific terms
    const searchQueries = [
      `${titleKeywords} ${categorySpecific}`,
      titleKeywords,
      `${category} ${titleKeywords}`,
      categorySpecific,
      `${category} professional`,
      category
    ].filter(query => query.length > 2);

    // Try each query and get multiple photos for variety
    for (const query of searchQueries) {
      const photos = await this.searchPhotos(query, 5); // Get 5 photos for variety
      if (photos.length > 0) {
        // Use random selection to avoid always picking the first photo
        const randomIndex = Math.floor(Math.random() * photos.length);
        const photo = photos[randomIndex];
        
        // Trigger download endpoint as required by Unsplash API
        await this.triggerDownload(photo.links.download_location);
        
        return {
          imageUrl: photo.urls.regular,
          attribution: `Photo by ${photo.user.name} on Unsplash`,
          author: photo.user.name,
          authorUrl: photo.user.links.html
        };
      }
    }

    return null;
  }

  /**
   * Trigger download endpoint as required by Unsplash API
   */
  private async triggerDownload(downloadLocation: string): Promise<void> {
    try {
      await fetch(downloadLocation, {
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error("Failed to trigger Unsplash download:", error);
    }
  }

  /**
   * Extract keywords from article title for better image matching
   */
  private extractKeywords(title: string): string {
    // Remove common Uzbek words and extract meaningful keywords
    const commonWords = ["va", "uchun", "bilan", "da", "ga", "ni", "ning", "dan", "bo'yicha", "haqida", "yilda", "yangi", "katta"];
    
    // Translation mapping for better English search results
    const translations: Record<string, string> = {
      "texnologiya": "technology",
      "sun'iy": "artificial",
      "intellekt": "intelligence",
      "sport": "sports",
      "chempionat": "championship",
      "o'zbek": "uzbek",
      "jahon": "world global",
      "iqtisodiyot": "economy business",
      "madaniyat": "culture",
      "festival": "festival",
      "park": "park building",
      "siyosat": "politics",
      "o'zbekiston": "uzbekistan"
    };
    
    const words = title.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !commonWords.includes(word))
      .map(word => translations[word] || word)
      .slice(0, 3); // Take first 3 meaningful words

    return words.join(" ");
  }

  /**
   * Get category-specific search terms for better image matching
   */
  private getCategorySpecificTerms(category: string): string {
    const categoryTerms: Record<string, string[]> = {
      "Iqtisodiyot": ["business", "finance", "economy", "money", "investment", "market"],
      "Sport": ["sports", "athlete", "competition", "fitness", "stadium", "training"],
      "Texnologiya": ["technology", "computer", "innovation", "digital", "software", "AI"],
      "Madaniyat": ["culture", "art", "traditional", "festival", "heritage", "music"],
      "O'zbekiston": ["uzbekistan", "tashkent", "architecture", "development", "building"],
      "Dunyo": ["world", "global", "international", "news", "countries"],
      "Siyosat": ["politics", "government", "policy", "leadership", "meeting"]
    };
    
    const terms = categoryTerms[category] || ["news"];
    const randomTerm = terms[Math.floor(Math.random() * terms.length)];
    return randomTerm;
  }

  /**
   * Get category-specific image with attribution for fallback
   */
  async getCategoryImage(categorySlug: string): Promise<UnsplashImageData | null> {
    const categoryMappings: Record<string, string[]> = {
      "ozbekiston": ["uzbekistan architecture", "tashkent cityscape", "uzbek building", "central asia"],
      "dunyo": ["world news", "global business", "international politics", "earth planet"],
      "sport": ["sports competition", "athlete training", "stadium crowd", "olympic games"], 
      "texnologiya": ["technology innovation", "computer programming", "digital transformation", "AI robotics"],
      "iqtisodiyot": ["business meeting", "economic growth", "financial market", "investment strategy"],
      "madaniyat": ["cultural festival", "traditional art", "museum exhibition", "heritage site"],
      "siyosat": ["political meeting", "government building", "leadership conference", "democracy"]
    };

    const queries = categoryMappings[categorySlug] || ["news"];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const photos = await this.searchPhotos(randomQuery, 3);
    
    if (photos.length > 0) {
      const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
      
      // Trigger download endpoint as required by Unsplash API
      await this.triggerDownload(randomPhoto.links.download_location);
      
      return {
        imageUrl: randomPhoto.urls.regular,
        attribution: `Photo by ${randomPhoto.user.name} on Unsplash`,
        author: randomPhoto.user.name,
        authorUrl: randomPhoto.user.links.html
      };
    }
    
    return null;
  }
}

export const unsplashService = new UnsplashService();