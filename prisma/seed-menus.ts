import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء زراعة القوائم في قاعدة البيانات...')

  // حذف القوائم القديمة إن وجدت
  const existingMenus = await prisma.setting.findUnique({
    where: { settingKey: 'menus' }
  })

  if (existingMenus) {
    console.log('⚠️ توجد قوائم سابقة، سيتم تحديثها...')
  }

  // بيانات القوائم الافتراضية
  const menusSettings = {
    headerMenu: [
      {
        id: 'header-1',
        label: 'الرئيسية',
        url: '/',
        icon: '🏠',
        target: '_self',
        orderNumber: 1,
        isActive: true
      },
      {
        id: 'header-2',
        label: 'التصنيفات',
        url: '/categories',
        icon: '📂',
        target: '_self',
        orderNumber: 2,
        isActive: true
      },
      {
        id: 'header-3',
        label: 'الوسوم',
        url: '/tags',
        icon: '🏷️',
        target: '_self',
        orderNumber: 3,
        isActive: true
      },
      {
        id: 'header-4',
        label: 'جميع المقاطع',
        url: '/listen-all',
        icon: '🎧',
        target: '_self',
        orderNumber: 4,
        isActive: true
      },
      {
        id: 'header-5',
        label: 'من نحن',
        url: '/about',
        icon: 'ℹ️',
        target: '_self',
        orderNumber: 5,
        isActive: true
      },
      {
        id: 'header-6',
        label: 'اتصل بنا',
        url: '/contact',
        icon: '📧',
        target: '_self',
        orderNumber: 6,
        isActive: true
      }
    ],
    footerMenu: [
      // روابط سريعة
      {
        id: 'footer-quick-1',
        label: 'الرئيسية',
        url: '/',
        icon: '',
        target: '_self',
        orderNumber: 1,
        isActive: true,
        category: 'روابط سريعة'
      },
      {
        id: 'footer-quick-2',
        label: 'التصنيفات',
        url: '/categories',
        icon: '',
        target: '_self',
        orderNumber: 2,
        isActive: true,
        category: 'روابط سريعة'
      },
      {
        id: 'footer-quick-3',
        label: 'جميع المقاطع',
        url: '/listen-all',
        icon: '',
        target: '_self',
        orderNumber: 3,
        isActive: true,
        category: 'روابط سريعة'
      },
      {
        id: 'footer-quick-4',
        label: 'الوسوم',
        url: '/tags',
        icon: '',
        target: '_self',
        orderNumber: 4,
        isActive: true,
        category: 'روابط سريعة'
      }
    ],
    sidebarMenu: [
      {
        id: 'sidebar-1',
        label: 'أدعية يومية',
        url: '/category/daily-duas',
        icon: '🌅',
        target: '_self',
        orderNumber: 1,
        isActive: true
      },
      {
        id: 'sidebar-2',
        label: 'أدعية الصلاة',
        url: '/category/prayer-duas',
        icon: '🕌',
        target: '_self',
        orderNumber: 2,
        isActive: true
      },
      {
        id: 'sidebar-3',
        label: 'أذكار النوم',
        url: '/category/sleep-azkar',
        icon: '🌙',
        target: '_self',
        orderNumber: 3,
        isActive: true
      },
      {
        id: 'sidebar-4',
        label: 'أذكار الصباح',
        url: '/category/morning-azkar',
        icon: '☀️',
        target: '_self',
        orderNumber: 4,
        isActive: true
      },
      {
        id: 'sidebar-5',
        label: 'أذكار المساء',
        url: '/category/evening-azkar',
        icon: '🌆',
        target: '_self',
        orderNumber: 5,
        isActive: true
      },
      {
        id: 'sidebar-6',
        label: 'الرقية الشرعية',
        url: '/category/ruqyah',
        icon: '📿',
        target: '_self',
        orderNumber: 6,
        isActive: true
      }
    ]
  }

  // إنشاء أو تحديث القوائم في قاعدة البيانات
  await prisma.setting.upsert({
    where: { settingKey: 'menus' },
    update: {
      settingValue: menusSettings,
      updatedAt: new Date()
    },
    create: {
      settingKey: 'menus',
      settingGroup: 'menus',
      settingValue: menusSettings
    }
  })

  console.log('✅ تم زراعة القوائم بنجاح!')
  console.log(`   - قائمة الهيدر: ${menusSettings.headerMenu.length} عنصر`)
  console.log(`   - قائمة الفوتر: ${menusSettings.footerMenu.length} عنصر`)
  console.log(`   - القائمة الجانبية: ${menusSettings.sidebarMenu.length} عنصر`)
}

main()
  .catch((e) => {
    console.error('❌ خطأ في زراعة القوائم:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

