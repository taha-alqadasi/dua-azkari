'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Calendar,
  User,
  Tag,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  duaNumber: number
  titleAr: string
  titleEn?: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  viewCount: number
  downloadCount: number
  audioDuration: number
  reciterName?: string
  publishedAt?: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
  category: {
    id: string
    nameAr: string
    nameEn?: string
  }
  tags: Array<{
    tag: {
      id: string
      nameAr: string
      nameEn?: string
    }
  }>
}

interface PostsResponse {
  success: boolean
  data: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function PostsPage() {
  const { hasPermission } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const canCreate = hasPermission('posts.create')
  const canEdit = hasPermission('posts.update')
  const canDelete = hasPermission('posts.delete')

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const response = await fetch(`/api/posts?${params}`)
      const data: PostsResponse = await response.json()

      if (data.success) {
        setPosts(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('خطأ في جلب المنشورات:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce البحث
    const timer = setTimeout(() => {
      setCurrentPage(1) // إعادة تعيين الصفحة عند البحث
      fetchPosts()
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleDelete = async (postId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('خطأ في حذف المنشور:', error)
    }
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المنشورات</h1>
          <p className="text-muted-foreground">
            إدارة المقاطع الصوتية والمحتوى
          </p>
        </div>
        
        {canCreate && (
          <Link href="/admin/posts/new">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة منشور جديد
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="البحث في المنشورات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="all">جميع الحالات</option>
                <option value="PUBLISHED">منشور</option>
                <option value="DRAFT">مسودة</option>
                <option value="ARCHIVED">مؤرشف</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="createdAt-desc">الأحدث أولاً</option>
                <option value="createdAt-asc">الأقدم أولاً</option>
                <option value="titleAr-asc">العنوان (أ - ي)</option>
                <option value="titleAr-desc">العنوان (ي - أ)</option>
                <option value="viewCount-desc">الأكثر مشاهدة</option>
                <option value="viewCount-asc">الأقل مشاهدة</option>
                <option value="publishedAt-desc">تاريخ النشر (الأحدث)</option>
                <option value="publishedAt-asc">تاريخ النشر (الأقدم)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد منشورات</h3>
              <p className="text-muted-foreground text-center mb-4">
                لم يتم العثور على أي منشورات. ابدأ بإضافة منشور جديد.
              </p>
              {canCreate && (
                <Link href="/admin/posts/new">
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة منشور جديد
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{post.titleAr}</h3>
                      {getStatusBadge(post.status)}
                    </div>
                    
                    {post.titleEn && (
                      <p className="text-sm text-muted-foreground mb-2">{post.titleEn}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author.name}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {post.category.nameAr}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.createdAt)}
                      </div>
                      
                      {post.reciterName && (
                        <div className="flex items-center gap-1">
                          <span>بصوت: {post.reciterName}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount.toLocaleString()} مشاهدة
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {post.downloadCount.toLocaleString()} تحميل
                      </div>
                      
                      <div>
                        المدة: {formatDuration(post.audioDuration)}
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {post.tags.length} وسم
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/listen/${post.duaNumber}/${post.slug}`} target="_blank">
                          <Eye className="ml-2 h-4 w-4" />
                          عرض في الموقع
                        </Link>
                      </DropdownMenuItem>
                      
                      {canEdit && (
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            عرض {posts.length} من أصل {pagination.total} منشور
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              السابق
            </Button>
            
            <span className="text-sm">
              صفحة {currentPage} من {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
