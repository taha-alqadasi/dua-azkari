import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SettingGroup, AllSettings, defaultSettings } from '@/types/settings.types'

// GET - جلب جميع الإعدادات أو مجموعة معينة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group') as SettingGroup | null

    if (group) {
      // جلب مجموعة معينة باستخدام settingKey (وهو unique)
      const setting = await prisma.setting.findUnique({
        where: {
          settingKey: group
        }
      })

      if (!setting) {
        // إرجاع القيم الافتراضية
        return NextResponse.json({
          success: true,
          data: (defaultSettings as any)[group]
        })
      }

      return NextResponse.json({
        success: true,
        data: setting.settingValue
      })
    } else {
      // جلب جميع الإعدادات
      const settings = await prisma.setting.findMany()

      const allSettings: Partial<AllSettings> = {}

      // دمج الإعدادات من قاعدة البيانات باستخدام settingKey
      for (const setting of settings) {
        allSettings[setting.settingKey as SettingGroup] = setting.settingValue as any
      }

      // دمج مع القيم الافتراضية للمجموعات المفقودة
      const finalSettings = {
        ...defaultSettings,
        ...allSettings
      }

      return NextResponse.json({
        success: true,
        data: finalSettings
      })
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب الإعدادات'
      },
      { status: 500 }
    )
  }
}

// PUT - تحديث إعدادات مجموعة معينة
export async function PUT(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'غير مصرح لك بالوصول'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { group, data } = body

    if (!group || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'البيانات غير صحيحة'
        },
        { status: 400 }
      )
    }

    // البحث عن الإعداد الموجود أو إنشاء واحد جديد
    const setting = await prisma.setting.upsert({
      where: {
        settingKey: group
      },
      update: {
        settingValue: data,
        settingGroup: group
      },
      create: {
        settingKey: group,
        settingValue: data,
        settingGroup: group
      }
    })

    // إعادة التحقق من الصفحات لتطبيق التغييرات فوراً
    // تحديث: بدلاً من revalidatePath، سنعيد التوجيه مع timestamp لفرض التحديث
    const response = NextResponse.json({
      success: true,
      data: setting.settingValue,
      message: 'تم حفظ الإعدادات بنجاح',
      timestamp: Date.now() // لإجبار إعادة التحميل
    })

    // إضافة headers لمنع الكاش
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    
    return response
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في تحديث الإعدادات'
      },
      { status: 500 }
    )
  }
}

// POST - إعادة تعيين إعدادات مجموعة معينة للقيم الافتراضية
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'غير مصرح لك بالوصول'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { group } = body

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error: 'يجب تحديد المجموعة'
        },
        { status: 400 }
      )
    }

    const defaultValue = (defaultSettings as any)[group]

    if (!defaultValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'مجموعة غير صحيحة'
        },
        { status: 400 }
      )
    }

    // تحديث الإعداد بالقيمة الافتراضية
    const setting = await prisma.setting.upsert({
      where: {
        settingKey: group
      },
      update: {
        settingValue: defaultValue,
        settingGroup: group
      },
      create: {
        settingKey: group,
        settingValue: defaultValue,
        settingGroup: group
      }
    })

    return NextResponse.json({
      success: true,
      data: setting.settingValue,
      message: 'تم إعادة تعيين الإعدادات بنجاح'
    })
  } catch (error) {
    console.error('Error resetting settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في إعادة تعيين الإعدادات'
      },
      { status: 500 }
    )
  }
}

