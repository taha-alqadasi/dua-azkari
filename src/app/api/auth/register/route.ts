import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل'),
})

// POST /api/auth/register - تسجيل مستخدم جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // إنشاء رمز التحقق
    const verificationToken = uuidv4()

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role: 'VIEWER', // الدور الافتراضي
        emailVerified: false,
        verificationToken,
        isActive: false, // غير نشط حتى يتم التحقق من البريد
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    // إرسال بريد التحقق
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken)
    } catch (emailError) {
      console.error('خطأ في إرسال بريد التحقق:', emailError)
      // نواصل حتى لو فشل إرسال البريد
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك.',
        data: user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('خطأ في التسجيل:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
}

