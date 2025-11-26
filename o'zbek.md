# RealNews - O'zbekcha Yangiliklar Platformasi

## Loyiha Haqida

**RealNews** - bu zamonaviy yangiliklar agregatsiya platformasi bo'lib, turli manbalardan (RSS feedlar) yangiliklar to'playdi, filtrlaydi va foydalanuvchilarga qulay ko'rinishda taqdim etadi. Platforma o'zbek tilidagi auditoriya uchun mo'ljallangan va Gemini AI yordamida maqolalarni tarjima qilish, yaxshilash va original kontent yaratish imkoniyatlariga ega.

---

## Texnologik Stack

### Frontend (Mijoz tomoni)
- **React 18** - foydalanuvchi interfeysi uchun
- **TypeScript** - xavfsiz kod yozish uchun tip tizimi
- **Vite** - tez development server va build tool
- **TanStack React Query** - server ma'lumotlarini boshqarish
- **Wouter** - sahifalar orasida navigatsiya (routing)
- **Tailwind CSS** - zamonaviy stillar
- **Shadcn/UI** - tayyor UI komponentlar (Radix UI asosida)
- **Lucide React** - ikonkalar

### Backend (Server tomoni)
- **Node.js** - JavaScript runtime
- **Express.js** - web server framework
- **TypeScript** - xavfsiz backend kodi
- **Drizzle ORM** - ma'lumotlar bazasi bilan ishlash
- **bcryptjs** - parollarni xavfsiz hashlash
- **express-session** - foydalanuvchi sessiyalari

### Ma'lumotlar Bazasi
- **PostgreSQL** (Neon) - asosiy ma'lumotlar bazasi
- **MemStorage** - development uchun xotirada saqlash

### AI va Xizmatlar
- **Gemini 2.0 Flash API** - maqolalarni tarjima qilish, yaxshilash va yaratish (tezroq va arzonroq model!)
- **Unsplash API** - maqolalar uchun rasmlar
- **Telegram Bot API** - bildirishnomalar yuborish

---

## Loyiha Tuzilmasi

```
project/
├── client/                 # Frontend (React)
│   └── src/
│       ├── components/     # Qayta ishlatiladigan komponentlar
│       │   ├── ui/        # Shadcn UI komponentlari
│       │   ├── header.tsx # Sayt sarlavhasi
│       │   ├── footer.tsx # Sayt pastki qismi
│       │   ├── sidebar.tsx # Yon panel
│       │   └── news-card.tsx # Yangilik kartasi
│       ├── pages/         # Sahifalar
│       │   ├── home.tsx   # Bosh sahifa
│       │   ├── admin.tsx  # Admin panel
│       │   ├── login.tsx  # Kirish sahifasi
│       │   ├── category.tsx # Kategoriya sahifasi
│       │   └── article.tsx # Maqola sahifasi
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Yordamchi funksiyalar
│
├── server/                # Backend (Express)
│   ├── routes.ts          # API endpointlar
│   ├── storage.ts         # MemStorage (xotirada saqlash)
│   ├── db-storage.ts      # PostgreSQL storage
│   ├── auth.ts            # Autentifikatsiya servisi
│   ├── middleware/
│   │   └── auth.ts        # Himoya middleware
│   └── services/
│       ├── rss-parser.ts  # RSS feedlarni o'qish
│       ├── ai-generator.ts # AI content generatsiya
│       └── image-service.ts # Rasm xizmati
│
├── shared/                # Umumiy kod
│   └── schema.ts          # Ma'lumotlar modellari (Drizzle)
│
└── attached_assets/       # Yuklangan fayllar
```

---

## Ma'lumotlar Modeli

### Asosiy Jadvallar

#### 1. Users (Foydalanuvchilar)
```typescript
{
  id: string,           // UUID
  username: string,     // Foydalanuvchi nomi
  email: string,        // Email
  password: string,     // Hashlangan parol (bcrypt)
  role: string,         // "admin" yoki "user"
  isActive: string,     // "true" yoki "false"
  createdAt: Date       // Yaratilgan sana
}
```

#### 2. Categories (Kategoriyalar)
```typescript
{
  id: string,           // UUID
  name: string,         // "O'zbekiston", "Sport", "Texnologiya"...
  slug: string,         // "ozbekiston", "sport", "texnologiya"...
  icon: string,         // FontAwesome ikonka
  color: string,        // Rang kodi (#1a365d)
  createdAt: Date
}
```

#### 3. Articles (Maqolalar)
```typescript
{
  id: string,
  title: string,        // Sarlavha
  slug: string,         // URL uchun
  description: string,  // Qisqa tavsif
  content: string,      // To'liq matn
  imageUrl: string,     // Rasm manzili
  sourceUrl: string,    // Manba linki
  sourceName: string,   // Manba nomi
  categoryId: string,   // Kategoriya ID
  publishedAt: Date,    // Nashr sanasi
  views: number,        // Ko'rishlar soni
  likes: number,        // Yoqtirganlar
  isBreaking: string,   // Tezkor yangilik
  isFeatured: string,   // Asosiy yangilik
  createdAt: Date
}
```

