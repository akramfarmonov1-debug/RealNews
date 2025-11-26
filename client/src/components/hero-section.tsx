import { Link } from "wouter";
import { useFeaturedArticles, useArticles } from "@/hooks/use-news";
import NewsCard from "./news-card";

export default function HeroSection() {
  const { data: featuredArticles = [], isLoading: featuredLoading } = useFeaturedArticles(1);
  const { data: recentArticles = [], isLoading: recentLoading } = useArticles(6, 0);

  if (featuredLoading || recentLoading) {
    return (
      <section className="mb-12" data-testid="hero-section-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-1 bg-gray-200 rounded-xl animate-pulse h-96"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl animate-pulse h-24"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const featuredArticle = featuredArticles[0] || recentArticles[0];
  const secondaryArticles = recentArticles.slice(1, 4);

  if (!featuredArticle) {
    return (
      <section className="mb-12" data-testid="hero-section-empty">
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Hozircha maqolalar mavjud emas</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 sm:mb-12" data-testid="hero-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Featured Article */}
        <article className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow" data-testid="featured-article">
          <Link href={`/article/${featuredArticle.slug}`}>
            {featuredArticle.imageUrl && (
              <img 
                src={featuredArticle.imageUrl} 
                alt={featuredArticle.title}
                className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                loading="lazy"
                data-testid="featured-article-image"
              />
            )}
            <div className="p-4 sm:p-6">
              <div className="flex items-center mb-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: featuredArticle.category.color }}
                  data-testid="featured-article-category"
                >
                  {featuredArticle.category.name}
                </span>
                <span className="text-gray-500 text-sm ml-3" data-testid="featured-article-time">
                  {new Date(featuredArticle.publishedAt).toLocaleDateString("uz-UZ")}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 hover:text-accent cursor-pointer transition-colors leading-tight" data-testid="featured-article-title">
                {featuredArticle.title}
              </h2>
              {featuredArticle.description && (
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed" data-testid="featured-article-description">
                  {featuredArticle.description.length > 150 
                    ? `${featuredArticle.description.substring(0, 150)}...`
                    : featuredArticle.description
                  }
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500" data-testid="featured-article-source">
                  {featuredArticle.sourceName}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-sm" data-testid="featured-article-stats">
                    <i className="far fa-heart mr-1"></i> {featuredArticle.likes || 0}
                  </span>
                  <span className="text-gray-400 text-sm">
                    <i className="far fa-eye mr-1"></i> {featuredArticle.views || 0}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </article>

        {/* Secondary Articles */}
        <div className="space-y-4 sm:space-y-6" data-testid="secondary-articles">
          {secondaryArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              variant="horizontal"
              showImage={true}
              showCategory={true}
              showStats={false}
            />
          ))}
          
          {secondaryArticles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Ko'proq maqolalar tez orada qo'shiladi</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
