import type { Express } from "express";
import { z } from "zod";
import { unsplashService } from "../services/unsplash";
import { storage } from "../storage";

const updateImageSchema = z.object({
  articleId: z.string()
});

const refreshAllImagesSchema = z.object({
  categoryId: z.string().optional()
});

export function registerImageRoutes(app: Express) {
  // Update image for a specific article
  app.post("/api/articles/:id/update-image", async (req, res) => {
    try {
      const { id } = req.params;
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const newImageUrl = await unsplashService.getArticleImage(
        article.title, 
        article.category.name
      );

      if (newImageUrl) {
        // Update article with new image
        await storage.updateArticleImage(id, newImageUrl);
        res.json({ success: true, imageUrl: newImageUrl });
      } else {
        res.status(404).json({ error: "No suitable image found" });
      }
    } catch (error) {
      console.error("Error updating article image:", error);
      res.status(500).json({ error: "Failed to update image" });
    }
  });

  // Refresh images for all articles (or by category)
  app.post("/api/images/refresh", async (req, res) => {
    try {
      const { categoryId } = refreshAllImagesSchema.parse(req.body);
      
      let articles;
      if (categoryId) {
        const category = await storage.getCategoryById(categoryId);
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
        articles = await storage.getArticlesByCategory(category.slug);
      } else {
        articles = await storage.getAllArticles(100); // Get more articles for refresh
      }

      let updatedCount = 0;
      for (const article of articles) {
        try {
          const newImageUrl = await unsplashService.getArticleImage(
            article.title,
            article.category.name
          );

          if (newImageUrl && newImageUrl !== article.imageUrl) {
            await storage.updateArticleImage(article.id, newImageUrl);
            updatedCount++;
          }
        } catch (error) {
          console.error(`Failed to update image for article ${article.id}:`, error);
        }
      }

      res.json({ 
        success: true, 
        message: `Updated ${updatedCount} article images` 
      });
    } catch (error) {
      console.error("Error refreshing images:", error);
      res.status(500).json({ error: "Failed to refresh images" });
    }
  });
}