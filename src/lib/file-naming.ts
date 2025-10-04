/**
 * نظام إعادة تسمية الملفات الذكي
 * يدعم العربي والإنجليزي مع إضافة AZKari-app في النهاية
 */

/**
 * تحويل النص إلى slug صالح للاستخدام في أسماء الملفات
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // دعم الأحرف العربية والإنجليزية والأرقام
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') 
    .replace(/\s+/g, '-') // استبدال المسافات بشرطة
    .replace(/-+/g, '-') // إزالة الشرطات المتكررة
    .replace(/^-|-$/g, '') // إزالة الشرطات من البداية والنهاية
}

/**
 * إنشاء اسم ملف ذكي بناءً على العنوان
 * @param title - العنوان (عربي أو إنجليزي)
 * @param extension - امتداد الملف (mp3, jpg, png, etc.)
 * @param existingFiles - قائمة الملفات الموجودة للتحقق من التكرار
 * @returns اسم الملف الجديد
 */
export function generateSmartFileName(
  title: string,
  extension: string,
  existingFiles: string[] = []
): string {
  // توليد slug من العنوان
  const baseSlug = generateSlug(title)
  
  // إضافة suffix
  const suffix = 'AZKari-app'
  
  // اسم الملف الأساسي
  let fileName = `${baseSlug}-${suffix}.${extension}`
  
  // التحقق من التكرار
  let counter = 1
  let finalFileName = fileName
  
  while (existingFiles.includes(finalFileName)) {
    finalFileName = `${counter}-${baseSlug}-${suffix}.${extension}`
    counter++
  }
  
  return finalFileName
}

/**
 * استخراج الامتداد من اسم الملف
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts[parts.length - 1].toLowerCase()
}

/**
 * التحقق من أن الاسم يتبع نظام التسمية الذكي
 */
export function isSmartFileName(fileName: string): boolean {
  // يجب أن يحتوي على AZKari-app قبل الامتداد
  return fileName.includes('AZKari-app')
}

/**
 * إنشاء اسم ملف آمن (fallback للطريقة القديمة)
 */
export function generateSafeFileName(originalName: string): string {
  const timestamp = Date.now()
  const extension = getFileExtension(originalName)
  return `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
}

/**
 * تنظيف اسم الملف من الأحرف غير المقبولة
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // إزالة الأحرف المحظورة
    .replace(/\s+/g, '-') // استبدال المسافات
    .replace(/-+/g, '-') // إزالة الشرطات المتكررة
    .trim()
}

