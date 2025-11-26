import { useQuery } from "@tanstack/react-query";
import type { ArticleWithCategory, CategoryWithCount } from "@shared/schema";

export function useCategories() {
  return useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });
}

export function useArticles(limit = 20, offset = 0) {
  return useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles", { limit, offset }],
  });
}

export function useFeaturedArticles(limit = 5) {
  return useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles/featured", { limit }],
  });
}

export function useBreakingNews(limit = 5) {
  return useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles/breaking", { limit }],
  });
}

export function useTrendingArticles(limit = 10) {
  return useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles/trending", { limit }],
  });
}

export function useCategoryArticles(categorySlug: string, limit = 20, offset = 0) {
  return useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/categories", categorySlug, "articles", { limit, offset }],
    enabled: !!categorySlug,
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery<ArticleWithCategory>({
    queryKey: ["/api/articles/slug", slug],
    enabled: !!slug,
  });
}

export function useSearchArticles(query: string, limit = 20) {
  return useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles/search", { q: query, limit }],
    enabled: !!query && query.length > 0,
  });
}

export function useRelatedArticles(slug: string, limit = 3) {
  return useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles/slug", slug, "related", { limit }],
    enabled: !!slug,
  });
}
