import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixForeignKey() {
  console.log('🔧 إصلاح Foreign Key Constraint...')

  try {
    // حذف الـ constraint القديم وإعادة إنشائه
    await prisma.$executeRaw`
      ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "users_custom_role_id_fkey"
    `

    await prisma.$executeRaw`
      ALTER TABLE "users" 
      ADD CONSTRAINT "users_custom_role_id_fkey" 
      FOREIGN KEY ("custom_role_id") 
      REFERENCES "roles"("id") 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `

    console.log('✅ تم إصلاح Foreign Key بنجاح!')
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixForeignKey()

