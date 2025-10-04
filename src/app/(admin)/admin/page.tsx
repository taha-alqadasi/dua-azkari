'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  FolderOpen, 
  Tag, 
  Upload,
  Users,
  Eye,
  Download,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  posts: {
    total: number
    published: number
    draft: number
    archived: number
  }
  categories: {
    total: number
    active: number
  }
  tags: {
    total: number
    active: number
  }
  media: {
    total: number
    totalSize: number
  }
  analytics: {
    totalViews: number
    totalDownloads: number
    todayViews: number
    todayDownloads: number
  }
}

interface RecentPost {
  id: string
  titleAr: string
  status: string
  viewCount: number
  createdAt: string
  author: {
    name: string
  }
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // في التطبيق الحقيقي، سنجلب هذه البيانات من API
      // هنا سنستخدم بيانات وهمية للعرض
      const mockStats: DashboardStats = {
        posts: {
          total: 25,
          published: 18,
          draft: 5,
          archived: 2
        },
        categories: {
          total: 8,
          active: 7
        },
        tags: {
          total: 15,
          active: 12
        },
        media: {
          total: 42,
          totalSize: 1024 * 1024 * 150 // 150MB
        },
        analytics: {
          totalViews: 12450,
          totalDownloads: 3280,
          todayViews: 156,
          todayDownloads: 42
        }
      }

      const mockRecentPosts: RecentPost[] = [
        {
          id: '1',
          titleAr: 'دعاء الصباح',
          status: 'PUBLISHED',
          viewCount: 245,
          createdAt: new Date().toISOString(),
          author: { name: 'أحمد محمد' }
        },
        {
          id: '2',
          titleAr: 'دعاء المساء',
          status: 'PUBLISHED',
          viewCount: 189,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          author: { name: 'أحمد محمد' }
        },
        {
          id: '3',
          titleAr: 'أذكار النوم',
          status: 'DRAFT',
          viewCount: 0,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          author: { name: 'أحمد محمد' }
        }
      ]

      setStats(mockStats)
      setRecentPosts(mockRecentPosts)
    } catch (error) {
      console.error('خطأ في جلب بيانات لوحة التحكم:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      PUBLISHED: 'منشور',
      DRAFT: 'مسودة',
      ARCHIVED: 'مؤرشف'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            مرحباً، {user?.name}
          </h1>
          <p className="text-muted-foreground">
            إليك نظرة عامة على أداء موقع دعاء أذكاري
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="ml-2 h-4 w-4" />
            التقارير
          </Button>
          <Link href="/admin/posts/new">
            <Button>
              <FileText className="ml-2 h-4 w-4" />
              منشور جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.posts.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.posts.published} منشور، {stats?.posts.draft} مسودة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التصنيفات</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.categories.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.categories.active} تصنيف نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوسوم</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tags.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.tags.active} وسم نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملفات الوسائط</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.media.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(stats?.media.totalSize || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.analytics.todayViews} اليوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التحميلات</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.analytics.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.analytics.todayDownloads} اليوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النمو</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              مقارنة بالشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الجلسة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4:32</div>
            <p className="text-xs text-muted-foreground">
              دقائق لكل زيارة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>المنشورات الأخيرة</CardTitle>
              <Link href="/admin/posts">
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{post.titleAr}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>بواسطة {post.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <span>{post.viewCount} مشاهدة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(post.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>
              الإجراءات الأكثر استخداماً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/posts/new">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>منشور جديد</span>
                </Button>
              </Link>
              
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <FolderOpen className="h-6 w-6" />
                  <span>إدارة التصنيفات</span>
                </Button>
              </Link>
              
              <Link href="/admin/media">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span>رفع ملف</span>
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>إدارة المستخدمين</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>حالة النظام</CardTitle>
          <CardDescription>
            معلومات حول أداء النظام والخادم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">وقت التشغيل</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <p className="text-sm text-muted-foreground">متوسط وقت الاستجابة</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">45GB</div>
              <p className="text-sm text-muted-foreground">مساحة التخزين المستخدمة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
