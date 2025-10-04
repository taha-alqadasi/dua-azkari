#!/usr/bin/env node

/**
 * سكريبت تحضير المشروع للإنتاج
 * Prepare Production Build Script
 * 
 * هذا السكريبت يقوم بـ:
 * 1. إنشاء مجلد الإنتاج
 * 2. نسخ الملفات الضرورية فقط
 * 3. تنظيف الملفات غير الضرورية
 * 4. إنشاء ملف ZIP للنشر
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// الألوان للعرض في الـ Console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// دالة لطباعة رسائل ملونة
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logHeader(message) {
  console.log('');
  log('═'.repeat(60), colors.blue);
  log(`  ${message}`, colors.bright + colors.blue);
  log('═'.repeat(60), colors.blue);
  console.log('');
}

// المسارات
const ROOT_DIR = process.cwd();
const PRODUCTION_DIR = path.join(ROOT_DIR, '..', 'dua-azkari-production');
const TIMESTAMP = new Date().toISOString().split('T')[0];
const ZIP_NAME = `dua-azkari-production-${TIMESTAMP}.zip`;

// الملفات والمجلدات التي يجب نسخها
const FILES_TO_COPY = [
  'package.json',
  'package-lock.json',
  'next.config.production.ts',
  'next.config.mjs',
  'tsconfig.json',
  'components.json',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'env.production.example',
  'PRODUCTION_README.md',
  'deployment-guide.sh',
  'middleware.ts',
];

const DIRS_TO_COPY = [
  '.next',
  'public',
  'prisma',
  'src',
];

// المجلدات التي يجب استثناؤها من النسخ
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.next/cache',
  'backups',
  '.vscode',
  '.idea',
];

// دالة لإنشاء مجلد إذا لم يكن موجوداً
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// دالة لنسخ ملف
function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    ensureDir(destDir);
    fs.copyFileSync(src, dest);
    return true;
  } catch (error) {
    logError(`فشل نسخ ${src}: ${error.message}`);
    return false;
  }
}

// دالة لنسخ مجلد بشكل تكراري
function copyDir(src, dest, excludeDirs = []) {
  try {
    ensureDir(dest);
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      // تخطي المجلدات المستثناة
      if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath, excludeDirs);
      } else {
        copyFile(srcPath, destPath);
      }
    }
    
    return true;
  } catch (error) {
    logError(`فشل نسخ المجلد ${src}: ${error.message}`);
    return false;
  }
}

// دالة لإنشاء ملف package.json خاص بالإنتاج
function createProductionPackageJson() {
  logInfo('إنشاء package.json للإنتاج...');
  
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // إزالة devDependencies
  delete packageJson.devDependencies;
  
  // تحديث السكريبتات
  packageJson.scripts = {
    start: 'next start -p 3001',
    'db:migrate': 'prisma migrate deploy',
    'db:generate': 'prisma generate',
    'db:seed': 'node -r tsx/register prisma/seed.ts',
  };
  
  const productionPackageJsonPath = path.join(PRODUCTION_DIR, 'package.json');
  fs.writeFileSync(
    productionPackageJsonPath,
    JSON.stringify(packageJson, null, 2),
    'utf8'
  );
  
  logSuccess('تم إنشاء package.json للإنتاج');
}

// دالة لحذف مجلد بشكل تكراري
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// دالة رئيسية
async function main() {
  try {
    logHeader('🚀 تحضير المشروع للإنتاج');
    
    // 1. التحقق من وجود Build
    logInfo('التحقق من وجود Build...');
    const nextDir = path.join(ROOT_DIR, '.next');
    if (!fs.existsSync(nextDir)) {
      logWarning('لم يتم العثور على Build. سيتم بناء المشروع الآن...');
      logInfo('جاري بناء المشروع... (قد يستغرق بضع دقائق)');
      execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
      logSuccess('تم بناء المشروع بنجاح');
    } else {
      logSuccess('Build موجود');
    }
    
    // 2. إنشاء مجلد الإنتاج
    logInfo('إنشاء مجلد الإنتاج...');
    removeDir(PRODUCTION_DIR);
    ensureDir(PRODUCTION_DIR);
    logSuccess(`تم إنشاء مجلد: ${PRODUCTION_DIR}`);
    
    // 3. نسخ الملفات
    logInfo('نسخ الملفات الأساسية...');
    let copiedFiles = 0;
    for (const file of FILES_TO_COPY) {
      const srcPath = path.join(ROOT_DIR, file);
      const destPath = path.join(PRODUCTION_DIR, file);
      
      if (fs.existsSync(srcPath)) {
        if (copyFile(srcPath, destPath)) {
          copiedFiles++;
        }
      }
    }
    logSuccess(`تم نسخ ${copiedFiles} ملف`);
    
    // 4. نسخ المجلدات
    logInfo('نسخ المجلدات...');
    for (const dir of DIRS_TO_COPY) {
      const srcPath = path.join(ROOT_DIR, dir);
      const destPath = path.join(PRODUCTION_DIR, dir);
      
      if (fs.existsSync(srcPath)) {
        logInfo(`نسخ ${dir}...`);
        copyDir(srcPath, destPath, EXCLUDE_DIRS);
        logSuccess(`تم نسخ ${dir}`);
      }
    }
    
    // 5. إنشاء package.json للإنتاج
    createProductionPackageJson();
    
    // 6. نسخ ملف next.config.production.ts كـ next.config.ts
    const nextConfigProdPath = path.join(PRODUCTION_DIR, 'next.config.production.ts');
    const nextConfigPath = path.join(PRODUCTION_DIR, 'next.config.ts');
    if (fs.existsSync(nextConfigProdPath)) {
      copyFile(nextConfigProdPath, nextConfigPath);
      logSuccess('تم نسخ ملف الإعدادات للإنتاج');
    }
    
    // 7. إنشاء ملف .gitignore للإنتاج
    logInfo('إنشاء .gitignore للإنتاج...');
    const gitignoreContent = `node_modules/
.env.production
.env.local
*.log
.DS_Store
`;
    fs.writeFileSync(
      path.join(PRODUCTION_DIR, '.gitignore'),
      gitignoreContent,
      'utf8'
    );
    logSuccess('تم إنشاء .gitignore');
    
    // 8. إنشاء README للإنتاج
    logInfo('نسخ دليل الإنتاج...');
    const readmePath = path.join(PRODUCTION_DIR, 'README.md');
    const productionReadmePath = path.join(PRODUCTION_DIR, 'PRODUCTION_README.md');
    if (fs.existsSync(productionReadmePath)) {
      copyFile(productionReadmePath, readmePath);
      logSuccess('تم نسخ README');
    }
    
    // 9. جعل سكريبت النشر قابلاً للتنفيذ (Linux/Mac)
    if (process.platform !== 'win32') {
      const deployScriptPath = path.join(PRODUCTION_DIR, 'deployment-guide.sh');
      if (fs.existsSync(deployScriptPath)) {
        fs.chmodSync(deployScriptPath, '755');
        logSuccess('تم جعل سكريبت النشر قابلاً للتنفيذ');
      }
    }
    
    // 10. حساب حجم المجلد
    logInfo('حساب حجم الملفات...');
    const getDirectorySize = (dirPath) => {
      let size = 0;
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          size += getDirectorySize(filePath);
        } else {
          size += fs.statSync(filePath).size;
        }
      }
      
      return size;
    };
    
    const totalSize = getDirectorySize(PRODUCTION_DIR);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    logSuccess(`حجم ملفات الإنتاج: ${sizeMB} MB`);
    
    // 11. إنشاء ملف ZIP (إذا كان متاحاً)
    logHeader('إنشاء ملف ZIP');
    logInfo('جاري ضغط الملفات...');
    
    try {
      const zipPath = path.join(ROOT_DIR, '..', ZIP_NAME);
      
      if (process.platform === 'win32') {
        // Windows: استخدام PowerShell
        const cmd = `powershell Compress-Archive -Path "${PRODUCTION_DIR}\\*" -DestinationPath "${zipPath}" -Force`;
        execSync(cmd);
      } else {
        // Linux/Mac: استخدام zip
        const cmd = `cd "${path.dirname(PRODUCTION_DIR)}" && zip -r "${zipPath}" "${path.basename(PRODUCTION_DIR)}"`;
        execSync(cmd, { stdio: 'ignore' });
      }
      
      const zipSize = fs.statSync(zipPath).size;
      const zipSizeMB = (zipSize / (1024 * 1024)).toFixed(2);
      
      logSuccess(`تم إنشاء ملف ZIP: ${ZIP_NAME}`);
      logSuccess(`حجم الملف المضغوط: ${zipSizeMB} MB`);
      logInfo(`الموقع: ${zipPath}`);
    } catch (error) {
      logWarning('لم يتم إنشاء ملف ZIP (قد لا يكون متاحاً على نظامك)');
      logInfo('يمكنك ضغط المجلد يدوياً: ' + PRODUCTION_DIR);
    }
    
    // 12. عرض الملخص النهائي
    logHeader('✅ تم تحضير المشروع للإنتاج بنجاح');
    
    console.log('');
    logInfo('📦 ملفات الإنتاج جاهزة في:');
    console.log(`   ${PRODUCTION_DIR}`);
    console.log('');
    logInfo('📝 الخطوات التالية:');
    console.log('   1. مراجعة ملف PRODUCTION_README.md');
    console.log('   2. رفع الملفات للسيرفر');
    console.log('   3. تشغيل deployment-guide.sh للتثبيت التلقائي');
    console.log('   4. أو اتباع خطوات التثبيت اليدوية في PRODUCTION_README.md');
    console.log('');
    logWarning('⚠ لا تنسَ:');
    console.log('   • تعديل ملف .env.production بالقيم الصحيحة');
    console.log('   • إعداد قاعدة البيانات');
    console.log('   • إعداد Nginx و SSL');
    console.log('   • إعداد النسخ الاحتياطي');
    console.log('');
    
  } catch (error) {
    logError('حدث خطأ أثناء تحضير المشروع:');
    logError(error.message);
    console.error(error);
    process.exit(1);
  }
}

// تشغيل البرنامج
main();

