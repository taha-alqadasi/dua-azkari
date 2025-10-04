import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

// تهيئة عميل R2
const r2Client = new S3Client({
  region: process.env.CLOUDFLARE_R2_REGION || 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.CLOUDFLARE_R2_USE_PATH_STYLE === 'true',
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || 'media'
const CUSTOM_DOMAIN = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN || ''

interface UploadToR2Options {
  file: Buffer
  fileName: string
  contentType: string
  folder?: string
}

/**
 * رفع ملف إلى Cloudflare R2
 * @param options - خيارات الرفع
 * @returns رابط الملف المرفوع
 */
export async function uploadToR2(options: UploadToR2Options): Promise<string> {
  const { file, fileName, contentType, folder = 'uploads' } = options

  // تحديد المسار الكامل للملف
  const key = folder ? `${folder}/${fileName}` : fileName

  try {
    // رفع الملف باستخدام Upload من aws-sdk
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
        // إضافة metadata إضافية
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      },
    })

    await upload.done()

    // إرجاع الرابط الكامل للملف
    if (CUSTOM_DOMAIN) {
      return `${CUSTOM_DOMAIN}/${key}`
    } else {
      return `${process.env.CLOUDFLARE_R2_ENDPOINT}/${BUCKET_NAME}/${key}`
    }
  } catch (error) {
    console.error('خطأ في رفع الملف إلى R2:', error)
    throw new Error('فشل رفع الملف إلى Cloudflare R2')
  }
}

/**
 * حذف ملف من Cloudflare R2
 * @param fileUrl - رابط الملف المراد حذفه
 */
export async function deleteFromR2(fileUrl: string): Promise<void> {
  try {
    // استخراج مفتاح الملف من الرابط
    let key: string

    if (CUSTOM_DOMAIN && fileUrl.startsWith(CUSTOM_DOMAIN)) {
      key = fileUrl.replace(`${CUSTOM_DOMAIN}/`, '')
    } else if (fileUrl.includes(BUCKET_NAME)) {
      const parts = fileUrl.split(`${BUCKET_NAME}/`)
      key = parts[1] || ''
    } else {
      throw new Error('رابط الملف غير صالح')
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
  } catch (error) {
    console.error('خطأ في حذف الملف من R2:', error)
    throw new Error('فشل حذف الملف من Cloudflare R2')
  }
}

/**
 * التحقق من تكوين R2
 */
export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_R2_ENDPOINT &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET
  )
}

/**
 * الحصول على نوع المجلد بناءً على نوع الملف
 */
export function getFolderByMimeType(mimeType: string): string {
  if (mimeType.startsWith('audio/')) {
    return 'audio'
  } else if (mimeType.startsWith('image/')) {
    return 'images'
  } else if (mimeType.startsWith('video/')) {
    return 'videos'
  } else {
    return 'documents'
  }
}

