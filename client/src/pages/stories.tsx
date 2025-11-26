import { StoriesGrid } from "@/components/stories/stories-grid";
import { useStories } from "@/hooks/use-stories";
import { useEffect } from "react";

export default function StoriesPage() {
  const { data: stories = [] } = useStories();

  useEffect(() => {
    document.title = "Stories - RealNews";
  }, []);

  return (
    <>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2" data-testid="stories-page-title">
                📖 Stories
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg" data-testid="stories-page-description">
                Eng so'nggi yangiliklar va hikoyalar Instagram formatida
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-2" data-testid="stories-count">
                {stories.length} ta story mavjud
              </div>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100" data-testid="stories-section-title">
                🎬 Barcha Stories
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1" data-testid="stories-section-description">
                Bosib, to'liq ko'rish uchun stories'ni tanlang
              </p>
            </div>
            
            <StoriesGrid />
          </div>

          {/* Info section */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2" data-testid="stories-info-title">
                📱 Qanday ishlaydi?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-2xl mb-2">👆</div>
                  <p><strong>Tanlang:</strong> Story'ni bosib ochish</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">⏯️</div>
                  <p><strong>Boshqaring:</strong> To'xtatish/davom ettirish</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">👈👉</div>
                  <p><strong>Navigatsiya:</strong> Oldin/keyingi story</p>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                💡 <strong>Maslahat:</strong> Klaviatura tugmalari bilan ham boshqarishingiz mumkin: ← → (navigatsiya), Space (to'xtatish)
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}