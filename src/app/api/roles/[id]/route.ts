import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { z } from 'zod'

const updateRoleSchema = z.object({
  name: z.string().min(1, 'اسم الدور مطلوب').optional(),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional()
})

// GET /api/roles/[id] - جلب دور واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('MANAGE_ROLES', 'roles')

    const { id } = await params

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: role
    })
  } catch (error: any) {
    console.error('Error fetching role:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء جلب الدور' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

// PUT /api/roles/[id] - تحديث دور
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('MANAGE_ROLES', 'roles')

    const { id } = await params
    const body = await request.json()
    const validatedData = updateRoleSchema.parse(body)

    // التحقق من وجود الدور
    const existingRole = await prisma.role.findUnique({
      where: { id }
    })

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من أن الدور ليس دور نظام
    if (existingRole.isSystem) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن تعديل أدوار النظام' },
        { status: 400 }
      )
    }

    // التحقق من عدم تكرار الاسم
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name: validatedData.name }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'اسم الدور مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // تحضير البيانات للتحديث
    const updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.nameEn !== undefined) updateData.nameEn = validatedData.nameEn
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    // تحديث الصلاحيات إذا تم إرسالها
    if (validatedData.permissions) {
      updateData.permissions = {
        deleteMany: {},
        create: validatedData.permissions.map((permissionId) => ({
          permission: {
            connect: { id: permissionId }
          }
        }))
      }
    }

    // تحديث الدور
    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: role,
      message: 'تم تحديث الدور بنجاح'
    })
  } catch (error: any) {
    console.error('Error updating role:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء تحديث الدور' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

// DELETE /api/roles/[id] - حذف دور
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('MANAGE_ROLES', 'roles')

    const { id } = await params

    // التحقق من وجود الدور
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من أن الدور ليس دور نظام
    if (role.isSystem) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف أدوار النظام' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود مستخدمين مرتبطين بهذا الدور
    if (role._count.users > 0) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف الدور لأنه مرتبط بمستخدمين' },
        { status: 400 }
      )
    }

    // حذف الدور
    await prisma.role.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الدور بنجاح'
    })
  } catch (error: any) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء حذف الدور' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

