#!/bin/bash

# =============================================================================
# دليل نشر تطبيق دعاء أذكاري - سكريبت التثبيت التلقائي
# Dua Azkari Deployment Script
# =============================================================================

set -e  # إيقاف السكريبت عند حدوث خطأ

# الألوان للعرض
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة لطباعة رسائل ملونة
print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# التحقق من صلاحيات المستخدم
check_sudo() {
    if [ "$EUID" -ne 0 ]; then 
        print_warning "هذا السكريبت يحتاج صلاحيات sudo لبعض العمليات"
        print_info "سيتم طلب كلمة المرور عند الحاجة"
    fi
}

# التحقق من Node.js
check_nodejs() {
    print_header "التحقق من Node.js"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_message "Node.js مثبت: $NODE_VERSION"
        
        # التحقق من الإصدار
        REQUIRED_VERSION="18"
        CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        
        if [ "$CURRENT_VERSION" -lt "$REQUIRED_VERSION" ]; then
            print_error "Node.js version $REQUIRED_VERSION أو أحدث مطلوب"
            print_info "يمكنك تحديث Node.js باستخدام:"
            echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
            echo "    sudo apt install -y nodejs"
            exit 1
        fi
    else
        print_error "Node.js غير مثبت"
        print_info "يرجى تثبيت Node.js أولاً:"
        echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "    sudo apt install -y nodejs"
        exit 1
    fi
}

# التحقق من PostgreSQL
check_postgresql() {
    print_header "التحقق من PostgreSQL"
    
    if command -v psql &> /dev/null; then
        POSTGRES_VERSION=$(psql --version)
        print_message "PostgreSQL مثبت: $POSTGRES_VERSION"
    else
        print_error "PostgreSQL غير مثبت"
        print_info "يرجى تثبيت PostgreSQL أولاً:"
        echo "    sudo apt install -y postgresql postgresql-contrib"
        exit 1
    fi
}

# إعداد ملف البيئة
setup_env() {
    print_header "إعداد ملف البيئة"
    
    if [ ! -f ".env.production" ]; then
        if [ -f "env.production.example" ]; then
            print_info "نسخ ملف البيئة من المثال..."
            cp env.production.example .env.production
            print_warning "يرجى تعديل ملف .env.production بالقيم الصحيحة"
            print_info "اضغط Enter للمتابعة بعد التعديل..."
            read
        else
            print_error "ملف env.production.example غير موجود"
            exit 1
        fi
    else
        print_message "ملف .env.production موجود بالفعل"
    fi
}

# تثبيت الحزم
install_dependencies() {
    print_header "تثبيت الحزم"
    
    if [ -f "package.json" ]; then
        print_info "تثبيت npm packages..."
        npm ci --production
        print_message "تم تثبيت الحزم بنجاح"
        
        # تثبيت Prisma Client
        print_info "تثبيت Prisma Client..."
        npm install @prisma/client
        print_message "تم تثبيت Prisma Client بنجاح"
    else
        print_error "ملف package.json غير موجود"
        exit 1
    fi
}

# تجهيز قاعدة البيانات
setup_database() {
    print_header "تجهيز قاعدة البيانات"
    
    print_info "تشغيل Migrations..."
    npx prisma migrate deploy
    print_message "تم تشغيل Migrations بنجاح"
    
    print_info "إنشاء Prisma Client..."
    npx prisma generate
    print_message "تم إنشاء Prisma Client بنجاح"
    
    # سؤال عن البيانات التجريبية
    read -p "هل تريد إضافة بيانات تجريبية؟ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "إضافة بيانات تجريبية..."
        npm run db:seed
        print_message "تم إضافة البيانات التجريبية بنجاح"
    fi
}

