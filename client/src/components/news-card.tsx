import { Link } from "wouter";
import { Heart, MessageCircle, Share2, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArticleWithCategory } from "@shared/schema";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NewsCardProps {
  article: ArticleWithCategory;
  variant?: "default" | "horizontal" | "compact";
  showImage?: boolean;
  showCategory?: boolean;
  showStats?: boolean;
}

export default function NewsCard({ 
  article, 
  variant = "default",
  showImage = true,
  showCategory = true,
  showStats = true 
}: NewsCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(article.likes || 0);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: (increment: boolean) => apiRequest("POST", `/api/articles/${article.id}/like`, { increment }),
    onSuccess: (_, increment) => {
      setLocalLikes(prev => prev + (increment ? 1 : -1));
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/trending"] });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    likeMutation.mutate(newLikedState);
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "1 soat oldin";
    if (diffInHours < 24) return `${diffInHours} soat oldin`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 kun oldin";
    if (diffInDays < 7) return `${diffInDays} kun oldin`;
    
    return publishedDate.toLocaleDateString("uz-UZ");
  };

  if (variant === "horizontal") {
    return (
      <article className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow" data-testid={`news-card-${article.id}`}>
        <Link href={`/article/${article.slug}`} className="flex">
          {showImage && article.imageUrl && (
            <div className="relative mr-4 flex-shrink-0">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-24 h-16 object-cover rounded-lg"
                data-testid={`news-image-${article.id}`}
              />
              {article.imageAttribution && (
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white px-1 py-0.5 text-xs rounded-tl">
                  <a 
                    href={article.imageAuthorUrl || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    data-testid={`image-attribution-${article.id}`}
                    onClick={(e) => e.stopPropagation()}
                    title={article.imageAttribution}
                  >
                    📸
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="flex-1">
            {showCategory && (
              <div className="flex items-center mb-2">
                <span 
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                  data-testid={`news-category-${article.id}`}
                >
                  {article.category.name}
                </span>
                <span className="text-gray-500 text-sm ml-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(article.publishedAt)}
                </span>
              </div>
            )}
            <h3 className="font-semibold mb-2 hover:text-accent cursor-pointer transition-colors" data-testid={`news-title-${article.id}`}>
              {article.title}
            </h3>
            <p className="text-sm text-gray-600" data-testid={`news-source-${article.id}`}>
              {article.sourceName}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0" data-testid={`news-card-compact-${article.id}`}>
        <div className="flex-1">
          <Link href={`/article/${article.slug}`}>
            <h4 className="font-medium text-sm hover:text-accent cursor-pointer transition-colors mb-1" data-testid={`news-title-${article.id}`}>
              {article.title}
            </h4>
          </Link>
          <div className="flex items-center text-xs text-gray-500">
            <span data-testid={`news-source-${article.id}`}>{article.sourceName}</span>
            <span className="mx-1">•</span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow" data-testid={`news-card-${article.id}`}>
      <Link href={`/article/${article.slug}`}>
        {showImage && article.imageUrl && (
          <div className="relative">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-48 sm:h-52 md:h-48 object-cover"
              data-testid={`news-image-${article.id}`}
              loading="lazy"
            />
            {article.imageAttribution && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                <a 
                  href={article.imageAuthorUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  data-testid={`image-attribution-${article.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {article.imageAttribution}
                </a>
              </div>
            )}
          </div>
        )}
        <div className="p-4 sm:p-5">
          {showCategory && (
            <div className="flex items-center mb-2">
              <span 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                data-testid={`news-category-${article.id}`}
              >
                {article.category.name}
              </span>
              <span className="text-gray-500 text-sm ml-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeAgo(article.publishedAt)}
              </span>
            </div>
          )}
          <h3 className="font-semibold text-base sm:text-lg mb-2 hover:text-accent cursor-pointer transition-colors leading-tight" data-testid={`news-title-${article.id}`}>
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed" data-testid={`news-description-${article.id}`}>
              {article.description.length > 120 
                ? `${article.description.substring(0, 120)}...`
                : article.description
              }
            </p>
          )}
          {showStats && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500" data-testid={`news-source-${article.id}`}>
                {article.sourceName}
              </span>
              <div className="flex items-center space-x-2">
                {article.views > 0 && (
                  <span className="text-gray-400 text-sm flex items-center" data-testid={`news-views-${article.id}`}>
                    <Eye className="w-3 h-3 mr-1" />
                    {article.views}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`text-sm h-auto p-2 min-h-[40px] ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  data-testid={`button-like-${article.id}`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {localLikes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-accent text-sm h-auto p-2 min-h-[40px]"
                  data-testid={`button-share-${article.id}`}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
