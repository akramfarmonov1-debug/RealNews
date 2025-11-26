import { useEffect } from "react";
import BreakingNews from "@/components/breaking-news";
import HeroSection from "@/components/hero-section";
import CategorySection from "@/components/category-section";
import Sidebar from "@/components/sidebar";
import { useCategories } from "@/hooks/use-news";
import { updateSEOTags, getDefaultSEO } from "@/lib/seo";

export default function Home() {
  const { data: categories = [], isLoading } = useCategories();

  useEffect(() => {
    updateSEOTags(getDefaultSEO());
  }, []);

  return (
    <div data-testid="home-page">
      <BreakingNews />
      
      <main className="container mx-auto px-4 sm:px-6 max-w-7xl py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3" data-testid="main-content">
            
            <HeroSection />

            {/* Category Sections */}
            {isLoading ? (
              <div className="space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="bg-gray-200 rounded-xl h-80"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              categories.map((category) => (
                <CategorySection 
                  key={category.id} 
                  category={category} 
                  limit={3}
                />
              ))
            )}

          </div>

          <Sidebar />

        </div>
      </main>
    </div>
  );
}
