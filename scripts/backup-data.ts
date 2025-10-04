import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function backupData() {
  console.log('🔄 بدء عملية حفظ البيانات...')

  const backupDir = path.join(__dirname, '..', 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)

  try {
    // جلب جميع البيانات من الجداول الموجودة
    const backup: any = {}

    // Users
    const users = await prisma.user.findMany({
      include: {
        posts: true,
        pages: true,
        mediaLibrary: true
      }
    })
    backup.users = users
    console.log(`✅ تم حفظ ${users.length} مستخدم`)

    // Categories
    const categories = await prisma.category.findMany()
    backup.categories = categories
    console.log(`✅ تم حفظ ${categories.length} فئة`)

    // Tags
    const tags = await prisma.tag.findMany()
    backup.tags = tags
    console.log(`✅ تم حفظ ${tags.length} وسم`)

    // Posts
    const posts = await prisma.post.findMany({
      include: {
        tags: true
      }
    })
    backup.posts = posts
    console.log(`✅ تم حفظ ${posts.length} مقال`)

    // Settings
    const settings = await prisma.setting.findMany()
    backup.settings = settings
    console.log(`✅ تم حفظ ${settings.length} إعداد`)

    // Pages
    const pages = await prisma.page.findMany()
    backup.pages = pages
    console.log(`✅ تم حفظ ${pages.length} صفحة`)

    // Media Library
    const media = await prisma.mediaLibrary.findMany()
    backup.mediaLibrary = media
    console.log(`✅ تم حفظ ${media.length} ملف وسائط`)

    // Redirections
    const redirections = await prisma.redirection.findMany()
    backup.redirections = redirections
    console.log(`✅ تم حفظ ${redirections.length} إعادة توجيه`)

    // Custom Fields
    const customFields = await prisma.customField.findMany()
    backup.customFields = customFields
    console.log(`✅ تم حفظ ${customFields.length} حقل مخصص`)

    // حفظ البيانات في ملف JSON
    fs.writeFileSync(
      backupFile,
      JSON.stringify(backup, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2)
    )

    console.log(`\n✨ تم حفظ جميع البيانات بنجاح في:`)
    console.log(`📁 ${backupFile}`)
    console.log(`\nإحصائيات النسخة الاحتياطية:`)
    console.log(`- ${users.length} مستخدم`)
    console.log(`- ${categories.length} فئة`)
    console.log(`- ${tags.length} وسم`)
    console.log(`- ${posts.length} مقال`)
    console.log(`- ${settings.length} إعداد`)
    console.log(`- ${pages.length} صفحة`)
    console.log(`- ${media.length} ملف وسائط`)
    console.log(`- ${redirections.length} إعادة توجيه`)
    console.log(`- ${customFields.length} حقل مخصص`)

    return backupFile
  } catch (error) {
    console.error('❌ خطأ في حفظ البيانات:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupData()
  .then((file) => {
    console.log('\n✅ اكتملت عملية الحفظ بنجاح!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ فشلت عملية الحفظ:', error)
    process.exit(1)
  })

