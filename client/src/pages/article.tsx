import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { ChevronRight, Home, Clock, Eye, Heart, Share2, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArticleBySlug, useRelatedArticles } from "@/hooks/use-news";
import NewsCard from "@/components/news-card";
import Sidebar from "@/components/sidebar";
import { updateSEOTags } from "@/lib/seo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const queryClient = useQueryClient();

  const { data: article, isLoading, error } = useArticleBySlug(slug);
  const { data: relatedArticles = [] } = useRelatedArticles(slug, 3);

  const likeMutation = useMutation({
    mutationFn: (increment: boolean) => apiRequest("POST", `/api/articles/${article?.id}/like`, { increment }),
    onSuccess: (_, increment) => {
      setLocalLikes(prev => prev + (increment ? 1 : -1));
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/trending"] });
    },
  });

  useEffect(() => {
    if (article) {
      setLocalLikes(article.likes || 0);
      updateSEOTags({
        title: `${article.title} - RealNews`,
        description: article.description || `${article.title} haqida batafsil ma'lumot`,
        keywords: `${article.category.name.toLowerCase()}, yangiliklar, O'zbekiston`,
        image: article.imageUrl,
        type: "article",
        publishedTime: article.publishedAt.toString(),
        author: article.sourceName
      });
    }
  }, [article]);

  const handleLike = () => {
    if (!article) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    likeMutation.mutate(newLikedState);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
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

  if (error) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-8" data-testid="article-error">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Xatolik yuz berdi</h1>
          <p className="text-gray-600 mb-6">Maqola ma'lumotlarini yuklashda xatolik yuz berdi.</p>
          <Link href="/" className="text-accent hover:underline">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-8" data-testid="article-loading">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-200 rounded-xl animate-pulse h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-8" data-testid="article-not-found">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Maqola topilmadi</h1>
          <p className="text-gray-600 mb-6">Siz qidirayotgan maqola mavjud emas yoki o'chirilgan.</p>
          <Link href="/" className="text-accent hover:underline">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="article-page">
      <main className="container mx-auto px-4 sm:px-6 max-w-7xl py-6 sm:py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8" data-testid="breadcrumb">
          <Link href="/" className="hover:text-accent flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Bosh sahifa
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/category/${article.category.slug}`} className="hover:text-accent">
            {article.category.name}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Maqola</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Article Content */}
          <article className="lg:col-span-3" data-testid="article-content">
            
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: article.category.color }}
                  data-testid="article-category"
                >
                  {article.category.name}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight" data-testid="article-title">
                {article.title}
              </h1>

              {article.description && (
                <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6 leading-relaxed" data-testid="article-description">
                  {article.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-500 mb-4 sm:mb-6" data-testid="article-meta">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span data-testid="article-source">{article.sourceName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <time dateTime={article.publishedAt.toString()} data-testid="article-date">
                    {new Date(article.publishedAt).toLocaleDateString("uz-UZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span data-testid="article-time-ago">{formatTimeAgo(article.publishedAt)}</span>
                </div>
                {article.views > 0 && (
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    <span data-testid="article-views">{article.views} ko'rilgan</span>
                  </div>
                )}
              </div>

              {/* Social Actions */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200" data-testid="article-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`min-h-[44px] px-4 py-2 ${isLiked ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                  data-testid="button-like-article"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {localLikes} Yoqdi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="min-h-[44px] px-4 py-2"
                  data-testid="button-share-article"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Ulashish
                </Button>
              </div>
            </header>

            {/* Featured Image */}
            {article.imageUrl && (
              <div className="mb-6 sm:mb-8" data-testid="article-image">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="prose max-w-none" data-testid="article-body">
              {article.content ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base sm:text-lg">
                  {article.content}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    Bu maqolaning to'liq matni manbada mavjud. To'liq o'qish uchun pastdagi havolaga o'ting.
                  </p>
                  <a 
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-accent hover:text-blue-700 font-medium"
                    data-testid="article-source-link"
                  >
                    Manbada o'qish
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              )}
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-12 pt-8 border-t border-gray-200" data-testid="related-articles">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shunga o'xshash maqolalar</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <NewsCard
                      key={relatedArticle.id}
                      article={relatedArticle}
                      variant="default"
                      showImage={true}
                      showCategory={false}
                      showStats={true}
                    />
                  ))}
                </div>
              </section>
            )}

          </article>

          <Sidebar />

        </div>
      </main>
    </div>
  );
}
