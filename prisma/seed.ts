import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء عملية Seeding...')

  // 1. إنشاء الصلاحيات الافتراضية
  console.log('📝 إنشاء الصلاحيات...')
  
  const permissions = [
    // Posts
    { action: 'CREATE', resource: 'posts', description: 'إنشاء مقالات جديدة' },
    { action: 'READ', resource: 'posts', description: 'قراءة المقالات' },
    { action: 'UPDATE', resource: 'posts', description: 'تعديل المقالات' },
    { action: 'DELETE', resource: 'posts', description: 'حذف المقالات' },
    { action: 'PUBLISH', resource: 'posts', description: 'نشر المقالات' },
    
    // Categories
    { action: 'CREATE', resource: 'categories', description: 'إنشاء فئات جديدة' },
    { action: 'READ', resource: 'categories', description: 'قراءة الفئات' },
    { action: 'UPDATE', resource: 'categories', description: 'تعديل الفئات' },
    { action: 'DELETE', resource: 'categories', description: 'حذف الفئات' },
    
    // Tags
    { action: 'CREATE', resource: 'tags', description: 'إنشاء وسوم جديدة' },
    { action: 'READ', resource: 'tags', description: 'قراءة الوسوم' },
    { action: 'UPDATE', resource: 'tags', description: 'تعديل الوسوم' },
    { action: 'DELETE', resource: 'tags', description: 'حذف الوسوم' },
    
    // Media
    { action: 'CREATE', resource: 'media', description: 'رفع ملفات جديدة' },
    { action: 'READ', resource: 'media', description: 'عرض الملفات' },
    { action: 'DELETE', resource: 'media', description: 'حذف الملفات' },
    { action: 'MANAGE_MEDIA', resource: 'media', description: 'إدارة شاملة للوسائط' },
    
    // Users
    { action: 'MANAGE_USERS', resource: 'users', description: 'إدارة المستخدمين' },
    
    // Roles
    { action: 'MANAGE_ROLES', resource: 'roles', description: 'إدارة الأدوار والصلاحيات' },
    
    // Settings
    { action: 'MANAGE_SETTINGS', resource: 'settings', description: 'إدارة إعدادات الموقع' },
    { action: 'READ', resource: 'settings', description: 'قراءة الإعدادات' },
    { action: 'UPDATE', resource: 'settings', description: 'تعديل الإعدادات' },
    { action: 'CREATE', resource: 'settings', description: 'إنشاء إعدادات جديدة' },
    { action: 'DELETE', resource: 'settings', description: 'حذف إعدادات' },
    
    // Menus
    { action: 'MANAGE_MENUS', resource: 'menus', description: 'إدارة القوائم' },
    
    // Pages
    { action: 'CREATE', resource: 'pages', description: 'إنشاء صفحات' },
    { action: 'READ', resource: 'pages', description: 'قراءة الصفحات' },
    { action: 'UPDATE', resource: 'pages', description: 'تعديل الصفحات' },
    { action: 'DELETE', resource: 'pages', description: 'حذف الصفحات' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: {
        action_resource: {
          action: perm.action as any,
          resource: perm.resource
        }
      },
      update: {},
      create: perm as any
    })
  }

  console.log(`✅ تم إنشاء ${permissions.length} صلاحية`)

  // 2. إنشاء أدوار مخصصة افتراضية
  console.log('👥 إنشاء الأدوار المخصصة...')

  // دور "مدير محتوى" - كل الصلاحيات ماعدا إدارة المستخدمين والأدوار
  const contentManagerPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'posts' },
        { resource: 'categories' },
        { resource: 'tags' },
        { resource: 'media' },
        { resource: 'pages' },
        { 
          AND: [
            { resource: 'settings' },
            { action: { not: 'MANAGE_SETTINGS' as any } }
          ]
        }
      ]
    }
  })

  const contentManagerRole = await prisma.role.upsert({
    where: { name: 'مدير محتوى' },
    update: {},
    create: {
      name: 'مدير محتوى',
      nameEn: 'Content Manager',
      description: 'يمكنه إدارة كل المحتوى (مقالات، فئات، وسوم، وسائط)',
      isActive: true,
      isSystem: true,
      permissions: {
        create: contentManagerPermissions.map(p => ({
          permission: { connect: { id: p.id } }
        }))
      }
    }
  })

  console.log(`✅ تم إنشاء دور: ${contentManagerRole.name}`)

  // دور "كاتب" - يمكنه الكتابة فقط
  const writerPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { action: 'CREATE' as any, resource: 'posts' },
        { action: 'READ' as any, resource: 'posts' },
        { action: 'UPDATE' as any, resource: 'posts' },
        { action: 'READ' as any, resource: 'categories' },
        { action: 'READ' as any, resource: 'tags' },
        { action: 'CREATE' as any, resource: 'media' },
        { action: 'READ' as any, resource: 'media' },
      ]
    }
  })

  const writerRole = await prisma.role.upsert({
    where: { name: 'كاتب' },
    update: {},
    create: {
      name: 'كاتب',
      nameEn: 'Writer',
      description: 'يمكنه كتابة وتعديل المقالات فقط (بدون نشر)',
      isActive: true,
      isSystem: true,
      permissions: {
        create: writerPermissions.map(p => ({
          permission: { connect: { id: p.id } }
        }))
      }
    }
  })

  console.log(`✅ تم إنشاء دور: ${writerRole.name}`)

  // دور "ناشر" - يمكنه النشر فقط
  const publisherPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { action: 'READ' as any, resource: 'posts' },
        { action: 'UPDATE' as any, resource: 'posts' },
        { action: 'PUBLISH' as any, resource: 'posts' },
        { action: 'READ' as any, resource: 'categories' },
        { action: 'READ' as any, resource: 'tags' },
        { action: 'READ' as any, resource: 'media' },
      ]
    }
  })

  const publisherRole = await prisma.role.upsert({
    where: { name: 'ناشر' },
    update: {},
    create: {
      name: 'ناشر',
      nameEn: 'Publisher',
      description: 'يمكنه مراجعة ونشر المقالات فقط',
      isActive: true,
      isSystem: true,
      permissions: {
        create: publisherPermissions.map(p => ({
          permission: { connect: { id: p.id } }
        }))
      }
    }
  })

  console.log(`✅ تم إنشاء دور: ${publisherRole.name}`)

  // 3. إنشاء مستخدم أدمن افتراضي (إذا لم يكن موجوداً)
  console.log('👤 التحقق من وجود مستخدم أدمن...')

  const adminEmail = 'admin@dua-azkari.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123456', 10)
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'المدير العام',
        passwordHash,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log(`✅ تم إنشاء مستخدم أدمن:`)
    console.log(`   البريد: ${adminEmail}`)
    console.log(`   كلمة المرور: admin123456`)
    console.log(`   ⚠️  يُرجى تغيير كلمة المرور بعد أول تسجيل دخول`)
  } else {
    console.log(`ℹ️  مستخدم أدمن موجود بالفعل: ${adminEmail}`)
  }

  console.log('\n✨ تمت عملية Seeding بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ في عملية Seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
