import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flame, Cloud, Mail, Share2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTrendingArticles } from "@/hooks/use-news";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";
import NewsCard from "./news-card";

// Newsletter form schema with better validation
const newsletterFormSchema = insertNewsletterSchema.extend({
  email: z.string().email("Yaroqli email manzil kiriting")
});

type NewsletterFormData = z.infer<typeof newsletterFormSchema>;

export default function Sidebar() {
  const { data: trendingArticles = [], isLoading } = useTrendingArticles(5);
  const [isNewsletterSubmitted, setIsNewsletterSubmitted] = useState(false);
  const { toast } = useToast();

  const newsletterForm = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: "",
      isActive: "true"
    }
  });

  const newsletterMutation = useMutation({
    mutationFn: (data: NewsletterFormData) => apiRequest("POST", "/api/newsletter/subscribe", data),
    onSuccess: () => {
      setIsNewsletterSubmitted(true);
      newsletterForm.reset();
      toast({
        title: "Muvaffaqiyatli obuna bo'ldingiz!",
        description: "Eng so'nggi yangiliklar elektron pochtangizga yuboriladi."
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Xatolik yuz berdi";
      if (errorMessage.includes("already subscribed") || errorMessage.includes("409")) {
        toast({
          title: "Allaqachon obuna bo'lgansiz",
          description: "Bu email manzil bilan avval obuna bo'lingan.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Obuna bo'lishda xatolik",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  });

  const onNewsletterSubmit = (data: NewsletterFormData) => {
    newsletterMutation.mutate(data);
  };

  return (
    <aside className="lg:col-span-1" data-testid="sidebar">
      
      {/* Trending News */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-testid="trending-news">
        <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
          <Flame className="mr-2 text-red-500 w-5 h-5" />
          Mashhur yangiliklar
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                <div className="bg-gray-200 rounded-full w-6 h-6 flex-shrink-0 animate-pulse"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-4 rounded mb-2 animate-pulse"></div>
                  <div className="bg-gray-200 h-3 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trendingArticles.map((article, index) => (
              <div key={article.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0" data-testid={`trending-item-${index + 1}`}>
                <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white ${
                  index === 0 ? 'bg-accent' : 'bg-gray-400'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1">
                  <Link href={`/article/${article.slug}`}>
                    <h4 className="font-medium text-sm hover:text-accent cursor-pointer transition-colors mb-1" data-testid={`trending-title-${index + 1}`}>
                      {article.title}
                    </h4>
                  </Link>
                  <div className="flex items-center text-xs text-gray-500">
                    <span data-testid={`trending-source-${index + 1}`}>{article.sourceName}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString("uz-UZ")}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {trendingArticles.length === 0 && (
              <p className="text-gray-500 text-sm">Hozircha mashhur yangiliklar mavjud emas</p>
            )}
          </div>
        )}
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6 mb-8" data-testid="weather-widget">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Cloud className="mr-2 w-5 h-5" />
          Ob-havo
        </h3>
        <div className="text-center">
          <div className="text-3xl font-bold mb-2" data-testid="current-temperature">+5°C</div>
          <div className="text-blue-100 mb-4" data-testid="weather-description">Toshkent, bulutli</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="text-blue-100">Bugun</div>
              <div className="font-medium" data-testid="weather-today">+7°C</div>
            </div>
            <div className="text-center">
              <div className="text-blue-100">Ertaga</div>
              <div className="font-medium" data-testid="weather-tomorrow">+3°C</div>
            </div>
            <div className="text-center">
              <div className="text-blue-100">Indinga</div>
              <div className="font-medium" data-testid="weather-dayafter">+1°C</div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-r from-accent/10 to-blue-50 rounded-xl p-6 mb-8" data-testid="newsletter-widget">
        {isNewsletterSubmitted ? (
          <div className="text-center" data-testid="newsletter-success">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Rahmat!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Siz muvaffaqiyatli obuna bo'ldingiz. Eng muhim yangiliklar elektron pochtangizga yuboriladi.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsNewsletterSubmitted(false)}
              data-testid="button-subscribe-again"
            >
              Yana obuna bo'lish
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mr-3">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Yangiliklar obunasi</h3>
                <p className="text-gray-600 text-sm">Eng muhim yangiliklardan xabar oling</p>
              </div>
            </div>
            
            <Form {...newsletterForm}>
              <form onSubmit={newsletterForm.handleSubmit(onNewsletterSubmit)} className="space-y-4" data-testid="newsletter-form">
                <FormField
                  control={newsletterForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Email manzil</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="elektron-pochta@example.com" 
                          type="email"
                          className="bg-white"
                          data-testid="input-newsletter-email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={newsletterMutation.isPending}
                  className="w-full min-h-[44px]"
                  data-testid="button-newsletter-subscribe"
                >
                  {newsletterMutation.isPending ? (
                    "Obuna bo'lmoqda..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Obuna bo'lish
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Bizning maxfiylik siyosatimizga rozilik bildirgan bo'lasiz
            </p>
          </>
        )}
      </div>

      {/* Social Media Links */}
      <div className="bg-white rounded-xl shadow-sm p-6" data-testid="social-media-widget">
        <h3 className="text-lg font-semibold mb-4 text-primary flex items-center">
          <Share2 className="mr-2 w-5 h-5" />
          Ijtimoiy tarmoqlarda kuzating
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="#" 
            className="flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            data-testid="link-telegram"
          >
            <i className="fab fa-telegram mr-2"></i>Telegram
          </a>
          <a 
            href="#" 
            className="flex items-center justify-center py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            data-testid="link-facebook"
          >
            <i className="fab fa-facebook mr-2"></i>Facebook
          </a>
          <a 
            href="#" 
            className="flex items-center justify-center py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
            data-testid="link-instagram"
          >
            <i className="fab fa-instagram mr-2"></i>Instagram
          </a>
          <a 
            href="#" 
            className="flex items-center justify-center py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            data-testid="link-youtube"
          >
            <i className="fab fa-youtube mr-2"></i>YouTube
          </a>
        </div>
      </div>

    </aside>
  );
}
