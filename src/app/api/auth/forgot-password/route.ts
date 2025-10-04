import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { sendPasswordResetEmail } from '@/lib/email'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

// POST /api/auth/forgot-password - طلب إعادة تعيين كلمة المرور
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    // لأسباب أمنية، نرجع نفس الرسالة حتى لو لم يكن المستخدم موجوداً
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، ستصلك رسالة لإعادة تعيين كلمة المرور.',
      })
    }

    // إنشاء رمز إعادة التعيين (صالح لمدة ساعة)
    const resetToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // حفظ الرمز في قاعدة البيانات
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt,
      },
    })

    // إرسال البريد الإلكتروني
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken)
    } catch (emailError) {
      console.error('خطأ في إرسال البريد:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، ستصلك رسالة لإعادة تعيين كلمة المرور.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('خطأ في طلب إعادة تعيين كلمة المرور:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    )
  }
}

