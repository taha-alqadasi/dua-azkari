import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'

// دالة مساعدة لإنشاء بيانات المخطط
async function generateChartData(startDate: Date, endDate: Date, timeRange: string) {
  const labels: string[] = []
  const viewsData: number[] = []
  const downloadsData: number[] = []
  const postsData: number[] = []

  if (timeRange === 'today') {
    // بيانات كل ساعة لليوم
    for (let hour = 0; hour < 24; hour++) {
      labels.push(`${hour}:00`)
      viewsData.push(Math.floor(Math.random() * 100)) // مؤقت - يمكن استبداله بجلب حقيقي
      downloadsData.push(Math.floor(Math.random() * 50))
      postsData.push(Math.floor(Math.random() * 10))
    }
  } else if (timeRange === 'week') {
    // بيانات كل يوم للأسبوع
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      labels.push(days[date.getDay()])
      
      // جلب بيانات حقيقية لكل يوم
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayData = await prisma.post.aggregate({
        where: {
          status: 'PUBLISHED',
          createdAt: { gte: dayStart, lte: dayEnd }
        },
        _sum: { viewCount: true, downloadCount: true },
        _count: true
      })
      
      viewsData.push(dayData._sum.viewCount || 0)
      downloadsData.push(dayData._sum.downloadCount || 0)
      postsData.push(dayData._count)
    }
  } else if (timeRange === 'month') {
    // بيانات كل أسبوع للشهر
    for (let week = 3; week >= 0; week--) {
      labels.push(`الأسبوع ${4 - week}`)
      viewsData.push(Math.floor(Math.random() * 500))
      downloadsData.push(Math.floor(Math.random() * 250))
      postsData.push(Math.floor(Math.random() * 30))
    }
  } else if (timeRange === 'year') {
    // بيانات كل شهر للسنة
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      labels.push(months[date.getMonth()])
      viewsData.push(Math.floor(Math.random() * 2000))
      downloadsData.push(Math.floor(Math.random() * 1000))
      postsData.push(Math.floor(Math.random() * 100))
    }
  }

  return { labels, viewsData, downloadsData, postsData }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // التحقق من الصلاحيات
    const hasPermission = await checkPermission('READ', 'analytics')
    
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لعرض الإحصائيات' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || 'week'

    // حساب التاريخ بناءً على النطاق الزمني
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // جلب الإحصائيات
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalTags,
      totalMedia,
      totalUsers,
      topPosts,
      recentPosts
    ] = await Promise.all([
      // إجمالي المقالات
      prisma.post.count(),
      
      // المقالات المنشورة
      prisma.post.count({
        where: { status: 'PUBLISHED' }
      }),
      
      // المقالات المسودة
      prisma.post.count({
        where: { status: 'DRAFT' }
      }),
      
      // إجمالي الفئات
      prisma.category.count(),
      
      // إجمالي الوسوم
      prisma.tag.count(),
      
      // إجمالي ملفات الوسائط
      prisma.mediaLibrary.count(),
      
      // إجمالي المستخدمين
      prisma.user.count(),
      
      // أكثر المقالات مشاهدة
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          createdAt: {
            gte: startDate
          }
        },
        select: {
          id: true,
          titleAr: true,
          viewCount: true,
          downloadCount: true
        },
        orderBy: {
          viewCount: 'desc'
        },
        take: 10
      }),
      
      // المقالات الأخيرة
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          createdAt: {
            gte: startDate
          }
        },
        select: {
          id: true,
          titleAr: true,
          viewCount: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ])

    // حساب إجمالي المشاهدات والتحميلات من جميع المقالات في النطاق الزمني
    const viewsAndDownloads = await prisma.post.aggregate({
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        viewCount: true,
        downloadCount: true
      }
    })

    const totalViews = viewsAndDownloads._sum.viewCount || 0
    const totalDownloads = viewsAndDownloads._sum.downloadCount || 0

    // إنشاء بيانات المخطط البياني (تجميع حسب التاريخ)
    const chartData = await generateChartData(startDate, now, timeRange)

    // تنسيق البيانات
    const recentViews = recentPosts.map(post => ({
      postId: post.id,
      postTitle: post.titleAr,
      viewCount: post.viewCount || 0,
      date: new Intl.DateTimeFormat('ar-SA', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(post.createdAt)
    }))

    const data = {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalTags,
      totalMedia,
      totalUsers,
      totalViews,
      totalDownloads,
      totalShares: Math.floor(totalViews * 0.15), // تقدير افتراضي
      topPosts,
      recentViews,
      chartData
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب الإحصائيات'
      },
      { status: 500 }
    )
  }
}

