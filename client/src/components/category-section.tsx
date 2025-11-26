import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { useCategoryArticles } from "@/hooks/use-news";
import NewsCard from "./news-card";
import type { Category } from "@shared/schema";

interface CategorySectionProps {
  category: Category;
  limit?: number;
}

export default function CategorySection({ category, limit = 3 }: CategorySectionProps) {
  const { data: articles = [], isLoading } = useCategoryArticles(category.slug, limit);

  if (isLoading) {
    return (
      <section className="mb-12" data-testid={`category-section-${category.slug}-loading`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary flex items-center">
            <i className={`${category.icon} mr-3`} style={{ color: category.color }}></i>
            {category.name}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl animate-pulse h-80"></div>
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 sm:mb-12" data-testid={`category-section-${category.slug}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center" data-testid={`category-title-${category.slug}`}>
          <i className={`${category.icon} mr-3`} style={{ color: category.color }}></i>
          {category.name}
        </h2>
        <Link 
          href={`/category/${category.slug}`} 
          className="text-accent hover:text-primary transition-colors font-medium flex items-center text-sm sm:text-base min-h-[44px] px-2"
          data-testid={`category-view-all-${category.slug}`}
        >
          Barchasini ko'rish 
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            variant="default"
            showImage={true}
            showCategory={false}
            showStats={true}
          />
        ))}
      </div>
    </section>
  );
}
