import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white mt-16" data-testid="footer">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="md:col-span-1" data-testid="footer-company">
            <div className="text-2xl font-bold mb-4 flex items-center">
              <img 
                src="/logo.png?v=2" 
                alt="RealNews" 
                className="h-8 w-auto mr-3"
              />
              RealNews
            </div>
            <p className="text-blue-200 mb-4">
              O'zbekiston va dunyo bo'ylab eng ishonchli yangiliklar manbai. Biz sizga eng so'nggi va muhim yangiliklarni yetkazamiz.
            </p>
            <div className="flex space-x-3" data-testid="footer-social-links">
              <a href="#" className="text-blue-200 hover:text-white transition-colors" data-testid="footer-link-telegram">
                <i className="fab fa-telegram text-xl"></i>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors" data-testid="footer-link-facebook">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors" data-testid="footer-link-instagram">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors" data-testid="footer-link-youtube">
                <i className="fab fa-youtube text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div data-testid="footer-quick-links">
            <h4 className="font-semibold mb-4">Tezkor havolalar</h4>
            <ul className="space-y-2 text-blue-200">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-about">Biz haqimizda</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-contact">Kontaktlar</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-advertising">Reklama</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-partnership">Hamkorlik</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-careers">Vakansiyalar</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div data-testid="footer-categories">
            <h4 className="font-semibold mb-4">Bo'limlar</h4>
            <ul className="space-y-2 text-blue-200">
              <li>
                <Link href="/category/ozbekiston" className="hover:text-white transition-colors" data-testid="footer-link-uzbekistan">
                  O'zbekiston
                </Link>
              </li>
              <li>
                <Link href="/category/dunyo" className="hover:text-white transition-colors" data-testid="footer-link-world">
                  Dunyo
                </Link>
              </li>
              <li>
                <Link href="/category/sport" className="hover:text-white transition-colors" data-testid="footer-link-sports">
                  Sport
                </Link>
              </li>
              <li>
                <Link href="/category/texnologiya" className="hover:text-white transition-colors" data-testid="footer-link-technology">
                  Texnologiya
                </Link>
              </li>
              <li>
                <Link href="/category/iqtisodiyot" className="hover:text-white transition-colors" data-testid="footer-link-economy">
                  Iqtisodiyot
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div data-testid="footer-contact">
            <h4 className="font-semibold mb-4">Aloqa</h4>
            <div className="space-y-3 text-blue-200">
              <div className="flex items-center" data-testid="footer-email">
                <i className="fas fa-envelope mr-3"></i>
                <span>info@realnews.uz</span>
              </div>
              <div className="flex items-center" data-testid="footer-phone">
                <i className="fas fa-phone mr-3"></i>
                <span>+998 71 123 45 67</span>
              </div>
              <div className="flex items-center" data-testid="footer-address">
                <i className="fas fa-map-marker-alt mr-3"></i>
                <span>Toshkent sh., Amir Temur ko'chasi 1</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center" data-testid="footer-bottom">
          <div className="text-blue-200 text-sm" data-testid="footer-copyright">
            © {currentYear} RealNews. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex space-x-6 text-blue-200 text-sm mt-4 md:mt-0" data-testid="footer-legal-links">
            <a href="#" className="hover:text-white transition-colors" data-testid="footer-link-privacy">
              Maxfiylik siyosati
            </a>
            <a href="#" className="hover:text-white transition-colors" data-testid="footer-link-terms">
              Foydalanish shartlari
            </a>
            <a href="#" className="hover:text-white transition-colors" data-testid="footer-link-sitemap">
              Sayt xaritasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
