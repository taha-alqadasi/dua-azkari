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
  FolderOpen,
  Tag as TagIcon
} from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  nameAr: string
  nameEn?: string
  slug: string
  description?: string
  color?: string
  icon?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
  }
}

interface CategoriesResponse {
  success: boolean
  data: Category[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function CategoriesPage() {
  const { hasPermission } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const canCreate = hasPermission('categories.create')
  const canEdit = hasPermission('categories.update')
  const canDelete = hasPermission('categories.delete')

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { isActive: statusFilter }),
      })

      const response = await fetch(`/api/categories?${params}`)
      const data: CategoriesResponse = await response.json()

      if (data.success) {
        setCategories(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce البحث
    const timer = setTimeout(() => {
      setCurrentPage(1) // إعادة تعيين الصفحة عند البحث
      fetchCategories()
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleDelete = async (categoryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        fetchCategories()
      } else {
        alert(data.error || 'حدث خطأ أثناء حذف التصنيف')
      }
    } catch (error) {
      console.error('خطأ في حذف التصنيف:', error)
      alert('حدث خطأ أثناء حذف التصنيف')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'نشط' : 'غير نشط'}
      </span>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">التصنيفات</h1>
          <p className="text-muted-foreground">
            إدارة تصنيفات المحتوى
          </p>
        </div>
        
        {canCreate && (
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة تصنيف جديد
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
                  placeholder="البحث في التصنيفات..."
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
                <option value="true">نشط</option>
                <option value="false">غير نشط</option>
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
                <option value="nameAr-asc">الاسم (أ - ي)</option>
                <option value="nameAr-desc">الاسم (ي - أ)</option>
                <option value="sortOrder-asc">الترتيب (تصاعدي)</option>
                <option value="sortOrder-desc">الترتيب (تنازلي)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد تصنيفات</h3>
                <p className="text-muted-foreground text-center mb-4">
                  لم يتم العثور على أي تصنيفات. ابدأ بإضافة تصنيف جديد.
                </p>
                {canCreate && (
                  <Link href="/admin/categories/new">
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة تصنيف جديد
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {category.color && (
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    {category.icon && (
                      <div className="text-lg">{category.icon}</div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{category.nameAr}</CardTitle>
                      {category.nameEn && (
                        <p className="text-sm text-muted-foreground">{category.nameEn}</p>
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
                        <Link href={`/category/${category.slug}`} target="_blank">
                          <Eye className="ml-2 h-4 w-4" />
                          عرض في الموقع
                        </Link>
                      </DropdownMenuItem>
                      
                      {canEdit && (
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {canDelete && category._count.posts === 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(category.id)}
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
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(category.isActive)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TagIcon className="h-3 w-3" />
                      {category._count.posts} منشور
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>الترتيب: {category.sortOrder}</span>
                    <span>{formatDate(category.createdAt)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    الرابط: /{category.slug}
                  </div>
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
            عرض {categories.length} من أصل {pagination.total} تصنيف
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
