import { useEffect } from "react";
import { useParams } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";
import { useCategories, useCategoryArticles } from "@/hooks/use-news";
import NewsCard from "@/components/news-card";
import Sidebar from "@/components/sidebar";
import { updateSEOTags } from "@/lib/seo";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;
  
  const { data: categories = [] } = useCategories();
  const { data: articles = [], isLoading, error } = useCategoryArticles(categorySlug, 20, 0);

  const category = categories.find(cat => cat.slug === categorySlug);

  useEffect(() => {
    if (category) {
      updateSEOTags({
        title: `${category.name} - RealNews`,
        description: `${category.name} bo'yicha eng so'nggi yangiliklar va tahlillar`,
        keywords: `${category.name.toLowerCase()}, yangiliklar, O'zbekiston, dunyo yangiliklari`,
        type: "website"
      });
    }
  }, [category]);

  if (error) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-8" data-testid="category-error">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Xatolik yuz berdi</h1>
          <p className="text-gray-600 mb-6">Kategoriya ma'lumotlarini yuklashda xatolik yuz berdi.</p>
          <Link href="/" className="text-accent hover:underline">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!category && !isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-8" data-testid="category-not-found">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategoriya topilmadi</h1>
          <p className="text-gray-600 mb-6">Siz qidirayotgan kategoriya mavjud emas.</p>
          <Link href="/" className="text-accent hover:underline">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="category-page">
      <main className="container mx-auto px-4 max-w-7xl py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8" data-testid="breadcrumb">
          <Link href="/" className="hover:text-accent flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Bosh sahifa
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">
            {category ? category.name : categorySlug}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Category Header */}
            {category && (
              <div className="mb-8" data-testid="category-header">
                <h1 className="text-3xl font-bold text-primary flex items-center mb-4">
                  <i className={`${category.icon} mr-3`} style={{ color: category.color }}></i>
                  {category.name}
                </h1>
                <p className="text-gray-600">
                  {category.name} bo'yicha eng so'nggi yangiliklar va tahlillar
                </p>
              </div>
            )}

            {/* Articles Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="category-loading">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-200 rounded-xl animate-pulse h-80"></div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="category-articles">
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
            ) : (
              <div className="text-center py-12" data-testid="category-no-articles">
                <div className="text-gray-500 mb-4">
                  <i className="fas fa-newspaper text-4xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Hozircha maqolalar yo'q
                </h3>
                <p className="text-gray-600 mb-6">
                  Bu kategoriyada hali yangiliklar mavjud emas. Tez orada yangi maqolalar qo'shiladi.
                </p>
                <Link href="/" className="text-accent hover:underline">
                  Boshqa kategoriyalarni ko'rish
                </Link>
              </div>
            )}

          </div>

          <Sidebar />

        </div>
      </main>
    </div>
  );
}
