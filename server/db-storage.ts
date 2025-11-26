import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, asc, like, and, or, sql } from 'drizzle-orm';
import { 
  users, categories, articles, rssFeeds, newsletters, pushSubscriptions, stories, storyItems,
  type User, type InsertUser, 
  type Article, type InsertArticle, 
  type Category, type InsertCategory, 
  type RssFeed, type InsertRssFeed, 
  type Newsletter, type InsertNewsletter,
  type PushSubscription, type InsertPushSubscription,
  type Story, type InsertStory,
  type StoryItem, type InsertStoryItem,
  type ArticleWithCategory, type CategoryWithCount,
  type StoryWithItems, type StoryWithCategory
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await this.db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const result = await this.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
        color: categories.color,
        createdAt: categories.createdAt,
        articleCount: sql<number>`cast(count(${articles.id}) as int)`
      })
      .from(categories)
      .leftJoin(articles, eq(categories.id, articles.categoryId))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));
    
    return result;
  }

  // Article methods
  async getAllArticles(limit = 20, offset = 0): Promise<ArticleWithCategory[]> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.article,
      category: row.category
    }));
  }

  async getArticleById(id: string): Promise<ArticleWithCategory | undefined> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.id, id));

    if (!result[0]) return undefined;
    
    return {
      ...result[0].article,
      category: result[0].category
    };
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithCategory | undefined> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.slug, slug));

    if (!result[0]) return undefined;
    
    return {
      ...result[0].article,
      category: result[0].category
    };
  }

  async getArticlesByCategory(categorySlug: string, limit = 20, offset = 0): Promise<ArticleWithCategory[]> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(categories.slug, categorySlug))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.article,
      category: row.category
    }));
  }

  async getFeaturedArticles(limit = 5): Promise<ArticleWithCategory[]> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.isFeatured, "true"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    return result.map(row => ({
      ...row.article,
      category: row.category
    }));
  }

  async getBreakingNews(limit = 5): Promise<ArticleWithCategory[]> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.isBreaking, "true"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    return result.map(row => ({
      ...row.article,
      category: row.category
    }));
  }

  async getTrendingArticles(limit = 5): Promise<ArticleWithCategory[]> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .orderBy(desc(sql`${articles.views} + ${articles.likes}`))
      .limit(limit);

    return result.map(row => ({
      ...row.article,
      category: row.category
    }));
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const result = await this.db.insert(articles).values(insertArticle).returning();
    return result[0];
  }

  async updateArticleViews(id: string): Promise<void> {
    await this.db
      .update(articles)
      .set({ views: sql`${articles.views} + 1` })
      .where(eq(articles.id, id));
  }

  async updateArticleLikes(id: string, increment: boolean): Promise<void> {
    const operation = increment ? sql`${articles.likes} + 1` : sql`${articles.likes} - 1`;
    await this.db
      .update(articles)
      .set({ likes: operation })
      .where(eq(articles.id, id));
  }

  async searchArticles(query: string, limit = 20): Promise<ArticleWithCategory[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        or(
          like(sql`lower(${articles.title})`, searchTerm),
          like(sql`lower(${articles.description})`, searchTerm),
          like(sql`lower(${articles.content})`, searchTerm)
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    return result.map(row => ({
      ...row.article,
      category: row.category
    }));
  }

  async getArticleBySourceUrl(sourceUrl: string): Promise<ArticleWithCategory | undefined> {
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.sourceUrl, sourceUrl));

    if (!result[0]) return undefined;
    
    return {
      ...result[0].article,
      category: result[0].category
    };
  }

  async getRelatedArticles(slug: string, limit = 3): Promise<ArticleWithCategory[]> {
    // First get the current article to find its category
    const currentArticle = await this.db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug));

    if (!currentArticle[0]) return [];

    // Find related articles in the same category, excluding the current article
    const result = await this.db
      .select({
        article: articles,
        category: categories
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articles.categoryId, currentArticle[0].categoryId),
          sql`${articles.id} != ${currentArticle[0].id}`
        )
      )
      .orderBy(desc(sql`${articles.views} + ${articles.likes} * 2`))
      .limit(limit);

    return result.map(row => ({
      ...row.article,
      category: row.category
    }));
  }

  // RSS Feed methods
  async getAllRssFeeds(): Promise<RssFeed[]> {
    return await this.db.select().from(rssFeeds).orderBy(asc(rssFeeds.name));
  }

  async getActiveRssFeeds(): Promise<RssFeed[]> {
    return await this.db
      .select()
      .from(rssFeeds)
      .where(eq(rssFeeds.isActive, "true"))
      .orderBy(asc(rssFeeds.name));
  }

  async createRssFeed(insertFeed: InsertRssFeed): Promise<RssFeed> {
    const result = await this.db.insert(rssFeeds).values(insertFeed).returning();
    return result[0];
  }

  async updateRssFeedLastFetched(id: string): Promise<void> {
    await this.db
      .update(rssFeeds)
      .set({ lastFetchedAt: new Date() })
      .where(eq(rssFeeds.id, id));
  }

  // Newsletter methods
  async createNewsletterSubscription(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const result = await this.db.insert(newsletters).values(insertNewsletter).returning();
    return result[0];
  }

  async getNewsletterByEmail(email: string): Promise<Newsletter | undefined> {
    const result = await this.db.select().from(newsletters).where(eq(newsletters.email, email));
    return result[0];
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return await this.db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  // Admin methods
  async updateArticleFeatured(id: string, isFeatured: string): Promise<void> {
    await this.db
      .update(articles)
      .set({ isFeatured })
      .where(eq(articles.id, id));
  }

  async updateArticleBreaking(id: string, isBreaking: string): Promise<void> {
    await this.db
      .update(articles)
      .set({ isBreaking })
      .where(eq(articles.id, id));
  }

  async updateArticleImage(id: string, imageUrl: string): Promise<void> {
    await this.db
      .update(articles)
      .set({ imageUrl })
      .where(eq(articles.id, id));
  }

  async updateArticleWithImage(
    id: string, 
    imageUrl: string, 
    imageAttribution?: string, 
    imageAuthor?: string, 
    imageAuthorUrl?: string
  ): Promise<void> {
    await this.db
      .update(articles)
      .set({ 
        imageUrl,
        imageAttribution: imageAttribution || null,
        imageAuthor: imageAuthor || null,
        imageAuthorUrl: imageAuthorUrl || null
      })
      .where(eq(articles.id, id));
  }

  // Push Subscription methods
  async createPushSubscription(insertSubscription: InsertPushSubscription): Promise<PushSubscription> {
    const result = await this.db.insert(pushSubscriptions).values(insertSubscription).returning();
    return result[0];
  }

  async getAllActivePushSubscriptions(): Promise<PushSubscription[]> {
    return await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.isActive, "true"))
      .orderBy(desc(pushSubscriptions.createdAt));
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await this.db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }

  // Stories methods
  async getAllStories(): Promise<StoryWithCategory[]> {
    const result = await this.db
      .select({
        story: stories,
        category: categories,
        itemCount: sql<number>`cast(count(${storyItems.id}) as int)`
      })
      .from(stories)
      .leftJoin(categories, eq(stories.categoryId, categories.id))
      .leftJoin(storyItems, eq(stories.id, storyItems.storyId))
      .groupBy(stories.id, categories.id)
      .orderBy(desc(stories.createdAt));

    return result.map(row => ({
      ...row.story,
      category: row.category || undefined,
      itemCount: row.itemCount || 0
    }));
  }

  async getActiveStories(): Promise<StoryWithCategory[]> {
    const result = await this.db
      .select({
        story: stories,
        category: categories,
        itemCount: sql<number>`cast(count(${storyItems.id}) as int)`
      })
      .from(stories)
      .leftJoin(categories, eq(stories.categoryId, categories.id))
      .leftJoin(storyItems, eq(stories.id, storyItems.storyId))
      .where(
        and(
          eq(stories.isActive, "true"),
          or(
            sql`${stories.expiresAt} IS NULL`,
            sql`${stories.expiresAt} > NOW()`
          )
        )
      )
      .groupBy(stories.id, categories.id)
      .orderBy(asc(stories.order), desc(stories.createdAt));

    return result.map(row => ({
      ...row.story,
      category: row.category || undefined,
      itemCount: row.itemCount || 0
    }));
  }

  async getStoryById(id: string): Promise<StoryWithItems | undefined> {
    const storyResult = await this.db
      .select({
        story: stories,
        category: categories
      })
      .from(stories)
      .leftJoin(categories, eq(stories.categoryId, categories.id))
      .where(eq(stories.id, id));

    if (!storyResult[0]) return undefined;

    const items = await this.db
      .select()
      .from(storyItems)
      .where(eq(storyItems.storyId, id))
      .orderBy(asc(storyItems.order));

    return {
      ...storyResult[0].story,
      category: storyResult[0].category || undefined,
      items
    };
  }

  async createStory(data: InsertStory): Promise<Story> {
    const result = await this.db.insert(stories).values(data).returning();
    return result[0];
  }

  async updateStory(id: string, data: Partial<InsertStory>): Promise<Story> {
    const result = await this.db
      .update(stories)
      .set(data)
      .where(eq(stories.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Story not found");
    return result[0];
  }

  async deleteStory(id: string): Promise<void> {
    await this.db.delete(stories).where(eq(stories.id, id));
  }

  async incrementStoryViews(id: string): Promise<void> {
    await this.db
      .update(stories)
      .set({ viewCount: sql`${stories.viewCount} + 1` })
      .where(eq(stories.id, id));
  }

  // Story Items methods
  async getStoryItems(storyId: string): Promise<StoryItem[]> {
    return await this.db
      .select()
      .from(storyItems)
      .where(eq(storyItems.storyId, storyId))
      .orderBy(asc(storyItems.order));
  }

  async createStoryItem(data: InsertStoryItem): Promise<StoryItem> {
    const result = await this.db.insert(storyItems).values(data).returning();
    return result[0];
  }

  async updateStoryItem(id: string, data: Partial<InsertStoryItem>): Promise<StoryItem> {
    const result = await this.db
      .update(storyItems)
      .set(data)
      .where(eq(storyItems.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Story item not found");
    return result[0];
  }

  async deleteStoryItem(id: string): Promise<void> {
    await this.db.delete(storyItems).where(eq(storyItems.id, id));
  }

  // Article admin methods
  async updateArticle(id: string, data: Partial<InsertArticle>): Promise<Article> {
    const result = await this.db
      .update(articles)
      .set(data)
      .where(eq(articles.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Article not found");
    return result[0];
  }

  async deleteArticle(id: string): Promise<void> {
    await this.db.delete(articles).where(eq(articles.id, id));
  }
}