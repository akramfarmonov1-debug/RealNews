import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Calendar, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories, useSearchArticles } from "@/hooks/use-news";
import { PushNotificationButton } from "@/components/push-notification-button";

export default function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data: searchResults = [] } = useSearchArticles(searchQuery, 5);

  const currentDate = new Date().toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" data-testid="header">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Tier 1: Branding and Actions */}
        <div className="py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3" data-testid="link-logo">
              <img 
                src="/logo.png?v=2" 
                alt="RealNews" 
                className="h-10 w-auto"
              />
              <div className="text-2xl font-bold text-primary">
                RealNews
              </div>
            </Link>

            {/* Action Icons */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search */}
              <div className="relative hidden md:block">
                {!isSearchOpen ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    data-testid="button-search-toggle"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                      <Input
                        type="search"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                        data-testid="input-search"
                        autoFocus
                      />
                    </form>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      data-testid="button-search-close"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {/* Search Results Dropdown */}
                {isSearchOpen && searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                    {searchResults.map((article) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchOpen(false);
                        }}
                        data-testid={`search-result-${article.id}`}
                      >
                        <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                        <p className="text-xs text-gray-500">{article.category.name}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Push Notifications */}
              <PushNotificationButton />
              
              {/* Language Selector */}
              <select className="text-sm border-none bg-transparent cursor-pointer" data-testid="select-language">
                <option>🇺🇿 O'zbek</option>
                <option>🇷🇺 Русский</option>
                <option>🇺🇸 English</option>
              </select>

              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
                data-testid="button-mobile-search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={toggleMobileMenu}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Tier 2: Navigation Menu */}
        <nav className="py-3">
          <div className="flex items-center justify-between">
            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/stories" 
                className={`font-medium transition-colors ${
                  location === "/stories" ? "text-primary" : "hover:text-accent"
                }`}
                data-testid="nav-stories"
              >
                📖 Stories
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className={`transition-colors font-medium ${
                    location === `/category/${category.slug}` ? "text-primary" : "hover:text-accent"
                  }`}
                  data-testid={`nav-${category.slug}`}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Date and Weather */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {currentDate}
              </span>
              <span className="flex items-center">
                <Thermometer className="w-4 h-4 mr-1" />
                Toshkent +5°C
              </span>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" data-testid="mobile-menu-overlay">
          <div className="bg-white w-64 h-full shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">Menu</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  data-testid="button-close-mobile-menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/stories" 
                    className="block py-2 text-primary font-medium"
                    onClick={toggleMobileMenu}
                    data-testid="mobile-nav-stories"
                  >
                    📖 Stories
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="block py-2 hover:text-accent transition-colors"
                      onClick={toggleMobileMenu}
                      data-testid={`mobile-nav-${category.slug}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" data-testid="mobile-search-overlay">
          <div className="bg-white m-4 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Qidirish</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                data-testid="button-close-mobile-search"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <Input
                type="search"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-mobile-search"
                autoFocus
              />
            </form>
            {searchQuery && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    data-testid={`mobile-search-result-${article.id}`}
                  >
                    <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                    <p className="text-xs text-gray-500">{article.category.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
