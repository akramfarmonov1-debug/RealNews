import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content"),
  imageUrl: text("image_url"),
  imageAttribution: text("image_attribution"), // "Photo by John Doe on Unsplash"
  imageAuthor: text("image_author"), // "John Doe"
  imageAuthorUrl: text("image_author_url"), // "https://unsplash.com/@johndoe"
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  isBreaking: text("is_breaking").default("false").notNull(),
  isFeatured: text("is_featured").default("false").notNull(),
});

export const rssFeeds = pgTable("rss_feeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull().unique(),
  name: text("name").notNull(),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  isActive: text("is_active").default("true").notNull(),
  lastFetchedAt: timestamp("last_fetched_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  isActive: text("is_active").default("true").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpoint: text("endpoint").notNull().unique(),
  keys: jsonb("keys").notNull(), // {p256dh: string, auth: string}
  userAgent: text("user_agent"),
  isActive: text("is_active").default("true").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stories - Instagram-style daily news highlights
export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  thumbnail: text("thumbnail"), // Cover image
  isActive: text("is_active").default("true").notNull(),
  order: integer("order").default(0).notNull(), // Display order
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Stories can expire (24 hours)
  viewCount: integer("view_count").default(0).notNull()
});

// Story Items - Individual slides in a story
export const storyItems = pgTable("story_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  articleId: varchar("article_id").references(() => articles.id), // Link to article
  type: text("type").default("image").notNull(), // image, video, text
  mediaUrl: text("media_url"), // Image or video URL
  title: text("title"),
  content: text("content"), // Text content for text slides
  duration: integer("duration").default(5).notNull(), // Seconds to display
  order: integer("order").default(0).notNull(), // Order within story
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  views: true,
  likes: true,
});

export const insertRssFeedSchema = createInsertSchema(rssFeeds).omit({
  id: true,
  createdAt: true,
  lastFetchedAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});

export const insertStoryItemSchema = createInsertSchema(storyItems).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type RssFeed = typeof rssFeeds.$inferSelect;
export type InsertRssFeed = z.infer<typeof insertRssFeedSchema>;

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type StoryItem = typeof storyItems.$inferSelect;
export type InsertStoryItem = z.infer<typeof insertStoryItemSchema>;

// Extended types for API responses
export type ArticleWithCategory = Article & {
  category: Category;
};

export type CategoryWithCount = Category & {
  articleCount: number;
};

// Extended types for Stories
export type StoryWithItems = Story & {
  category?: Category;
  items: StoryItem[];
};

export type StoryWithCategory = Story & {
  category?: Category;
  itemCount: number;
};
