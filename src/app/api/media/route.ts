import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { z } from 'zod'
import { uploadToR2, isR2Configured, getFolderByMimeType } from '@/lib/cloudflare-r2'
import { generateSmartFileName, getFileExtension, generateSafeFileName } from '@/lib/file-naming'

// Schema for validating upload metadata (for future use)
export const uploadSchema = z.object({
  altText: z.string().optional(),
  caption: z.string().optional(),
})

// Export for potential use in other files
export type UploadMetadata = z.infer<typeof uploadSchema>

// GET /api/media - جلب جميع ملفات الوسائط
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const fileType = searchParams.get('fileType')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (fileType) {
      where.fileType = fileType
    }

    const [media, total] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.mediaLibrary.count({ where })
    ])

    // تحويل BigInt إلى Number لتجنب مشكلة serialization
    const serializedMedia = media.map(item => ({
      ...item,
      fileSize: Number(item.fileSize), // تحويل BigInt إلى Number
    }))

    return NextResponse.json({
      success: true,
      data: serializedMedia,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('خطأ في جلب الوسائط:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST /api/media - رفع ملف جديد (Local أو Cloud)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من الصلاحيات
    if (!['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string
    const caption = formData.get('caption') as string
    const uploadType = formData.get('uploadType') as string || 'cloud' // cloud أو local
    const smartFileName = formData.get('smartFileName') as string || '' // اسم ذكي اختياري

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم اختيار ملف' },
        { status: 400 }
      )
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم' },
        { status: 400 }
      )
    }

    // التحقق من حجم الملف (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً (الحد الأقصى 10MB)' },
        { status: 400 }
      )
    }

    // تحديد نوع الملف
    let fileType: 'AUDIO' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' = 'DOCUMENT'
    if (file.type.startsWith('audio/')) fileType = 'AUDIO'
    else if (file.type.startsWith('image/')) fileType = 'IMAGE'
    else if (file.type.startsWith('video/')) fileType = 'VIDEO'

    // إنشاء اسم ملف ذكي أو آمن
    const extension = getFileExtension(file.name)
    let fileName: string

    try {
      if (smartFileName) {
        // استخدام الاسم الذكي المرسل من Frontend
        fileName = smartFileName
      } else {
        // fallback للطريقة الآمنة
        fileName = generateSafeFileName(file.name)
      }

      // التحقق من الملفات الموجودة (للرفع المحلي فقط)
      if (uploadType !== 'cloud') {
        const uploadDir = join(process.cwd(), 'public', 'uploads', fileType.toLowerCase())
        const filePath = join(uploadDir, fileName)
        
        // إذا كان الملف موجوداً، أضف رقماً
        let counter = 1
        let finalFileName = fileName
        let finalPath = filePath
        
        while (existsSync(finalPath)) {
          const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
          finalFileName = `${counter}-${fileName}`
          finalPath = join(uploadDir, finalFileName)
          counter++
        }
        
        fileName = finalFileName
      }
    } catch (nameError) {
      console.error('خطأ في توليد اسم الملف:', nameError)
      // استخدام طريقة آمنة
      fileName = generateSafeFileName(file.name)
    }

    let fileUrl: string
    let storageType: 'LOCAL' | 'CLOUDFLARE_R2' = 'LOCAL'

    try {
      // تحويل الملف إلى Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // اختيار طريقة الرفع
      if (uploadType === 'cloud' && isR2Configured()) {
        // رفع إلى Cloudflare R2
        const folder = getFolderByMimeType(file.type)
        fileUrl = await uploadToR2({
          file: buffer,
          fileName,
          contentType: file.type,
          folder,
        })
        storageType = 'CLOUDFLARE_R2'
      } else {
        // رفع محلي
        const uploadDir = join(process.cwd(), 'public', 'uploads', fileType.toLowerCase())
        const filePath = join(uploadDir, fileName)
        fileUrl = `/uploads/${fileType.toLowerCase()}/${fileName}`

        // إنشاء المجلد إذا لم يكن موجوداً
        await mkdir(uploadDir, { recursive: true })

        // حفظ الملف
        await writeFile(filePath, buffer)
        storageType = 'LOCAL'
      }

      // حفظ معلومات الملف في قاعدة البيانات
      const mediaRecord = await prisma.mediaLibrary.create({
        data: {
          fileName: file.name,
          fileType,
          mimeType: file.type,
          fileSize: BigInt(file.size),
          fileUrl,
          altText: altText || null,
          caption: caption || null,
          uploadedBy: session.user.id,
          storageType,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // تحويل BigInt إلى Number
      const serializedRecord = {
        ...mediaRecord,
        fileSize: Number(mediaRecord.fileSize),
      }

      return NextResponse.json({
        success: true,
        data: serializedRecord,
        message: `تم رفع الملف بنجاح إلى ${storageType === 'LOCAL' ? 'السيرفر المحلي' : 'Cloudflare R2'}`
      }, { status: 201 })
    } catch (fileError) {
      console.error('خطأ في حفظ الملف:', fileError)
      return NextResponse.json(
        { error: 'خطأ في حفظ الملف' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('خطأ في رفع الملف:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}