'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ArrowRight,
  TrendingUp,
  Eye,
  Download,
  Share2,
  Users,
  FileText,
  Folder,
  Image as ImageIcon,
  Clock,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import dynamic from 'next/dynamic'

const AnalyticsChart = dynamic(() => import('@/components/admin/AnalyticsChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
})

interface AnalyticsData {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalCategories: number
  totalTags: number
  totalMedia: number
  totalUsers: number
  totalViews: number
  totalDownloads: number
  totalShares: number
  recentViews: Array<{
    postId: string
    postTitle: string
    viewCount: number
    date: string
  }>
  topPosts: Array<{
    id: string
    titleAr: string
    viewCount: number
    downloadCount: number
  }>
  chartData: {
    labels: string[]
    viewsData: number[]
    downloadsData: number[]
    postsData: number[]
  }
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalTags: 0,
    totalMedia: 0,
    totalUsers: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalShares: 0,
    recentViews: [],
    topPosts: [],
    chartData: {
      labels: [],
      viewsData: [],
      downloadsData: [],
      postsData: []
    }
  })

  const { hasPermission, loading: permissionsLoading } = usePermissions()
  const canViewAnalytics = hasPermission('READ', 'analytics')

  useEffect(() => {
    if (!permissionsLoading && canViewAnalytics) {
      fetchAnalytics()
    }
  }, [timeRange, permissionsLoading, canViewAnalytics])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`)
      const result = await response.json()

      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (permissionsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'إجمالي المقالات',
      value: analytics.totalPosts,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'المقالات المنشورة',
      value: analytics.publishedPosts,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'إجمالي المشاهدات',
      value: analytics.totalViews.toLocaleString('ar-SA'),
      icon: Eye,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'إجمالي التحميلات',
      value: analytics.totalDownloads.toLocaleString('ar-SA'),
      icon: Download,
      color: 'from-orange-500 to-amber-500'
    },
    {
      title: 'المشاركات',
      value: analytics.totalShares.toLocaleString('ar-SA'),
      icon: Share2,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'المستخدمين',
      value: analytics.totalUsers,
      icon: Users,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'الفئات',
      value: analytics.totalCategories,
      icon: Folder,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'ملفات الوسائط',
      value: analytics.totalMedia,
      icon: ImageIcon,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة الإحصائيات</h1>
            <p className="text-gray-600 mt-1">تحليل شامل لأداء الموقع</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[
            { value: 'today', label: 'اليوم' },
            { value: 'week', label: 'هذا الأسبوع' },
            { value: 'month', label: 'هذا الشهر' },
            { value: 'year', label: 'هذا العام' }
          ].map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value as any)}
              className={timeRange === range.value ? 'bg-gradient-to-r from-primary to-teal-600' : ''}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.title}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              المقالات الأكثر مشاهدة
            </h2>
          </div>

          {analytics.topPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد بيانات متاحة
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topPosts.slice(0, 5).map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {post.titleAr}
                    </div>
                    <div className="text-sm text-gray-600">
                      {post.viewCount.toLocaleString()} مشاهدة • {post.downloadCount.toLocaleString()} تحميل
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              النشاط الأخير
            </h2>
          </div>

          <div className="space-y-3">
            {analytics.recentViews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد أنشطة حديثة
              </div>
            ) : (
              analytics.recentViews.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shrink-0">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {activity.postTitle}
                    </div>
                    <div className="text-xs text-gray-600">
                      {activity.viewCount} مشاهدة • {activity.date}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Overview Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          نظرة عامة على الأداء
        </h2>

        {analytics.chartData.labels.length > 0 ? (
          <div className="h-80">
            <AnalyticsChart
              labels={analytics.chartData.labels}
              viewsData={analytics.chartData.viewsData}
              downloadsData={analytics.chartData.downloadsData}
              postsData={analytics.chartData.postsData}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">لا توجد بيانات متاحة</p>
              <p className="text-sm text-gray-500">
                سيتم عرض المخططات عند توفر البيانات
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {((analytics.totalViews / analytics.publishedPosts) || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">متوسط المشاهدات/مقال</div>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '75%' }}></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {((analytics.publishedPosts / analytics.totalPosts) * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">معدل النشر</div>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
              style={{ width: `${((analytics.publishedPosts / analytics.totalPosts) * 100 || 0)}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {((analytics.totalDownloads / analytics.publishedPosts) || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">متوسط التحميلات/مقال</div>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '62%' }}></div>
          </div>
        </Card>
      </div>
    </div>
  )
}

