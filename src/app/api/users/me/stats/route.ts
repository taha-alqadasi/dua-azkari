import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // جلب إحصائيات المستخدم من قاعدة البيانات
    const [publishedPosts, pages, mediaFiles] = await Promise.all([
      // عدد المقالات المنشورة للمستخدم
      prisma.post.count({
        where: {
          authorId: session.user.id,
          status: 'PUBLISHED'
        }
      }),
      
      // عدد الصفحات للمستخدم
      prisma.page.count({
        where: {
          authorId: session.user.id
        }
      }),
      
      // عدد ملفات الوسائط التي رفعها المستخدم
      prisma.mediaLibrary.count({
        where: {
          uploadedBy: session.user.id
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        publishedPosts,
        pages,
        mediaFiles
      }
    })

  } catch (error) {
    console.error('User Stats API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب الإحصائيات'
      },
      { status: 500 }
    )
  }
}

