import { NextResponse } from 'next/server'
import { getCurrentUserWithPermissions } from '@/lib/permissions'

// GET /api/users/me - جلب بيانات المستخدم الحالي مع الصلاحيات
export async function GET() {
  try {
    const user = await getCurrentUserWithPermissions()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    )
  }
}

