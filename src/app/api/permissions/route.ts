import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

// GET /api/permissions - جلب جميع الصلاحيات المتاحة
export async function GET() {
  try {
    await requirePermission('MANAGE_ROLES', 'roles')

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: permissions
    })
  } catch (error: any) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء جلب الصلاحيات' },
      { status: error.message === 'ليس لديك الصلاحية للقيام بهذا الإجراء' ? 403 : 500 }
    )
  }
}

