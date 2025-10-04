import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { z } from 'zod'

const createRoleSchema = z.object({
  name: z.string().min(1, 'اسم الدور مطلوب'),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([])
})

// GET /api/roles - جلب جميع الأدوار
export async function GET(request: NextRequest) {
  try {
    await requirePermission('MANAGE_ROLES', 'roles')

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const roles = await prisma.role.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    // تحويل البيانات للصيغة المطلوبة
    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      nameEn: role.nameEn,
      description: role.description,
      isActive: role.isActive,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        action: rp.permission.action,
        resource: rp.permission.resource,
        description: rp.permission.description,
        createdAt: rp.permission.createdAt
      })),
      _count: role._count
    }))

    return NextResponse.json({
      success: true,
      data: formattedRoles
    })
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء جلب الأدوار' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

// POST /api/roles - إنشاء دور جديد
export async function POST(request: NextRequest) {
  try {
    await requirePermission('MANAGE_ROLES', 'roles')

    const body = await request.json()
    const validatedData = createRoleSchema.parse(body)

    // التحقق من عدم تكرار الاسم
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name }
    })

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'اسم الدور مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء الدور مع الصلاحيات
    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        nameEn: validatedData.nameEn,
        description: validatedData.description,
        isActive: validatedData.isActive,
        permissions: {
          create: validatedData.permissions.map((permissionId) => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      },
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
      message: 'تم إنشاء الدور بنجاح'
    })
  } catch (error: any) {
    console.error('Error creating role:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء إنشاء الدور' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