#### 4. RssFeeds (RSS Manbalar)
```typescript
{
  id: string,
  url: string,          // RSS feed URL
  name: string,         // Feed nomi
  categoryId: string,   // Kategoriya
  isActive: string,     // Faol/Nofaol
  lastFetchedAt: Date,  // Oxirgi yangilanish
  createdAt: Date
}
```

#### 5. Newsletters (Email Obunalar)
```typescript
{
  id: string,
  email: string,        // Obunachi emaili
  isActive: string,
  createdAt: Date
}
```

---

## API Endpointlar

### Umumiy (Public)
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/articles` | Barcha maqolalar |
| GET | `/api/articles/:slug` | Bitta maqola |
| GET | `/api/articles/featured` | Asosiy maqolalar |
| GET | `/api/articles/breaking` | Tezkor yangiliklar |
| GET | `/api/articles/trending` | Ommabop maqolalar |
| GET | `/api/categories` | Barcha kategoriyalar |
| GET | `/api/categories/:slug/articles` | Kategoriya maqolalari |
| GET | `/api/search?q=...` | Qidiruv |
| POST | `/api/newsletter` | Obuna bo'lish |

### Autentifikatsiya
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish |
| POST | `/api/auth/logout` | Chiqish |
| GET | `/api/auth/me` | Joriy foydalanuvchi |

### Admin Panel (Himoyalangan)
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/admin/rss-feeds` | RSS feedlar ro'yxati |
| POST | `/api/admin/rss-feeds` | Yangi RSS qo'shish |
| POST | `/api/admin/fetch-rss` | RSS yangilash |
| POST | `/api/admin/articles` | Yangi maqola yaratish |
| PUT | `/api/admin/articles/:id` | Maqolani tahrirlash |
| DELETE | `/api/admin/articles/:id` | Maqolani o'chirish |
| PATCH | `/api/admin/articles/:id/featured` | Asosiy qilish |
| PATCH | `/api/admin/articles/:id/breaking` | Tezkor qilish |
| GET | `/api/admin/newsletters` | Obunchilar ro'yxati |

---

## Xavfsizlik

### Parol Xavfsizligi
- **bcryptjs** kutubxonasi bilan parollar hashlanadi
- Salt rounds: 12
- Parol hech qachon ochiq saqlanmaydi

### Sessiya Boshqaruvi
- **express-session** yordamida sessiyalar boshqariladi
- Cookie-based autentifikatsiya
- Admin panelga kirish faqat login qilingandan keyin

### Middleware Himoya
- `requireAuth` - autentifikatsiya tekshiruvi
- `requireAdmin` - admin huquqlari tekshiruvi
- Barcha `/api/admin/*` endpointlar himoyalangan

---

## Admin Panel Funksiyalari

### Maqolalarni Boshqarish (CRUD)
1. **Ko'rish** - Barcha maqolalar ro'yxati, kategoriya bo'yicha filtrlash
2. **Yaratish** - Qo'lda yangi maqola qo'shish
3. **Tahrirlash** - Maqola sarlavhasi, matni, rasmi va kategoriyasini o'zgartirish
4. **O'chirish** - Xavfsizlik tasdiqi bilan maqolani butunlay o'chirish
5. **Status** - Asosiy/Tezkor yangilik sifatida belgilash

### RSS Feedlar
- Yangi RSS manba qo'shish
- RSS feedlarni yangilash (AI tarjima bilan)
- Faol/nofaol qilish

### Newsletter
- Obunchilar ro'yxatini ko'rish
- Statistika

### AI Imkoniyatlari
- Maqolalarni o'zbek tiliga tarjima qilish
- Mavjud maqolalarni yaxshilash
- Original maqolalar yaratish

---

## Loyihani Ishga Tushirish

### Development Mode
```bash
npm run dev
```
Bu buyruq Express serverni va Vite development serverni ishga tushiradi.

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```
DATABASE_URL=postgresql://...     # PostgreSQL connection string
GEMINI_API_KEY=...               # Google Gemini API kaliti
UNSPLASH_ACCESS_KEY=...          # Unsplash API kaliti
TELEGRAM_BOT_TOKEN=...           # Telegram bot tokeni
SESSION_SECRET=...               # Sessiya maxfiy kaliti
```

---

## Login Ma'lumotlari

### Admin Akkaunt
- **Foydalanuvchi nomi:** `Akramjon`
- **Parol:** `Gisobot201415*`

---

## Kelajak Rejalar

1. **Push Notifications** - Brauzerlarga bildirishnomalar yuborish
2. **Stories** - Instagram-style hikoyalar
3. **Telegram Integration** - To'liq bot integratsiyasi
4. **Dark Mode** - Qorong'i mavzu
5. **PWA** - Progressive Web App sifatida ishlatish
6. **SEO Optimization** - Qidiruv tizimlarida yuqori o'rinlar

---

## Texnik Qaydlar

- **Port:** 5000 (frontend va backend bitta portda)
- **Session Store:** Memory (development), PostgreSQL (production)
- **Image Storage:** Unsplash URL'lari
- **Locale:** uz-UZ (O'zbek tili)

---

**Mualliflik huquqi** 2025 RealNews. Barcha huquqlar himoyalangan.
