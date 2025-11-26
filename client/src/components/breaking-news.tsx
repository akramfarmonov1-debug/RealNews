import { useBreakingNews } from "@/hooks/use-news";
import { Link } from "wouter";

export default function BreakingNews() {
  const { data: breakingNews = [], isLoading } = useBreakingNews(3);

  if (isLoading) {
    return (
      <div className="bg-red-600 text-white py-2" data-testid="breaking-news-loading">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center">
            <span className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold mr-4">JONLI</span>
            <div className="animate-pulse">Yangiliklar yuklanmoqda...</div>
          </div>
        </div>
      </div>
    );
  }

  if (breakingNews.length === 0) {
    return (
      <div className="bg-red-600 text-white py-2" data-testid="breaking-news-empty">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center">
            <span className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold mr-4">JONLI</span>
            <div>Hozircha tezkor yangiliklar mavjud emas</div>
          </div>
        </div>
      </div>
    );
  }

  const newsText = breakingNews.map(article => article.title).join(" • ");

  return (
    <div className="bg-red-600 text-white py-2" data-testid="breaking-news">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center">
          <span className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold mr-4" data-testid="breaking-news-badge">
            JONLI
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="animate-pulse" data-testid="breaking-news-text">
              <Link href={`/article/${breakingNews[0].slug}`} className="hover:underline">
                {newsText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
