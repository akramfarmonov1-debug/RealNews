import { type User, type InsertUser, type Article, type InsertArticle, type Category, type InsertCategory, type RssFeed, type InsertRssFeed, type Newsletter, type InsertNewsletter, type PushSubscription, type InsertPushSubscription, type ArticleWithCategory, type CategoryWithCount, type Story, type InsertStory, type StoryWithCategory, type StoryWithItems, type StoryItem, type InsertStoryItem } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoriesWithCount(): Promise<CategoryWithCount[]>;

  // Article methods
  getAllArticles(limit?: number, offset?: number): Promise<ArticleWithCategory[]>;
  getArticleById(id: string): Promise<ArticleWithCategory | undefined>;
  getArticleBySlug(slug: string): Promise<ArticleWithCategory | undefined>;
  getArticlesByCategory(categorySlug: string, limit?: number, offset?: number): Promise<ArticleWithCategory[]>;
  getFeaturedArticles(limit?: number): Promise<ArticleWithCategory[]>;
  getBreakingNews(limit?: number): Promise<ArticleWithCategory[]>;
  getTrendingArticles(limit?: number): Promise<ArticleWithCategory[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: string): Promise<void>;
  updateArticleLikes(id: string, increment: boolean): Promise<void>;
  searchArticles(query: string, limit?: number): Promise<ArticleWithCategory[]>;
  getArticleBySourceUrl(sourceUrl: string): Promise<ArticleWithCategory | undefined>;
  getRelatedArticles(slug: string, limit?: number): Promise<ArticleWithCategory[]>;

  // RSS Feed methods
  getAllRssFeeds(): Promise<RssFeed[]>;
  getActiveRssFeeds(): Promise<RssFeed[]>;
  createRssFeed(feed: InsertRssFeed): Promise<RssFeed>;
  updateRssFeedLastFetched(id: string): Promise<void>;

  // Newsletter methods
  createNewsletterSubscription(newsletter: InsertNewsletter): Promise<Newsletter>;
  getNewsletterByEmail(email: string): Promise<Newsletter | undefined>;
  getAllNewsletters(): Promise<Newsletter[]>;

  // Push Subscription methods
  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getAllActivePushSubscriptions(): Promise<PushSubscription[]>;
  deletePushSubscription(endpoint: string): Promise<void>;

  // Stories methods
  getAllStories(): Promise<StoryWithCategory[]>;
  getActiveStories(): Promise<StoryWithCategory[]>;
  getStoryById(id: string): Promise<StoryWithItems | undefined>;
  createStory(data: InsertStory): Promise<Story>;
  updateStory(id: string, data: Partial<InsertStory>): Promise<Story>;
  deleteStory(id: string): Promise<void>;
  incrementStoryViews(id: string): Promise<void>;

  // Story Items methods
  getStoryItems(storyId: string): Promise<StoryItem[]>;
  createStoryItem(data: InsertStoryItem): Promise<StoryItem>;
  updateStoryItem(id: string, data: Partial<InsertStoryItem>): Promise<StoryItem>;
  deleteStoryItem(id: string): Promise<void>;

  // Admin methods
  updateArticleFeatured(id: string, isFeatured: string): Promise<void>;
  updateArticleBreaking(id: string, isBreaking: string): Promise<void>;
  updateArticleImage(id: string, imageUrl: string): Promise<void>;
  updateArticleWithImage(id: string, imageUrl: string, imageAttribution?: string, imageAuthor?: string, imageAuthorUrl?: string): Promise<void>;
  updateArticle(id: string, data: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getCategoryById(id: string): Promise<Category | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private articles: Map<string, Article>;
  private rssFeeds: Map<string, RssFeed>;
  private newsletters: Map<string, Newsletter>;
  private pushSubscriptions: Map<string, PushSubscription>;
  private stories: Map<string, Story>;
  private storyItems: Map<string, StoryItem>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.rssFeeds = new Map();
    this.newsletters = new Map();
    this.pushSubscriptions = new Map();
    this.stories = new Map();
    this.storyItems = new Map();
    
    // Initialize with default categories
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create admin user first
    await this.initializeAdminUser();

    const defaultCategories = [
      { name: "O'zbekiston", slug: "ozbekiston", icon: "fas fa-flag", color: "#1a365d" },
      { name: "Dunyo", slug: "dunyo", icon: "fas fa-globe", color: "#2d3748" },
      { name: "Sport", slug: "sport", icon: "fas fa-futbol", color: "#16a085" },
      { name: "Texnologiya", slug: "texnologiya", icon: "fas fa-microchip", color: "#3182ce" },
      { name: "Iqtisodiyot", slug: "iqtisodiyot", icon: "fas fa-chart-line", color: "#d69e2e" },
      { name: "Madaniyat", slug: "madaniyat", icon: "fas fa-theater-masks", color: "#805ad5" },
      { name: "Siyosat", slug: "siyosat", icon: "fas fa-landmark", color: "#2b6cb0" }
    ];

    for (const categoryData of defaultCategories) {
      const category: Category = {
        id: randomUUID(),
        ...categoryData,
        createdAt: new Date()
      };
      this.categories.set(category.id, category);
    }

    // Initialize RSS feeds
    await this.initializeRSSFeeds();
    
    // Initialize sample articles
    await this.initializeSampleArticles();
  }

  private async initializeAdminUser() {
    // Create admin user with hashed password
    const hashedPassword = await bcrypt.hash("Gisobot201415*", 12);
    
    const adminUser: User = {
      id: randomUUID(),
      username: "Akramjon",
      email: "admin@realnews.uz",
      password: hashedPassword,
      role: "admin",
      isActive: "true",
      createdAt: new Date()
    };

    this.users.set(adminUser.id, adminUser);
    console.log("Admin user created: username = Akramjon");
  }

  private async initializeRSSFeeds() {
    const rssFeeds = [
      // O'zbekiston
      { url: "https://kun.uz/rss", name: "Kun.uz", categorySlug: "ozbekiston" },
      { url: "https://uza.uz/rss", name: "UzA", categorySlug: "ozbekiston" },
      { url: "https://daryo.uz/rss", name: "Daryo.uz", categorySlug: "ozbekiston" },
      
      // Dunyo (working RSS feeds)
      { url: "https://feeds.skynews.com/feeds/rss/world.xml", name: "Sky News World", categorySlug: "dunyo" },
      { url: "https://feeds.reuters.com/reuters/worldNews", name: "Reuters World", categorySlug: "dunyo" },
      
      // Sport
      { url: "https://www.championat.com/rss/news.xml", name: "Championat.com", categorySlug: "sport" },
      { url: "https://sport24.ru/rss/news.xml", name: "Sport24", categorySlug: "sport" },
      
      // Texnologiya
      { url: "https://feeds.techcrunch.com/TechCrunch/", name: "TechCrunch", categorySlug: "texnologiya" },
      { url: "https://feeds.reuters.com/reuters/technologyNews", name: "Reuters Tech", categorySlug: "texnologiya" },
      
      // Iqtisodiyot
      { url: "https://www.reuters.com/arc/outboundfeeds/rss/tag/business-news/?outputType=xml", name: "Reuters Business", categorySlug: "iqtisodiyot" },
      { url: "https://feeds.finance.yahoo.com/rss/2.0/headline", name: "Yahoo Finance", categorySlug: "iqtisodiyot" }
    ];

    for (const feedData of rssFeeds) {
      const category = Array.from(this.categories.values()).find(cat => cat.slug === feedData.categorySlug);
      if (category) {
        const feed: RssFeed = {
          id: randomUUID(),
          url: feedData.url,
          name: feedData.name,
          categoryId: category.id,
          isActive: "true",
          lastFetchedAt: null,
          createdAt: new Date()
        };
        this.rssFeeds.set(feed.id, feed);
      }
    }
  }

  private async initializeSampleArticles() {
    const sampleArticles = [
      {
        title: "O'zbekistonda yangi texnologik park ochildi",
        slug: "ozbekistonda-yangi-texnologik-park-ochildi",
        description: "Toshkent shahridagi yangi texnologik parkda 1000 dan ortiq mutaxassis ishlay oladi va yiliga 500 million dollar daromad keltirishi kutilmoqda.",
        content: "O'zbekiston Respublikasi Prezidenti Shavkat Mirziyoyev ishtirokida Toshkent shahrida yangi texnologik park tantanali ravishda ochildi. Park zamonaviy texnologiyalar va startaplarni rivojlantirish uchun mo'ljallangan. Parkda 50 dan ortiq xorijiy kompaniya o'z faoliyatini boshlaydi. Bu loyiha mamlakatda IT sohasini yanada rivojlantirishga va yoshlar bandligini ta'minlashga xizmat qiladi.",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        sourceUrl: "https://kun.uz/news/2024/12/08/texnopark-ochildi",
        sourceName: "Kun.uz",
        categorySlug: "ozbekiston",
        isBreaking: "true",
        isFeatured: "true"
      },
      {
        title: "Jahon chempionatida o'zbek sportchilari yuqori natijalar ko'rsatmoqda",
        slug: "jahon-chempionatida-ozbek-sportchilari-yuqori-natijalar",
        description: "Tokioda bo'lib o'tgan jahon chempionatida O'zbekiston terma jamoasi 5 ta medal qo'lga kiritdi.",
        content: "O'zbekiston milliy kurash terma jamoasi Tokioda bo'lib o'tgan jahon chempionatida ajoyib natijalar ko'rsatdi. Jamoamiz 2 ta oltin, 2 ta kumush va 1 ta bronza medal qo'lga kiritdi. Bu natija mamlakatimiz sport tarixidagi eng yaxshi ko'rsatkichlardan biri hisoblanadi.",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        sourceUrl: "https://sport.uz/wrestling-championship",
        sourceName: "Sport.uz",
        categorySlug: "sport",
        isBreaking: "false",
        isFeatured: "true"
      },
      {
        title: "Sun'iy intellekt texnologiyalari kelajak yilida yanada rivojlanadi",
        slug: "suniy-intellekt-texnologiyalari-kelajak-yilida-rivojlanadi",
        description: "Mutaxassislarning fikricha, 2024 yilda AI texnologiyalari har sohadagi ishlarni avtomatlashtiradi.",
        content: "Texnologiya ekspertlari 2024 yilda sun'iy intellekt sohasida katta yutuqlarga erishilishini bashorat qilmoqda. ChatGPT va boshqa AI tizimlari yanada mukammal bo'lib, ta'lim, tibbiyot va biznes sohalarida keng qo'llaniladi. Bu esa mehnat bozorida katta o'zgarishlar olib kelishi mumkin.",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        sourceUrl: "https://techuz.com/ai-2024",
        sourceName: "TechUz",
        categorySlug: "texnologiya",
        isBreaking: "false",
        isFeatured: "false"
      },
      {
        title: "Jahon iqtisodiyoti 2024 yilda barqaror o'sish ko'rsatadi",
        slug: "jahon-iqtisodiyoti-2024-yilda-barqaror-osish",
        description: "Xalqaro Valyuta Jamg'armasi prognoziga ko'ra, jahon iqtisodiyoti keyingi yilda 3.1% o'sadi.",
        content: "Xalqaro Valyuta Jamg'armasi (XVJ) 2024 yil uchun jahon iqtisodiyoti bo'yicha optimistik prognoz e'lon qildi. Mutaxassislarning fikricha, global iqtisodiyot 3.1% o'sish ko'rsatadi. Bu o'sishda rivojlanayotgan mamlakatlar, jumladan O'zbekiston ham muhim rol o'ynaydi.",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        sourceUrl: "https://economy.uz/global-growth",
        sourceName: "Economy.uz",
        categorySlug: "iqtisodiyot",
        isBreaking: "false",
        isFeatured: "false"
      },
      {
        title: "O'zbek madaniyati xalqaro festivalda e'tirof etildi",
        slug: "ozbek-madaniyati-xalqaro-festivalda-etirof-etildi",
        description: "Parij shahrida bo'lib o'tgan xalqaro madaniyat festivalida O'zbekiston pavilyoni eng yaxshi deb topildi.",
        content: "Fransiyaning Parij shahrida bo'lib o'tgan xalqaro madaniyat festivalida O'zbekiston pavilyoni katta e'tiborga sazovor bo'ldi. Milliy hunarmandchilik namunalari, an'anaviy taomlar va folklor san'ati mehmonlar orasida katta qiziqish uyg'otdi. Festival davomida 100 mingdan ortiq kishi O'zbekiston pavilyonini ziyorat qildi.",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        sourceUrl: "https://madaniyat.uz/paris-festival",
        sourceName: "Madaniyat.uz",
        categorySlug: "madaniyat",
        isBreaking: "false",
        isFeatured: "false"
      }
    ];

    for (const articleData of sampleArticles) {
      const category = Array.from(this.categories.values()).find(cat => cat.slug === articleData.categorySlug);
      if (category) {
        const article: Article = {
          id: randomUUID(),
          title: articleData.title,
          slug: articleData.slug,
          description: articleData.description || null,
          content: articleData.content || null,
          imageUrl: articleData.imageUrl ?? null,
          imageAttribution: null, // Will be updated with Unsplash data
          imageAuthor: null,
          imageAuthorUrl: null,
          sourceUrl: articleData.sourceUrl,
          sourceName: articleData.sourceName,
          categoryId: category.id,
          publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3), // Last 3 days
          createdAt: new Date(),
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 50) + 10,
          isBreaking: articleData.isBreaking,
          isFeatured: articleData.isFeatured
        };
        this.articles.set(article.id, article);
      }
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      ...insertCategory,
      createdAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }

  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const categories = Array.from(this.categories.values());
    return categories.map(category => ({
      ...category,
      articleCount: Array.from(this.articles.values()).filter(article => article.categoryId === category.id).length
    }));
  }

  // Article methods
  async getAllArticles(limit = 20, offset = 0): Promise<ArticleWithCategory[]> {
    const articles = Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);
    
    return this.enrichArticlesWithCategories(articles);
  }

  async getArticleById(id: string): Promise<ArticleWithCategory | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const enriched = await this.enrichArticlesWithCategories([article]);
    return enriched[0];
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithCategory | undefined> {
    const article = Array.from(this.articles.values()).find(a => a.slug === slug);
    if (!article) return undefined;
    
    const enriched = await this.enrichArticlesWithCategories([article]);
    return enriched[0];
  }

  async getArticlesByCategory(categorySlug: string, limit = 20, offset = 0): Promise<ArticleWithCategory[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];

    const articles = Array.from(this.articles.values())
      .filter(article => article.categoryId === category.id)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);

    return this.enrichArticlesWithCategories(articles);
  }

  async getFeaturedArticles(limit = 5): Promise<ArticleWithCategory[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.isFeatured === "true")
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);

    return this.enrichArticlesWithCategories(articles);
  }

  async getBreakingNews(limit = 5): Promise<ArticleWithCategory[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.isBreaking === "true")
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);

    return this.enrichArticlesWithCategories(articles);
  }

  async getTrendingArticles(limit = 5): Promise<ArticleWithCategory[]> {
    const articles = Array.from(this.articles.values())
      .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
      .slice(0, limit);

    return this.enrichArticlesWithCategories(articles);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = {
      id,
      ...insertArticle,
      description: insertArticle.description ?? null,
      content: insertArticle.content ?? null,
      imageUrl: insertArticle.imageUrl ?? null,
      imageAttribution: insertArticle.imageAttribution ?? null,
      imageAuthor: insertArticle.imageAuthor ?? null,
      imageAuthorUrl: insertArticle.imageAuthorUrl ?? null,
      isBreaking: insertArticle.isBreaking ?? "false",
      isFeatured: insertArticle.isFeatured ?? "false",
      createdAt: new Date(),
      views: 0,
      likes: 0
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticleViews(id: string): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.articles.set(id, article);
    }
  }

  async updateArticleLikes(id: string, increment: boolean): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.likes = (article.likes || 0) + (increment ? 1 : -1);
      this.articles.set(id, article);
    }
  }

  async searchArticles(query: string, limit = 20): Promise<ArticleWithCategory[]> {
    const lowercaseQuery = query.toLowerCase();
    const articles = Array.from(this.articles.values())
      .filter(article => 
        article.title.toLowerCase().includes(lowercaseQuery) ||
        article.description?.toLowerCase().includes(lowercaseQuery) ||
        article.content?.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);

    return this.enrichArticlesWithCategories(articles);
  }

  async getArticleBySourceUrl(sourceUrl: string): Promise<ArticleWithCategory | undefined> {
    const article = Array.from(this.articles.values()).find(a => a.sourceUrl === sourceUrl);
    if (!article) return undefined;
    
    const enriched = await this.enrichArticlesWithCategories([article]);
    return enriched[0];
  }

  async getRelatedArticles(slug: string, limit = 3): Promise<ArticleWithCategory[]> {
    const currentArticle = Array.from(this.articles.values()).find(a => a.slug === slug);
    if (!currentArticle) return [];

    // Find articles in the same category, excluding the current article
    const relatedArticles = Array.from(this.articles.values())
      .filter(article => 
        article.categoryId === currentArticle.categoryId && 
        article.id !== currentArticle.id
      )
      .sort((a, b) => {
        // Sort by combination of views and likes (engagement score)
        const scoreA = (a.views || 0) + (a.likes || 0) * 2;
        const scoreB = (b.views || 0) + (b.likes || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return this.enrichArticlesWithCategories(relatedArticles);
  }

  private async enrichArticlesWithCategories(articles: Article[]): Promise<ArticleWithCategory[]> {
    return articles.map(article => {
      const category = this.categories.get(article.categoryId);
      return {
        ...article,
        category: category!
      };
    });
  }

  // RSS Feed methods
  async getAllRssFeeds(): Promise<RssFeed[]> {
    return Array.from(this.rssFeeds.values());
  }

  async getActiveRssFeeds(): Promise<RssFeed[]> {
    return Array.from(this.rssFeeds.values()).filter(feed => feed.isActive === "true");
  }

  async createRssFeed(insertFeed: InsertRssFeed): Promise<RssFeed> {
    const id = randomUUID();
    const feed: RssFeed = {
      id,
      ...insertFeed,
      isActive: insertFeed.isActive || "true",
      createdAt: new Date(),
      lastFetchedAt: null
    };
    this.rssFeeds.set(id, feed);
    return feed;
  }

  async updateRssFeedLastFetched(id: string): Promise<void> {
    const feed = this.rssFeeds.get(id);
    if (feed) {
      feed.lastFetchedAt = new Date();
      this.rssFeeds.set(id, feed);
    }
  }

  // Newsletter methods
  async createNewsletterSubscription(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const id = randomUUID();
    const newsletter: Newsletter = {
      id,
      ...insertNewsletter,
      isActive: insertNewsletter.isActive || "true",
      createdAt: new Date()
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  async getNewsletterByEmail(email: string): Promise<Newsletter | undefined> {
    return Array.from(this.newsletters.values()).find(newsletter => newsletter.email === email);
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values());
  }

  // Admin methods
  async updateArticleFeatured(id: string, isFeatured: string): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.isFeatured = isFeatured;
      this.articles.set(id, article);
    }
  }

  async updateArticleBreaking(id: string, isBreaking: string): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.isBreaking = isBreaking;
      this.articles.set(id, article);
    }
  }

  async updateArticleImage(id: string, imageUrl: string): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.imageUrl = imageUrl;
      this.articles.set(id, article);
    }
  }

  async updateArticleWithImage(
    id: string, 
    imageUrl: string, 
    imageAttribution?: string, 
    imageAuthor?: string, 
    imageAuthorUrl?: string
  ): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.imageUrl = imageUrl;
      article.imageAttribution = imageAttribution || null;
      article.imageAuthor = imageAuthor || null;
      article.imageAuthorUrl = imageAuthorUrl || null;
      this.articles.set(id, article);
    }
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  // Push Subscription methods
  async createPushSubscription(insertSubscription: InsertPushSubscription): Promise<PushSubscription> {
    const id = randomUUID();
    const subscription: PushSubscription = {
      id,
      ...insertSubscription,
      isActive: insertSubscription.isActive || "true",
      userAgent: insertSubscription.userAgent || null,
      createdAt: new Date()
    };
    this.pushSubscriptions.set(id, subscription);
    return subscription;
  }

  async getAllActivePushSubscriptions(): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values()).filter(sub => sub.isActive === "true");
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    for (const [id, subscription] of Array.from(this.pushSubscriptions.entries())) {
      if (subscription.endpoint === endpoint) {
        this.pushSubscriptions.delete(id);
        break;
      }
    }
  }

  // Stories methods
  async getAllStories(): Promise<StoryWithCategory[]> {
    const storiesArray = Array.from(this.stories.values());
    return storiesArray.map(story => ({
      ...story,
      category: story.categoryId ? this.categories.get(story.categoryId) : undefined,
      itemCount: Array.from(this.storyItems.values()).filter(item => item.storyId === story.id).length
    }));
  }

  async getActiveStories(): Promise<StoryWithCategory[]> {
    const now = new Date();
    const allStories = await this.getAllStories();
    return allStories.filter(story => 
      story.isActive === "true" && 
      (!story.expiresAt || new Date(story.expiresAt) > now)
    ).sort((a, b) => a.order - b.order);
  }

  async getStoryById(id: string): Promise<StoryWithItems | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const items = Array.from(this.storyItems.values())
      .filter(item => item.storyId === id)
      .sort((a, b) => a.order - b.order);

    return {
      ...story,
      category: story.categoryId ? this.categories.get(story.categoryId) : undefined,
      items
    };
  }

  async createStory(data: InsertStory): Promise<Story> {
    const id = randomUUID();
    const story: Story = {
      id,
      ...data,
      isActive: data.isActive || "true",
      order: data.order || 0,
      viewCount: 0,
      createdAt: new Date()
    };
    this.stories.set(id, story);
    return story;
  }

  async updateStory(id: string, data: Partial<InsertStory>): Promise<Story> {
    const story = this.stories.get(id);
    if (!story) throw new Error("Story not found");

    const updatedStory = { ...story, ...data };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: string): Promise<void> {
    this.stories.delete(id);
    // Delete all story items as well
    for (const [itemId, item] of Array.from(this.storyItems.entries())) {
      if (item.storyId === id) {
        this.storyItems.delete(itemId);
      }
    }
  }

  async incrementStoryViews(id: string): Promise<void> {
    const story = this.stories.get(id);
    if (story) {
      story.viewCount = (story.viewCount || 0) + 1;
      this.stories.set(id, story);
    }
  }

  // Story Items methods
  async getStoryItems(storyId: string): Promise<StoryItem[]> {
    return Array.from(this.storyItems.values())
      .filter(item => item.storyId === storyId)
      .sort((a, b) => a.order - b.order);
  }

  async createStoryItem(data: InsertStoryItem): Promise<StoryItem> {
    const id = randomUUID();
    const item: StoryItem = {
      id,
      ...data,
      type: data.type || "image",
      duration: data.duration || 5,
      order: data.order || 0,
      createdAt: new Date()
    };
    this.storyItems.set(id, item);
    return item;
  }

  async updateStoryItem(id: string, data: Partial<InsertStoryItem>): Promise<StoryItem> {
    const item = this.storyItems.get(id);
    if (!item) throw new Error("Story item not found");

    const updatedItem = { ...item, ...data };
    this.storyItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteStoryItem(id: string): Promise<void> {
    this.storyItems.delete(id);
  }

  // Article admin methods
  async updateArticle(id: string, data: Partial<InsertArticle>): Promise<Article> {
    const article = this.articles.get(id);
    if (!article) throw new Error("Article not found");

    const updatedArticle = { ...article, ...data };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    this.articles.delete(id);
  }
}

export const storage = new MemStorage();
