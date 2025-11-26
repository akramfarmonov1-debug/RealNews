import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { 
  users, categories, rssFeeds
} from "@shared/schema";
import { randomUUID } from "crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function initializeDatabase() {
  console.log("Initializing database with default data...");

  // Check if categories exist
  const existingCategories = await db.select().from(categories);
  
  if (existingCategories.length === 0) {
    console.log("Creating default categories...");
    
    const defaultCategories = [
      { id: randomUUID(), name: "O'zbekiston", slug: "ozbekiston", icon: "fas fa-flag", color: "#1a365d" },
      { id: randomUUID(), name: "Dunyo", slug: "dunyo", icon: "fas fa-globe", color: "#2d3748" },
      { id: randomUUID(), name: "Sport", slug: "sport", icon: "fas fa-futbol", color: "#16a085" },
      { id: randomUUID(), name: "Texnologiya", slug: "texnologiya", icon: "fas fa-microchip", color: "#3182ce" },
      { id: randomUUID(), name: "Iqtisodiyot", slug: "iqtisodiyot", icon: "fas fa-chart-line", color: "#d69e2e" },
      { id: randomUUID(), name: "Madaniyat", slug: "madaniyat", icon: "fas fa-theater-masks", color: "#805ad5" },
      { id: randomUUID(), name: "Siyosat", slug: "siyosat", icon: "fas fa-landmark", color: "#2b6cb0" }
    ];

    for (const categoryData of defaultCategories) {
      await db.insert(categories).values({
        ...categoryData,
        createdAt: new Date()
      });
    }
    console.log("Categories created successfully!");
  } else {
    console.log(`Found ${existingCategories.length} existing categories`);
  }

  // Get categories for RSS feeds
  const allCategories = await db.select().from(categories);
  const categoryMap = new Map(allCategories.map(c => [c.slug, c]));

  // Check if RSS feeds exist
  const existingFeeds = await db.select().from(rssFeeds);
  
  if (existingFeeds.length === 0) {
    console.log("Creating RSS feeds...");
    
    const feedsData = [
      { url: "https://feeds.bbci.co.uk/russian/rss.xml", name: "BBC Russian", categorySlug: "ozbekiston" },
      { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera", categorySlug: "ozbekiston" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World", categorySlug: "dunyo" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "NY Times World", categorySlug: "dunyo" },
      { url: "https://feeds.bbci.co.uk/sport/rss.xml", name: "BBC Sport", categorySlug: "sport" },
      { url: "https://www.espn.com/espn/rss/news", name: "ESPN News", categorySlug: "sport" },
      { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", name: "BBC Technology", categorySlug: "texnologiya" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", name: "NY Times Tech", categorySlug: "texnologiya" },
      { url: "https://feeds.bbci.co.uk/news/business/rss.xml", name: "BBC Business", categorySlug: "iqtisodiyot" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "NY Times Business", categorySlug: "iqtisodiyot" },
      { url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", name: "BBC Arts", categorySlug: "madaniyat" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml", name: "NY Times Arts", categorySlug: "madaniyat" },
      { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", name: "BBC Politics", categorySlug: "siyosat" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", name: "NY Times Politics", categorySlug: "siyosat" }
    ];

    for (const feedData of feedsData) {
      const category = categoryMap.get(feedData.categorySlug);
      if (category) {
        await db.insert(rssFeeds).values({
          id: randomUUID(),
          url: feedData.url,
          name: feedData.name,
          categoryId: category.id,
          isActive: "true",
          createdAt: new Date(),
          lastFetchedAt: null
        });
      }
    }
    console.log("RSS feeds created successfully!");
  } else {
    console.log(`Found ${existingFeeds.length} existing RSS feeds`);
  }

  // Check if admin user exists
  const existingAdmin = await db.select().from(users).where(eq(users.username, "Akramjon"));
  
  if (existingAdmin.length === 0) {
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("Gisobot201415*", 12);
    
    await db.insert(users).values({
      id: randomUUID(),
      username: "Akramjon",
      email: "admin@realnews.uz",
      password: hashedPassword,
      role: "admin",
      isActive: "true",
      createdAt: new Date()
    });
    console.log("Admin user created: username = Akramjon");
  } else {
    console.log("Admin user already exists");
  }

  console.log("Database initialization complete!");
  process.exit(0);
}

initializeDatabase().catch(error => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});
