import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// تعطيل الـ cache للـ API
export const dynamic = 'force-dynamic'
export const revalidate = 0

const createPostSchema = z.object({
  titleAr: z.string().min(1, 'العنوان العربي مطلوب'),
  titleEn: z.string().optional(),
  slug: z.string().min(1, 'الرابط المختصر مطلوب'),
  description: z.string().optional(),
  content: z.string().optional(),
  audioUrl: z.string().min(1, 'رابط الملف الصوتي مطلوب'),
  audioDuration: z.number().min(1, 'مدة الملف الصوتي مطلوبة'),
  audioFileSize: z.number().min(1, 'حجم الملف الصوتي مطلوب'),
  thumbnailUrl: z.string().optional(),
  reciterName: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1, 'التصنيف مطلوب'),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
})

// GET /api/posts - جلب جميع المنشورات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const isFeatured = searchParams.get('isFeatured')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reciterName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (status) {
      where.status = status
    }

    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true'
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              slug: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              analytics: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    // تحويل BigInt إلى string لتجنب مشكلة JSON serialization
    const serializedPosts = posts.map(post => ({
      ...post,
      audioFileSize: post.audioFileSize ? post.audioFileSize.toString() : null
    }))

    return NextResponse.json({
      success: true,
      data: serializedPosts,
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
    console.error('خطأ في جلب المنشورات:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST /api/posts - إنشاء منشور جديد
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

    const body = await request.json()
    const { tags, ...postData } = createPostSchema.parse(body)

    // التحقق من توفر الرابط المختصر
    const slugExists = await prisma.post.findUnique({
      where: { slug: postData.slug }
    })

    if (slugExists) {
      return NextResponse.json(
        { error: 'الرابط المختصر مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // التحقق من وجود التصنيف
    const categoryExists = await prisma.category.findUnique({
      where: { id: postData.categoryId }
    })

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'التصنيف غير موجود' },
        { status: 400 }
      )
    }

    // توليد رقم الدعاء تلقائياً (الرقم التالي)
    const maxDuaNumber = await prisma.post.findFirst({
      orderBy: { duaNumber: 'desc' },
      select: { duaNumber: true }
    })
    const nextDuaNumber = (maxDuaNumber?.duaNumber || 0) + 1

    // إنشاء المنشور
    const post = await prisma.post.create({
      data: {
        ...postData,
        duaNumber: nextDuaNumber,
        authorId: session.user.id,
        publishedAt: postData.status === 'PUBLISHED' ? new Date() : null,
        tags: tags ? {
          create: tags.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true
              }
            }
          }
        }
      }
    })

    // تحويل BigInt إلى Number لتجنب مشكلة serialization
    const serializedPost = {
      ...post,
      audioFileSize: Number(post.audioFileSize),
    }

    return NextResponse.json({
      success: true,
      data: serializedPost,
      message: 'تم إنشاء المنشور بنجاح'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء المنشور:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}