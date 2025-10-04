import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateUserSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  name: z.string().min(1, 'الاسم مطلوب').optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
  customRoleId: z.string().nullable().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')).nullable(),
  isActive: z.boolean().optional()
})

// GET /api/users/[id] - جلب مستخدم واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('MANAGE_USERS', 'users')

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        customRoleId: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        customRole: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            description: true,
            isActive: true,
            isSystem: true,
            permissions: {
              include: {
                permission: true
              }
            }
          }
        },
        _count: {
          select: {
            posts: true,
            pages: true,
            mediaLibrary: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء جلب المستخدم' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

// PUT /api/users/[id] - تحديث مستخدم
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('MANAGE_USERS', 'users')

    const { id } = await params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // تحضير البيانات للتحديث
    const updateData: any = {}
    
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.role) updateData.role = validatedData.role
    if (validatedData.customRoleId !== undefined) updateData.customRoleId = validatedData.customRoleId
    if (validatedData.avatarUrl !== undefined) updateData.avatarUrl = validatedData.avatarUrl
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    // تشفير كلمة المرور إذا تم تغييرها
    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 10)
    }

    // تحديث المستخدم
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        customRoleId: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        customRole: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'تم تحديث المستخدم بنجاح'
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء تحديث المستخدم' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

// DELETE /api/users/[id] - حذف مستخدم
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('MANAGE_USERS', 'users')

    const { id } = await params

    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // حذف المستخدم
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء حذف المستخدم' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

