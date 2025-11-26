export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
}

export function updateSEOTags(seo: SEOData) {
  // Update page title
  document.title = seo.title;

  // Update meta tags
  updateMetaTag("description", seo.description);
  
  if (seo.keywords) {
    updateMetaTag("keywords", seo.keywords);
  }

  // Update Open Graph tags
  updateMetaTag("og:title", seo.title, "property");
  updateMetaTag("og:description", seo.description, "property");
  updateMetaTag("og:type", seo.type || "website", "property");
  
  if (seo.image) {
    updateMetaTag("og:image", seo.image, "property");
  }
  
  if (seo.url) {
    updateMetaTag("og:url", seo.url, "property");
  }

  // Update Twitter Card tags
  updateMetaTag("twitter:card", "summary_large_image");
  updateMetaTag("twitter:title", seo.title);
  updateMetaTag("twitter:description", seo.description);
  
  if (seo.image) {
    updateMetaTag("twitter:image", seo.image);
  }

  // Article-specific tags
  if (seo.type === "article") {
    if (seo.publishedTime) {
      updateMetaTag("article:published_time", seo.publishedTime, "property");
    }
    if (seo.author) {
      updateMetaTag("article:author", seo.author, "property");
    }
  }

  // Add structured data for articles
  if (seo.type === "article") {
    updateStructuredData({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": seo.title,
      "description": seo.description,
      "image": seo.image,
      "datePublished": seo.publishedTime,
      "author": {
        "@type": "Organization",
        "name": seo.author || "RealNews"
      },
      "publisher": {
        "@type": "Organization",
        "name": "RealNews",
        "logo": {
          "@type": "ImageObject",
          "url": "https://realnews.uz/logo.png"
        }
      }
    });
  }
}

function updateMetaTag(name: string, content: string, attribute: string = "name") {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  
  tag.setAttribute("content", content);
}

function updateStructuredData(data: any) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function getDefaultSEO(): SEOData {
  return {
    title: "RealNews - Eng So'nggi Yangiliklar va Tahlillar",
    description: "O'zbekiston va dunyo bo'ylab eng so'nggi yangiliklar, sport, texnologiya, siyosat va iqtisodiyot sohasidagi tahlillar",
    keywords: "yangiliklar, O'zbekiston, dunyo yangiliklari, sport, texnologiya, siyosat, iqtisodiyot",
    type: "website"
  };
}
