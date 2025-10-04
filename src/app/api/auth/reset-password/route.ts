import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendPasswordChangedEmail } from '@/lib/email'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'رمز إعادة التعيين مطلوب'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل'),
})

// POST /api/auth/reset-password - إعادة تعيين كلمة المرور
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // البحث عن المستخدم برمز إعادة التعيين
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: validatedData.token,
        resetPasswordExpires: {
          gte: new Date(), // التأكد من أن الرمز لم ينتهي
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور الجديدة
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // تحديث كلمة المرور وحذف الرمز وتفعيل الحساب
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        emailVerified: true, // ✅ تفعيل الحساب تلقائياً
        isActive: true,      // ✅ تفعيل الحساب تلقائياً
      },
    })

    // إرسال إشعار بتغيير كلمة المرور
    try {
      await sendPasswordChangedEmail(user.email, user.name)
    } catch (emailError) {
      console.error('خطأ في إرسال البريد:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور وتفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('خطأ في إعادة تعيين كلمة المرور:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
      { status: 500 }
    )
  }
}

