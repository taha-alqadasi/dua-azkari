# 🚀 دليل نشر تطبيق دعاء أذكاري - الإنتاج

## 📋 نظرة عامة

هذا الدليل الشامل لنشر تطبيق **دعاء أذكاري** على بيئة الإنتاج.

---

## ⚙️ متطلبات النظام

### الحد الأدنى
- **Node.js**: >= 18.17
- **npm**: >= 9.0
- **PostgreSQL**: >= 14.0
- **RAM**: 2GB على الأقل
- **Storage**: 10GB على الأقل

### الموصى به
- **Node.js**: >= 20.0
- **PostgreSQL**: >= 15.0
- **RAM**: 4GB
- **Storage**: 20GB
- **CPU**: 2 cores

---

## 📦 محتويات الحزمة

```
dua-azkari-production/
├── .next/                    # ملفات البناء (Production Build)
├── public/                   # الملفات الثابتة
│   ├── uploads/             # الملفات المرفوعة
│   └── tinymce/             # محرر النصوص
├── prisma/                   # قاعدة البيانات
│   ├── schema.prisma        # Schema
│   ├── migrations/          # Migrations
│   └── seed.ts             # البيانات الابتدائية
├── src/                      # الكود المصدري (للرجوع فقط)
├── node_modules/            # الحزم (يجب تثبيتها)
├── package.json             # Dependencies
├── next.config.production.ts # إعدادات الإنتاج
├── env.production.example   # مثال متغيرات البيئة
├── PRODUCTION_README.md     # هذا الملف
└── deployment-guide.sh      # سكريبت النشر التلقائي
```

---

## 🔧 خطوات التثبيت

