# 🗄️ إعداد قاعدة البيانات المحلية - دعاء أذكاري

## 📋 الخطوات المطلوبة

### 1️⃣ إنشاء قاعدة البيانات والمستخدم

**اختر إحدى الطرق التالية:**

#### 🌐 الطريقة الأسهل: استخدام pgAdmin
1. شغل pgAdmin من قائمة البرامج
2. اتبع التعليمات في ملف: `manual_database_setup.md`

#### 🖥️ الطريقة السريعة: Command Line (كمدير)
1. شغل Command Prompt كمدير
2. نفذ الأوامر التالية:
```cmd
cd "C:\Program Files\PostgreSQL\17\bin"
createuser -U postgres -P duauser
createdb -U postgres -O duauser dua_azkari
```

### 2️⃣ إنشاء الجداول والبيانات الأولية

بعد إنشاء قاعدة البيانات، شغل:
```cmd
setup_tables_and_data.bat
```

أو يدوياً:
```cmd
cd F:\fluter\auto.azkari.app-admin\dua-azkari
npm run db:migrate
npm run db:seed
```

### 3️⃣ تشغيل التطبيق

```cmd
cd F:\fluter\auto.azkari.app-admin\dua-azkari
npm run dev
```

## 🔧 الملفات المساعدة

- `manual_database_setup.md` - دليل تفصيلي لإنشاء قاعدة البيانات
- `setup_tables_and_data.bat` - سكريبت إنشاء الجداول
- `setup_local_database.sql` - سكريبت SQL لإنشاء قاعدة البيانات

## 📊 بيانات الاتصال الجديدة

- **المضيف**: localhost
- **المنفذ**: 5432 (PostgreSQL الافتراضي)
- **قاعدة البيانات**: dua_azkari
- **المستخدم**: duauser
- **كلمة المرور**: secure_password_2024

## 🌐 روابط التطبيق

- **التطبيق**: http://localhost:3001
- **تسجيل الدخول**: http://localhost:3001/admin/login
- **لوحة التحكم**: http://localhost:3001/admin

## 🔐 بيانات تسجيل الدخول للتطبيق

- **البريد الإلكتروني**: admin@azkari.app
- **كلمة المرور**: admin123456

## ✅ التحقق من نجاح الإعداد

للتأكد من أن كل شيء يعمل:

1. **اختبار قاعدة البيانات**:
```cmd
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U duauser -d dua_azkari -h localhost -c "SELECT COUNT(*) FROM users;"
```

2. **اختبار التطبيق**:
   - افتح http://localhost:3001
   - سجل دخول بالبيانات المذكورة أعلاه

## 🚨 استكشاف الأخطاء

### إذا لم تتمكن من الاتصال بـ PostgreSQL:
1. تأكد من تشغيل الخدمة:
```cmd
services.msc
```
ابحث عن "postgresql-x64-17"

2. أعد تشغيل الخدمة:
```cmd
net stop postgresql-x64-17
net start postgresql-x64-17
```

### إذا واجهت مشاكل في الصلاحيات:
- شغل Command Prompt كمدير
- أو استخدم pgAdmin

### إذا فشل في إنشاء الجداول:
1. تأكد من الاتصال بقاعدة البيانات
2. تحقق من ملف `.env.local` أن DATABASE_URL صحيح
3. شغل `npm install` للتأكد من تثبيت جميع الحزم

## 🎯 المزايا الجديدة

✅ **أداء أفضل** - قاعدة بيانات محلية أسرع  
✅ **استقلالية** - لا تحتاج Docker  
✅ **سهولة الإدارة** - pgAdmin مدمج  
✅ **موثوقية** - خدمة Windows مستقرة  

---

**ملاحظة**: تم تحديث إعدادات المشروع للاتصال بقاعدة البيانات المحلية على المنفذ 5432 بدلاً من Docker على المنفذ 5434.
