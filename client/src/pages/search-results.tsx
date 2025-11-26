import { useLocation } from "wouter";
import { useSearchArticles } from "@/hooks/use-news";
import NewsCard from "@/components/news-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchResults() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
  }, [location]);
  
  const { data: searchResults = [], isLoading } = useSearchArticles(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="search-results-page">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="search-title">
            Qidiruv natijalari
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg">
            <div className="relative">
              <Input
                type="search"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
                data-testid="input-search-page"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          {searchQuery && (
            <p className="mt-4 text-gray-600" data-testid="search-query-display">
              "<span className="font-medium">{searchQuery}</span>" uchun qidiruv natijalari
            </p>
          )}
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Qidirish...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-6">
            <p className="text-gray-600" data-testid="results-count">
              {searchResults.length} ta natija topildi
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((article) => (
                <NewsCard 
                  key={article.id} 
                  article={article}
                  data-testid={`search-result-card-${article.id}`}
                />
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm" data-testid="no-results">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Hech narsa topilmadi
            </h3>
            <p className="text-gray-600 mb-6">
              "<span className="font-medium">{searchQuery}</span>" bo'yicha hech qanday natija topilmadi.
            </p>
            <div className="text-sm text-gray-500">
              <p>Maslahatlar:</p>
              <ul className="mt-2 space-y-1">
                <li>• Boshqa kalit so'zlardan foydalaning</li>
                <li>• Imlo xatolarini tekshiring</li>
                <li>• Umumiy atamalardan foydalaning</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Qidiruv uchun kalit so'z kiriting
            </h3>
            <p className="text-gray-600">
              Yuqoridagi qidiruv maydonidan foydalanib, o'zingizni qiziqtirgan maqolalarni toping.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}