### 1️⃣ تجهيز السيرفر

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js (20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# التحقق من الإصدار
node --version
npm --version

# تثبيت PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# تشغيل PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2️⃣ إنشاء قاعدة البيانات

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# إنشاء المستخدم وقاعدة البيانات
CREATE USER duauser WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE dua_azkari_production OWNER duauser;
GRANT ALL PRIVILEGES ON DATABASE dua_azkari_production TO duauser;

# الخروج
\q
```

### 3️⃣ تحميل ورفع الملفات

```bash
# إنشاء مجلد التطبيق
sudo mkdir -p /var/www/dua-azkari
cd /var/www/dua-azkari

# رفع الملفات (استخدم scp أو rsync)
# مثال:
scp -r dua-azkari-production.zip user@server:/var/www/dua-azkari/

# فك الضغط
unzip dua-azkari-production.zip
```

### 4️⃣ إعداد متغيرات البيئة

```bash
# نسخ ملف البيئة
cp env.production.example .env.production

# تعديل الملف بمحرر نصوص
nano .env.production
```

**تعديل القيم التالية:**

```env
# Database
DATABASE_URL="postgresql://duauser:YOUR_PASSWORD@localhost:5432/dua_azkari_production"

# NextAuth - توليد Secret جديد
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"

# App URLs
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_ADMIN_URL="https://yourdomain.com/admin"

# Email (اختياري)
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASSWORD="YOUR_SMTP_PASSWORD"
```

### 5️⃣ تثبيت الحزم

```bash
# تثبيت Dependencies
npm ci --production

# تثبيت Prisma Client
npm install @prisma/client
```

### 6️⃣ تجهيز قاعدة البيانات

```bash
# تشغيل Migrations
npx prisma migrate deploy

# إنشاء Prisma Client
npx prisma generate

# (اختياري) إضافة بيانات تجريبية
npm run db:seed
```

### 7️⃣ بناء التطبيق (إن لم يكن مبني مسبقاً)

```bash
# Build للإنتاج
npm run build
```

### 8️⃣ تشغيل التطبيق

#### خيار 1: استخدام PM2 (موصى به)

```bash
# تثبيت PM2
sudo npm install -g pm2

# تشغيل التطبيق
pm2 start npm --name "dua-azkari" -- start

# حفظ قائمة العمليات
pm2 save

# تشغيل PM2 تلقائياً عند بدء النظام
pm2 startup
```

#### خيار 2: استخدام systemd

```bash
# إنشاء ملف Service
sudo nano /etc/systemd/system/dua-azkari.service
```

**محتوى الملف:**

```ini
[Unit]
Description=Dua Azkari Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dua-azkari
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# تفعيل وتشغيل الخدمة
sudo systemctl daemon-reload
sudo systemctl enable dua-azkari
sudo systemctl start dua-azkari

# التحقق من الحالة
sudo systemctl status dua-azkari
```

---

## 🌐 إعداد Nginx (Reverse Proxy)

### تثبيت Nginx

```bash
sudo apt install -y nginx
```

### إعداد الموقع

```bash
sudo nano /etc/nginx/sites-available/dua-azkari
```

**محتوى الملف:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (استخدم Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Uploads folder
    location /uploads {
        alias /var/www/dua-azkari/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Limits
    client_max_body_size 10M;
}
```

### تفعيل الموقع

```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/dua-azkari /etc/nginx/sites-enabled/

# اختبار الإعدادات
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

---

## 🔒 إعداد SSL (Let's Encrypt)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# التجديد التلقائي (يتم تلقائياً)
sudo certbot renew --dry-run
```

---

## 📊 المراقبة والصيانة

### مراقبة التطبيق

```bash
# باستخدام PM2
pm2 logs dua-azkari
pm2 monit

# باستخدام systemd
sudo journalctl -u dua-azkari -f
```

### النسخ الاحتياطي

```bash
# نسخ قاعدة البيانات
pg_dump -U duauser dua_azkari_production > backup_$(date +%Y%m%d).sql

# نسخ الملفات المرفوعة
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/dua-azkari/public/uploads/
```

### التحديثات

```bash
# إيقاف التطبيق
pm2 stop dua-azkari

# سحب التحديثات الجديدة
# (رفع الملفات الجديدة)

# تثبيت الحزم الجديدة
npm ci --production

# تشغيل Migrations
npx prisma migrate deploy

# بناء التطبيق
npm run build

# إعادة تشغيل التطبيق
pm2 restart dua-azkari
```

---

## 🔍 استكشاف الأخطاء

### التطبيق لا يعمل

```bash
# التحقق من حالة التطبيق
pm2 status
# أو
sudo systemctl status dua-azkari

# التحقق من السجلات
pm2 logs dua-azkari --lines 100
# أو
sudo journalctl -u dua-azkari -n 100
```

### مشاكل قاعدة البيانات

```bash
# التحقق من اتصال PostgreSQL
sudo systemctl status postgresql

# اختبار الاتصال
psql -U duauser -d dua_azkari_production -h localhost
```

### مشاكل الأداء

```bash
# مراقبة موارد النظام
htop

# مراقبة استخدام القرص
df -h

# مراقبة استخدام الذاكرة
free -h
```

---

## 📞 الدعم والمساعدة

### الموارد المفيدة

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)

### معلومات التواصل

- البريد الإلكتروني: support@yourdomain.com
- الموقع: https://yourdomain.com

---

## ✅ Checklist التثبيت

- [ ] تثبيت Node.js وNPM
- [ ] تثبيت PostgreSQL
- [ ] إنشاء قاعدة البيانات
- [ ] رفع الملفات للسيرفر
- [ ] إعداد ملف .env.production
- [ ] تثبيت الحزم (npm ci)
- [ ] تشغيل Migrations
- [ ] بناء التطبيق (npm run build)
- [ ] تشغيل التطبيق (PM2 أو systemd)
- [ ] إعداد Nginx
- [ ] إعداد SSL
- [ ] اختبار الموقع
- [ ] إعداد النسخ الاحتياطي
- [ ] إعداد المراقبة

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2025 دعاء أذكاري

---

**🎉 مبروك! تطبيق دعاء أذكاري الآن جاهز للعمل في بيئة الإنتاج**

