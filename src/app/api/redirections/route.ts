import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

// Schema للتحقق من البيانات
const redirectionSchema = z.object({
  fromPath: z.string().min(1, 'المسار القديم مطلوب').regex(/^\//, 'يجب أن يبدأ المسار بـ /'),
  toPath: z.string().min(1, 'المسار الجديد مطلوب'),
  redirectType: z.enum(['PERMANENT_301', 'TEMPORARY_302', 'TEMPORARY_307', 'PERMANENT_308']),
  isActive: z.boolean().default(true)
})

// GET - جلب جميع Redirections
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const redirections = await prisma.redirection.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: redirections
    })

  } catch (error) {
    console.error('Error fetching redirections:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب التحويلات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء Redirection جديد
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // التحقق من صلاحيات Admin فقط
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'يجب أن تكون مسؤولاً لإنشاء تحويل' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = redirectionSchema.parse(body)

    // التحقق من عدم وجود تحويل بنفس المسار القديم
    const existing = await prisma.redirection.findUnique({
      where: { fromPath: validatedData.fromPath }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'يوجد تحويل بنفس المسار القديم بالفعل' },
        { status: 400 }
      )
    }

    const redirection = await prisma.redirection.create({
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: redirection,
      message: 'تم إنشاء التحويل بنجاح'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating redirection:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء التحويل' },
      { status: 500 }
    )
  }
}

// PUT - تحديث Redirection
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'يجب أن تكون مسؤولاً لتحديث تحويل' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف التحويل مطلوب' },
        { status: 400 }
      )
    }

    const validatedData = redirectionSchema.parse(data)

    // التحقق من وجود التحويل
    const existing = await prisma.redirection.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'التحويل غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من عدم تكرار fromPath إذا تم تغييره
    if (validatedData.fromPath !== existing.fromPath) {
      const duplicate = await prisma.redirection.findUnique({
        where: { fromPath: validatedData.fromPath }
      })

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'يوجد تحويل بنفس المسار القديم بالفعل' },
          { status: 400 }
        )
      }
    }

    const redirection = await prisma.redirection.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: redirection,
      message: 'تم تحديث التحويل بنجاح'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating redirection:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث التحويل' },
      { status: 500 }
    )
  }
}

// DELETE - حذف Redirection
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'يجب أن تكون مسؤولاً لحذف تحويل' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف التحويل مطلوب' },
        { status: 400 }
      )
    }

    await prisma.redirection.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف التحويل بنجاح'
    })

  } catch (error) {
    console.error('Error deleting redirection:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف التحويل' },
      { status: 500 }
    )
  }
}

