import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, oldPassword, newPassword } = body

    // التحقق من البيانات الأساسية
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'الاسم والبريد الإلكتروني مطلوبان' },
        { status: 400 }
      )
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود بريد إلكتروني مكرر (إذا تم تغييره)
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      name,
      email
    }

    // إذا أراد المستخدم تغيير كلمة المرور
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { success: false, error: 'يجب إدخال كلمة المرور القديمة' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' },
          { status: 400 }
        )
      }

      // جلب كلمة المرور الحالية من قاعدة البيانات
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'المستخدم غير موجود' },
          { status: 404 }
        )
      }

      // التحقق من كلمة المرور القديمة
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash)
      
      if (!isOldPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'كلمة المرور القديمة غير صحيحة' },
          { status: 400 }
        )
      }

      // تشفير كلمة المرور الجديدة
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.passwordHash = hashedPassword
    }

    // تحديث بيانات المستخدم
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: updatedUser
    })

  } catch (error) {
    console.error('Update Profile API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء تحديث الملف الشخصي'
      },
      { status: 500 }
    )
  }
}

