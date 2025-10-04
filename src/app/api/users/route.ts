import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  name: z.string().min(1, 'الاسم مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('VIEWER'),
  customRoleId: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true)
})

// GET /api/users - جلب جميع المستخدمين
export async function GET(request: NextRequest) {
  try {
    await requirePermission('MANAGE_USERS', 'users')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role && role !== 'all') {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
              isSystem: true
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
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء جلب المستخدمين' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

// POST /api/users - إنشاء مستخدم جديد
export async function POST(request: NextRequest) {
  try {
    await requirePermission('MANAGE_USERS', 'users')

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // التحقق من عدم تكرار البريد الإلكتروني
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        role: validatedData.role,
        customRoleId: validatedData.customRoleId,
        avatarUrl: validatedData.avatarUrl,
        isActive: validatedData.isActive
      },
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
      message: 'تم إنشاء المستخدم بنجاح'
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء إنشاء المستخدم' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

