# 🗄️ دليل إنشاء قاعدة البيانات المحلية - دعاء أذكاري

## 🚀 الطريقة الأولى: استخدام pgAdmin

### 1. فتح pgAdmin
- ابحث عن "pgAdmin" في قائمة البرامج وشغله
- أو اذهب إلى: `C:\Program Files\PostgreSQL\17\pgAdmin 4\bin\pgAdmin4.exe`

### 2. إنشاء قاعدة البيانات
1. اتصل بالخادم المحلي (localhost)
2. انقر بزر الماوس الأيمن على "Databases"
3. اختر "Create" > "Database"
4. أدخل البيانات التالية:
   - **Database name**: `dua_azkari`
   - **Owner**: postgres (مؤقتاً)
   - اضغط "Save"

### 3. إنشاء المستخدم
1. انقر بزر الماوس الأيمن على "Login/Group Roles"
2. اختر "Create" > "Login/Group Role"
3. في تبويب "General":
   - **Name**: `duauser`
4. في تبويب "Definition":
   - **Password**: `secure_password_2024`
5. في تبويب "Privileges":
   - ✅ Can login?
   - ✅ Create databases?
   - ✅ Create roles?
6. اضغط "Save"

### 4. منح الصلاحيات
1. انقر بزر الماوس الأيمن على قاعدة البيانات `dua_azkari`
2. اختر "Properties"
3. في تبويب "Security":
   - أضف `duauser` مع صلاحيات "ALL"
4. اضغط "Save"

## 🖥️ الطريقة الثانية: استخدام Command Line (كمدير)

### 1. فتح Command Prompt كمدير
- انقر بزر الماوس الأيمن على "Command Prompt"
- اختر "Run as administrator"

### 2. تشغيل الأوامر
```cmd
cd "C:\Program Files\PostgreSQL\17\bin"

REM إنشاء المستخدم
createuser -U postgres -P duauser

REM إنشاء قاعدة البيانات
createdb -U postgres -O duauser dua_azkari

REM اختبار الاتصال
psql -U duauser -d dua_azkari -c "SELECT 'Database created successfully!' as message;"
```

## 🔧 الطريقة الثالثة: استخدام SQL مباشرة

### 1. الاتصال بـ PostgreSQL
```cmd
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
```

### 2. تنفيذ الأوامر التالية:
```sql
-- إنشاء المستخدم
CREATE USER duauser WITH PASSWORD 'secure_password_2024';

-- إنشاء قاعدة البيانات
CREATE DATABASE dua_azkari OWNER duauser;

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE dua_azkari TO duauser;

-- الاتصال بقاعدة البيانات الجديدة
\c dua_azkari;

-- منح صلاحيات على schema public
GRANT ALL ON SCHEMA public TO duauser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO duauser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO duauser;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO duauser;

-- منح صلاحيات مستقبلية
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO duauser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO duauser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO duauser;

-- الخروج
\q
```

## ✅ التحقق من نجاح الإعداد

بعد إنشاء قاعدة البيانات، اختبر الاتصال:

```cmd
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U duauser -d dua_azkari -h localhost
```

إذا نجح الاتصال، ستظهر رسالة ترحيب من PostgreSQL.

## 🚀 الخطوة التالية: إنشاء الجداول

بعد إنشاء قاعدة البيانات بنجاح، ارجع إلى مجلد المشروع وشغل:

```cmd
cd F:\fluter\auto.azkari.app-admin\dua-azkari
npm run db:migrate
npm run db:seed
```

## 🔍 استكشاف الأخطاء

### إذا لم تتمكن من الاتصال:
1. تأكد من تشغيل خدمة PostgreSQL:
   ```cmd
   services.msc
   ```
   ابحث عن "postgresql-x64-17" وتأكد أنها تعمل

2. تحقق من المنفذ:
   ```cmd
   netstat -an | findstr :5432
   ```

3. تحقق من ملف الإعدادات:
   `C:\Program Files\PostgreSQL\17\data\postgresql.conf`
   تأكد من أن `listen_addresses = '*'` أو `listen_addresses = 'localhost'`

### إذا واجهت مشاكل في الصلاحيات:
- شغل Command Prompt كمدير
- أو استخدم pgAdmin بدلاً من Command Line
