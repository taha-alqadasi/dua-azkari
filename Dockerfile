# استخدام Node.js 20 Alpine كصورة أساسية
FROM node:20-alpine AS base

# تثبيت التبعيات المطلوبة للنظام
RUN apk add --no-cache libc6-compat wget

# إعداد مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت جميع التبعيات (بما في ذلك dev dependencies للبناء)
RUN npm ci && npm cache clean --force

# إنشاء Prisma Client
RUN npx prisma generate

# نسخ باقي الملفات
COPY . .

# نسخ وإعداد script الإعداد
COPY scripts/setup-db.sh /usr/local/bin/setup-db.sh
RUN chmod +x /usr/local/bin/setup-db.sh

# إنشاء المستخدم nextjs
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# إنشاء مجلدات الرفع
RUN mkdir -p /app/public/uploads/audio /app/public/uploads/image /app/public/uploads/video /app/public/uploads/document
RUN chown -R nextjs:nodejs /app/public/uploads

# بناء التطبيق
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# بناء التطبيق بدون turbopack لتجنب مشاكل الإنتاج
RUN npm run build:prod

# تغيير المالك للمستخدم nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# كشف المنفذ
EXPOSE 3001

# متغيرات البيئة
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# تشغيل التطبيق مع إعداد قاعدة البيانات
ENTRYPOINT ["/usr/local/bin/setup-db.sh"]
CMD ["npm", "start"]
