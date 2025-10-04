/**
 * تحويل النص إلى slug صالح لعنوان URL
 * يدعم العربية والإنجليزية
 */
export function slugify(text: string): string {
  if (!text) return ''

  // تحويل النص إلى lowercase
  let slug = text.toString().toLowerCase().trim()

  // استبدال المسافات والأحرف الخاصة بـ "-"
  slug = slug
    .replace(/\s+/g, '-')           // استبدال المسافات بـ "-"
    .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '-')  // إبقاء العربية والإنجليزية والأرقام والشرطات فقط
    .replace(/-+/g, '-')            // استبدال شرطات متعددة بشرطة واحدة
    .replace(/^-+/, '')             // حذف الشرطات من البداية
    .replace(/-+$/, '')             // حذف الشرطات من النهاية

  return slug
}

/**
 * التحقق من صحة slug
 */
export function isValidSlug(slug: string): boolean {
  // يجب أن يحتوي فقط على أحرف عربية أو إنجليزية أو أرقام أو شرطات
  const slugRegex = /^[\u0600-\u06FFa-z0-9]+(?:-[\u0600-\u06FFa-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * توليد slug فريد عن طريق إضافة رقم في حالة التكرار
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

