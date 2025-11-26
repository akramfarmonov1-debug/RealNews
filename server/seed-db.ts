import { DbStorage } from "./db-storage";

const storage = new DbStorage();

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Check if categories already exist
    const existingCategories = await storage.getAllCategories();
    
    if (existingCategories.length > 0) {
      console.log("Database already has data. Skipping seeding.");
      return;
    }

    // Create default categories
    const defaultCategories = [
      { name: "O'zbekiston", slug: "ozbekiston", icon: "fas fa-flag", color: "#1a365d" },
      { name: "Dunyo", slug: "dunyo", icon: "fas fa-globe", color: "#2d3748" },
      { name: "Sport", slug: "sport", icon: "fas fa-futbol", color: "#16a085" },
      { name: "Texnologiya", slug: "texnologiya", icon: "fas fa-microchip", color: "#3182ce" },
      { name: "Iqtisodiyot", slug: "iqtisodiyot", icon: "fas fa-chart-line", color: "#d69e2e" },
      { name: "Madaniyat", slug: "madaniyat", icon: "fas fa-theater-masks", color: "#805ad5" },
      { name: "Siyosat", slug: "siyosat", icon: "fas fa-landmark", color: "#2b6cb0" }
    ];

    const createdCategories: any[] = [];
    for (const categoryData of defaultCategories) {
      const category = await storage.createCategory(categoryData);
      createdCategories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    // Create RSS feeds
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
      const category = createdCategories.find(cat => cat.slug === feedData.categorySlug);
      if (category) {
        await storage.createRssFeed({
          url: feedData.url,
          name: feedData.name,
          categoryId: category.id,
          isActive: "true"
        });
        console.log(`Created RSS feed: ${feedData.name}`);
      }
    }

    // Create sample articles
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
      const category = createdCategories.find(cat => cat.slug === articleData.categorySlug);
      if (category) {
        await storage.createArticle({
          title: articleData.title,
          slug: articleData.slug,
          description: articleData.description,
          content: articleData.content,
          imageUrl: articleData.imageUrl,
          sourceUrl: articleData.sourceUrl,
          sourceName: articleData.sourceName,
          categoryId: category.id,
          publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3), // Last 3 days
          isBreaking: articleData.isBreaking,
          isFeatured: articleData.isFeatured
        });
        console.log(`Created article: ${articleData.title}`);
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error).finally(() => process.exit(0));
}

export { seedDatabase };