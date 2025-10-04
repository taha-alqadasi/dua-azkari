import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/auth/verify-email?token=xxx - التحقق من البريد الإلكتروني
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'رمز التحقق مطلوب' },
        { status: 400 }
      )
    }

    // البحث عن المستخدم برمز التحقق
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // تفعيل الحساب
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isActive: true,
        verificationToken: null, // حذف الرمز بعد الاستخدام
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.',
    })
  } catch (error) {
    console.error('خطأ في التحقق من البريد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من البريد' },
      { status: 500 }
    )
  }
}

