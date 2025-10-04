import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTables() {
  console.log('🔍 التحقق من الجداول في قاعدة البيانات...\n')

  try {
    // التحقق من جدول الأدوار
    const rolesCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'roles'
    `
    console.log('✅ جدول roles:', rolesCount ? 'موجود' : 'غير موجود')

    // التحقق من جدول الصلاحيات
    const permissionsCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'permissions'
    `
    console.log('✅ جدول permissions:', permissionsCount ? 'موجود' : 'غير موجود')

    // التحقق من جدول role_permissions
    const rolePermissionsCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'role_permissions'
    `
    console.log('✅ جدول role_permissions:', rolePermissionsCount ? 'موجود' : 'غير موجود')

    // التحقق من حقل custom_role_id في users
    const customRoleIdColumn = await prisma.$queryRaw`
      SELECT COUNT(*) FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'custom_role_id'
    `
    console.log('✅ حقل custom_role_id في users:', customRoleIdColumn ? 'موجود' : 'غير موجود')

    // عرض جميع الجداول
    const allTables: any[] = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('\n📋 جميع الجداول الموجودة:')
    allTables.forEach((table: any) => {
      console.log(`   - ${table.table_name}`)
    })

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()

