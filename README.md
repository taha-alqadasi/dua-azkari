# 🕌 دعاء أذكاري - نظام إدارة المحتوى الإسلامي

<div dir="rtl">

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

نظام إدارة محتوى إسلامي شامل مبني بتقنيات حديثة، مُصمم خصيصاً لإدارة ونشر الأدعية والأذكار مع دعم كامل للمحتوى الصوتي.

[الميزات](#-الميزات) • [التثبيت](#-التثبيت) • [الاستخدام](#-الاستخدام) • [التوثيق](#-التوثيق) • [المساهمة](#-المساهمة)

</div>

---

## 📋 نظرة عامة

**دعاء أذكاري** هو نظام إدارة محتوى (CMS) متكامل مُصمم خصيصاً للمحتوى الإسلامي، مع التركيز على:

- 📿 إدارة الأدعية والأذكار
- 🎧 رفع ومشاركة المقاطع الصوتية
- 📱 تصميم متجاوب بالكامل (Responsive)
- 🌐 دعم كامل للغة العربية (RTL)
- 🔐 نظام إدارة مستخدمين وصلاحيات
- 🎨 واجهة إدارة حديثة وسهلة الاستخدام

---

## ✨ الميزات

### 🎯 الميزات الأساسية

#### إدارة المحتوى
- ✅ **المنشورات (Posts)**: إنشاء وتعديل المنشورات مع محرر نصوص غني
- ✅ **التصنيفات (Categories)**: تنظيم المحتوى في تصنيفات متعددة
- ✅ **الوسوم (Tags)**: نظام وسوم مرن للتصنيف المتقدم
- ✅ **الصفحات الثابتة**: إنشاء صفحات ثابتة (من نحن، اتصل بنا، إلخ)
- ✅ **مكتبة الوسائط**: إدارة الصور والملفات الصوتية

#### المحتوى الصوتي
- 🎧 **رفع الملفات الصوتية**: دعم MP3 وتحسين تلقائي
- 🎵 **مشغل صوتي متطور**: مشغل مدمج مع قوائم تشغيل
- 📊 **إحصائيات الاستماع**: تتبع عدد مرات التشغيل
- 🔊 **جودة صوتية محسّنة**: ضغط وتحسين تلقائي

#### نظام المستخدمين
- 👥 **أدوار وصلاحيات**: نظام صلاحيات مرن (Admin, Editor, Author)
- 🔐 **مصادقة آمنة**: NextAuth.js مع bcrypt
- 📧 **إدارة الحساب**: إعادة تعيين كلمة المرور، التحقق من البريد
- 👤 **ملفات شخصية**: ملفات شخصية كاملة للمستخدمين

#### SEO وتحسين الأداء
- 🚀 **تحسين محركات البحث**: Meta tags، Open Graph، Twitter Cards
- 🗺️ **Sitemap تلقائي**: XML و HTML sitemap
- 🤖 **Robots.txt**: إدارة فهرسة محركات البحث
- ⚡ **أداء عالي**: Static Generation و ISR
- 📱 **Core Web Vitals**: محسّن للحصول على أفضل درجات

#### التخصيص
- 🎨 **إعدادات عامة**: شعار، ألوان، معلومات الموقع
- 🔗 **قوائم التنقل**: إدارة قوائم Header و Footer
- 📱 **روابط التواصل الاجتماعي**: روابط مخصصة لكل منصة
- 💰 **نظام إعلانات**: إدارة أماكن الإعلانات (Header, Footer, Sidebar)
- 🔀 **إعادة التوجيه**: نظام redirections متطور

#### لوحة التحكم
- 📊 **الإحصائيات**: لوحة تحكم شاملة مع تحليلات
- 🔔 **الإشعارات**: نظام إشعارات في الوقت الفعلي
- 🌓 **الوضع الداكن**: دعم Dark Mode
- 📱 **متجاوبة**: تصميم متجاوب بالكامل

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React Framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type Safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - UI Components
- **[TanStack Query](https://tanstack.com/query)** - Data Fetching
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State Management

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - API
- **[Prisma](https://www.prisma.io/)** - ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Database
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication

### Tools
- **[TinyMCE](https://www.tiny.cloud/)** - Rich Text Editor
- **[bcrypt](https://www.npmjs.com/package/bcryptjs)** - Password Hashing
- **[Zod](https://zod.dev/)** - Validation

---

## 🚀 التثبيت

### المتطلبات

- **Node.js**: >= 18.17 (يُفضل 20.x)
- **npm**: >= 9.0
- **PostgreSQL**: >= 14.0
- **Git**: أحدث إصدار

### خطوات التثبيت

#### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/taha-alqadasi/dua-azkari.git
cd dua-azkari
```

#### 2️⃣ تثبيت الحزم

```bash
npm install
```

#### 3️⃣ إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
createdb dua_azkari

# أو باستخدام psql
psql -U postgres
CREATE DATABASE dua_azkari;
\q
```

#### 4️⃣ إعداد متغيرات البيئة

```bash
# نسخ ملف البيئة
cp env.example .env.local

# تعديل الملف
nano .env.local
```

**ملف `.env.local`:**

```env
# Database
DATABASE_URL="postgresql://duauser:secure_password_2024@localhost:5432/dua_azkari"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3001"

# NextAuth.js
NEXTAUTH_SECRET="dua-azkari-secret-key-2024-very-secure-random-string"
NEXTAUTH_URL="http://localhost:3001"

# App Configuration
NEXT_PUBLIC_APP_NAME="دعاء أذكاري"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3001/admin"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=1f9baa58a82c7b8a7074bd24e36d4f21
CLOUDFLARE_R2_ACCESS_KEY_ID=e44f7021c266e08b05ba225ccde705fa
CLOUDFLARE_R2_SECRET_ACCESS_KEY=94e418ea4f2cb4274e1400f3fbbd63cd62ae1543f17c62cb3ec26836552d7d10
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_BUCKET=media
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://media.azkari.app
CLOUDFLARE_R2_ENDPOINT=https://1f9baa58a82c7b8a7074bd24e36d4f21.r2.cloudflarestorage.com
CLOUDFLARE_R2_USE_PATH_STYLE=false



SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="upupaapp@gmail.com"                # بريد المرسل
SMTP_PASSWORD="ykyiivozjfvzsbra"              # App Password (16 حرف من Google)
SMTP_FROM="Dua Azkari <upupaapp@gmail.com>"   # اسم وعنوان المرسل
SMTP_FROM_NAME="دعاء أذكاري"

```

#### 5️⃣ تشغيل Migrations

```bash
# تطبيق Migrations
npx prisma migrate deploy

# إنشاء Prisma Client
npx prisma generate

# (اختياري) إضافة بيانات تجريبية
npm run db:seed
```

#### 6️⃣ تشغيل التطبيق

```bash
# Development
npm run dev

# Production Build
npm run build
npm start
```

الآن يمكنك فتح المتصفح على: **http://localhost:3001**

---

## 📖 الاستخدام

### الوصول إلى لوحة التحكم

1. افتح المتصفح على: `http://localhost:3001/admin`
2. سجّل الدخول باستخدام حساب المدير الافتراضي (إذا قمت بتشغيل seed)
3. ابدأ في إضافة المحتوى!

### إنشاء منشور جديد

1. اذهب إلى **المنشورات** > **إضافة جديد**
2. أدخل العنوان والمحتوى
3. أضف تصنيفات ووسوم
4. (اختياري) أضف ملف صوتي
5. انشر المنشور

### إدارة التصنيفات

1. اذهب إلى **التصنيفات**
2. أضف تصنيفات جديدة
3. قم بترتيبها حسب الحاجة

---

## 🏗️ بنية المشروع

```
dua-azkari/
├── prisma/                 # قاعدة البيانات
│   ├── schema.prisma      # Database Schema
│   ├── migrations/        # Database Migrations
│   └── seed.ts           # Initial Data
├── public/                # الملفات الثابتة
│   ├── uploads/          # الملفات المرفوعة
│   └── tinymce/          # محرر النصوص
├── src/
│   ├── app/              # Next.js App Directory
│   │   ├── (admin)/     # صفحات الإدارة
│   │   ├── (public)/    # الصفحات العامة
│   │   └── api/         # API Routes
│   ├── components/       # React Components
│   │   ├── admin/       # مكونات الإدارة
│   │   ├── public/      # مكونات عامة
│   │   ├── shared/      # مكونات مشتركة
│   │   └── ui/          # UI Components
│   ├── lib/             # Utilities
│   ├── types/           # TypeScript Types
│   ├── hooks/           # Custom Hooks
│   └── services/        # Business Logic
├── .env.example         # نموذج متغيرات البيئة
├── next.config.ts       # إعدادات Next.js
├── tailwind.config.ts   # إعدادات Tailwind
└── tsconfig.json        # إعدادات TypeScript
```

---

## 📚 التوثيق

### الوثائق المتوفرة

- 📖 [دليل التثبيت المحلي](./README_LOCAL_DATABASE.md)
- 🚀 [دليل النشر للإنتاج](./PRODUCTION_README.md)
- 📦 [معلومات الحزمة](./PRODUCTION_PACKAGE_INFO.md)
- 🎨 [نظام الإعلانات](./ADVANCED_ADS_SYSTEM_DOCUMENTATION.md)
- 🐳 [Docker Setup](./docker-compose.yml)

### API Documentation

API endpoints متوفرة تحت `/api`:

- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/posts` - إنشاء منشور
- `GET /api/posts` - جلب المنشورات
- `GET /api/categories` - جلب التصنيفات
- `POST /api/media` - رفع ملف

للمزيد من التفاصيل، راجع كود API routes في `src/app/api/`

---

## 🌐 النشر (Deployment)

### Vercel (موصى به)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/taha-alqadasi/dua-azkari)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

### Docker

```bash
# Build Image
docker build -t dua-azkari .

# Run Container
docker run -p 3001:3001 dua-azkari
```

### نشر يدوي (VPS/Server)

راجع دليل [PRODUCTION_README.md](./PRODUCTION_README.md) للحصول على دليل شامل للنشر.

---

## 🤝 المساهمة

نرحب بجميع المساهمات! إذا كنت ترغب في المساهمة:

1. **Fork** المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/amazing-feature`)
3. قم بعمل Commit للتغييرات (`git commit -m 'Add amazing feature'`)
4. ارفع إلى الفرع (`git push origin feature/amazing-feature`)
5. افتح **Pull Request**

### قواعد المساهمة

- اتبع معايير الكود الموجودة
- اكتب تعليقات واضحة
- اختبر التغييرات قبل الرفع
- حدّث التوثيق إذا لزم الأمر

---

## 🐛 الإبلاغ عن مشاكل

إذا وجدت أي مشكلة أو لديك اقتراح:

1. تحقق من [Issues](https://github.com/taha-alqadasi/dua-azkari/issues) الموجودة
2. إذا لم تجد مشكلة مماثلة، [افتح Issue جديد](https://github.com/taha-alqadasi/dua-azkari/issues/new)
3. قدّم وصفاً واضحاً للمشكلة مع خطوات إعادة الإنتاج

---

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 👨‍💻 المطور

**Taha Al-Qadasi**

- GitHub: [@taha-alqadasi](https://github.com/taha-alqadasi)
- المشروع: [dua-azkari](https://github.com/taha-alqadasi/dua-azkari)

---

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org/) - React Framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [TinyMCE](https://www.tiny.cloud/) - Rich Text Editor

---

## 📊 إحصائيات المشروع

- **الملفات**: 480+ ملف
- **الأكواد**: 215,000+ سطر
- **التقنيات**: 15+ تقنية
- **الصفحات**: 74 صفحة
- **API Routes**: 30 endpoint

---

## 🔗 روابط مفيدة

- [التوثيق الكامل](https://github.com/taha-alqadasi/dua-azkari/wiki)
- [أمثلة الاستخدام](https://github.com/taha-alqadasi/dua-azkari/tree/main/examples)
- [الأسئلة الشائعة (FAQ)](https://github.com/taha-alqadasi/dua-azkari/wiki/FAQ)
- [Changelog](https://github.com/taha-alqadasi/dua-azkari/blob/main/CHANGELOG.md)

---

## 💡 نصائح

- 🔐 احرص على تغيير `NEXTAUTH_SECRET` في الإنتاج
- 📊 فعّل Google Analytics للإحصائيات
- 🔒 استخدم HTTPS في الإنتاج
- 💾 قم بعمل نسخ احتياطي دورية
- 📱 اختبر على أجهزة مختلفة

---

## 📞 الدعم

للحصول على الدعم:

- 📧 **Email**: [فتح issue على GitHub](https://github.com/taha-alqadasi/dua-azkari/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/taha-alqadasi/dua-azkari/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/taha-alqadasi/dua-azkari/wiki)

---

<div align="center">

### 🌟 إذا أعجبك المشروع، لا تنسَ إعطائه ⭐ على GitHub!

**صُنع بـ ❤️ لخدمة المحتوى الإسلامي**

</div>