# بناء التطبيق
build_application() {
    print_header "بناء التطبيق"
    
    print_info "بناء التطبيق للإنتاج..."
    
    # استخدام ملف الإعدادات الخاص بالإنتاج إذا كان موجوداً
    if [ -f "next.config.production.ts" ]; then
        print_info "استخدام next.config.production.ts..."
        cp next.config.ts next.config.backup.ts 2>/dev/null || true
        cp next.config.production.ts next.config.ts
    fi
    
    npm run build
    
    # استعادة الملف الأصلي
    if [ -f "next.config.backup.ts" ]; then
        mv next.config.backup.ts next.config.ts
    fi
    
    print_message "تم بناء التطبيق بنجاح"
}

# إعداد PM2
setup_pm2() {
    print_header "إعداد PM2"
    
    if ! command -v pm2 &> /dev/null; then
        print_info "تثبيت PM2..."
        sudo npm install -g pm2
        print_message "تم تثبيت PM2 بنجاح"
    else
        print_message "PM2 مثبت بالفعل"
    fi
    
    # إيقاف التطبيق إذا كان يعمل
    pm2 delete dua-azkari 2>/dev/null || true
    
    print_info "تشغيل التطبيق باستخدام PM2..."
    pm2 start npm --name "dua-azkari" -- start
    
    print_info "حفظ قائمة العمليات..."
    pm2 save
    
    print_info "إعداد PM2 للبدء التلقائي..."
    pm2 startup
    
    print_message "تم إعداد PM2 بنجاح"
}

# إعداد Nginx (اختياري)
setup_nginx() {
    print_header "إعداد Nginx (اختياري)"
    
    read -p "هل تريد إعداد Nginx كـ Reverse Proxy؟ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "تخطي إعداد Nginx"
        return
    fi
    
    if ! command -v nginx &> /dev/null; then
        print_info "تثبيت Nginx..."
        sudo apt install -y nginx
        print_message "تم تثبيت Nginx بنجاح"
    else
        print_message "Nginx مثبت بالفعل"
    fi
    
    print_info "يرجى إنشاء ملف الإعدادات يدوياً في:"
    echo "    /etc/nginx/sites-available/dua-azkari"
    print_info "راجع ملف PRODUCTION_README.md للتفاصيل"
}

# عرض معلومات النشر
display_info() {
    print_header "معلومات النشر"
    
    echo ""
    print_message "تم نشر التطبيق بنجاح! 🎉"
    echo ""
    print_info "معلومات مهمة:"
    echo "  • التطبيق يعمل على المنفذ: 3001"
    echo "  • يمكنك عرض السجلات باستخدام: pm2 logs dua-azkari"
    echo "  • يمكنك إيقاف التطبيق باستخدام: pm2 stop dua-azkari"
    echo "  • يمكنك إعادة تشغيل التطبيق باستخدام: pm2 restart dua-azkari"
    echo ""
    print_warning "لا تنسَ:"
    echo "  1. تعديل ملف .env.production بالقيم الصحيحة"
    echo "  2. إعداد Nginx وSSL للإنتاج"
    echo "  3. إعداد النسخ الاحتياطي التلقائي"
    echo "  4. مراجعة PRODUCTION_README.md للمزيد من التفاصيل"
    echo ""
}

# دالة التنظيف في حالة الفشل
cleanup() {
    print_error "حدث خطأ أثناء التثبيت!"
    print_info "يرجى مراجعة الأخطاء أعلاه"
    exit 1
}

# تفعيل دالة التنظيف عند الخطأ
trap cleanup ERR

# =============================================================================
# البرنامج الرئيسي
# =============================================================================

main() {
    clear
    print_header "🚀 تثبيت تطبيق دعاء أذكاري - نسخة الإنتاج"
    
    check_sudo
    check_nodejs
    check_postgresql
    setup_env
    install_dependencies
    setup_database
    build_application
    setup_pm2
    setup_nginx
    display_info
    
    print_message "انتهى التثبيت! ✅"
}

# تشغيل البرنامج الرئيسي
main

