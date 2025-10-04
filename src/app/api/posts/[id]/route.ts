import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePostSchema = z.object({
  titleAr: z.string().min(1, 'العنوان العربي مطلوب').optional(),
  titleEn: z.string().optional(),
  slug: z.string().min(1, 'الرابط المختصر مطلوب').optional(),
  duaNumber: z.number().optional(), // رقم الدعاء
  description: z.string().optional(),
  content: z.string().optional(),
  audioUrl: z.string().optional(),
  audioDuration: z.number().optional(),
  audioFileSize: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  reciterName: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
})

// GET /api/posts/[id] - جلب منشور واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const post = await prisma.post.findUnique({
      where: { id: id },
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
        analytics: {
          select: {
            actionType: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 })
    }

    // زيادة عدد المشاهدات
    await prisma.post.update({
      where: { id: id },
      data: { viewCount: { increment: 1 } }
    })

    // تسجيل المشاهدة في الإحصائيات
    await prisma.analytics.create({
      data: {
        postId: id,
        actionType: 'VIEW',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // تحويل BigInt إلى Number لتجنب مشكلة JSON serialization
    const serializedPost = {
      ...post,
      audioFileSize: Number(post.audioFileSize),
    }

    return NextResponse.json({
      success: true,
      data: serializedPost
    })
  } catch (error) {
    console.error('خطأ في جلب المنشور:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - تحديث منشور
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من وجود المنشور
    const existingPost = await prisma.post.findUnique({
      where: { id: id },
      include: {
        author: true
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 })
    }

    // التحقق من الصلاحيات
    const isAdmin = session.user.role === 'ADMIN'
    const isAuthor = existingPost.authorId === session.user.id
    const canEdit = isAdmin || (isAuthor && ['ADMIN', 'EDITOR'].includes(session.user.role))

    if (!canEdit) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const body = await request.json()
    const { tags, ...postData } = updatePostSchema.parse(body)

    // التحقق من توفر الرابط المختصر إذا تم تغييره
    if (postData.slug && postData.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: postData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'الرابط المختصر مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // التحقق من وجود التصنيف إذا تم تغييره
    if (postData.categoryId && postData.categoryId !== existingPost.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: postData.categoryId }
      })

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'التصنيف غير موجود' },
          { status: 400 }
        )
      }
    }

    // التحقق من عدم تكرار رقم الدعاء (إذا تم تغييره)
    if (postData.duaNumber && postData.duaNumber !== existingPost.duaNumber) {
      const duaNumberExists = await prisma.post.findFirst({
        where: { 
          duaNumber: postData.duaNumber,
          NOT: { id }
        }
      })

      if (duaNumberExists) {
        return NextResponse.json(
          { error: `رقم الدعاء ${postData.duaNumber} مستخدم بالفعل` },
          { status: 400 }
        )
      }
    }

    // تحديث تاريخ النشر إذا تم تغيير الحالة إلى منشور
    const updateData: Record<string, unknown> = { ...postData }
    if (postData.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date()
    } else if (postData.status !== 'PUBLISHED' && existingPost.status === 'PUBLISHED') {
      updateData.publishedAt = null
    }

    // تحديث المنشور
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: {
        ...updateData,
        tags: tags ? {
          deleteMany: {},
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
      ...updatedPost,
      audioFileSize: Number(updatedPost.audioFileSize),
    }

    return NextResponse.json({
      success: true,
      data: serializedPost,
      message: 'تم تحديث المنشور بنجاح'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث المنشور:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - حذف منشور
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من وجود المنشور
    const existingPost = await prisma.post.findUnique({
      where: { id: id },
      include: {
        author: true
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 })
    }

    // التحقق من الصلاحيات
    const isAdmin = session.user.role === 'ADMIN'
    const isAuthor = existingPost.authorId === session.user.id
    const canDelete = isAdmin || (isAuthor && ['ADMIN', 'EDITOR'].includes(session.user.role))

    if (!canDelete) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    // حذف المنشور (سيتم حذف العلاقات تلقائياً بسبب onDelete: Cascade)
    await prisma.post.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنشور بنجاح'
    })
  } catch (error) {
    console.error('خطأ في حذف المنشور:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}