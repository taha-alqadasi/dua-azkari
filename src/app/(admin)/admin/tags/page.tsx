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
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye, 
  Tag as TagIcon,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Tag {
  id: string
  nameAr: string
  nameEn?: string
  slug: string
  description?: string
  color?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
  }
}

interface TagsResponse {
  success: boolean
  data: Tag[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function TagsPage() {
  const { isLoading: authLoading } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTags, setTotalTags] = useState(0)

  const fetchTags = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { isActive: statusFilter })
      })

      const response = await fetch(`/api/tags?${params}`)
      if (response.ok) {
        const result: TagsResponse = await response.json()
        if (result.success) {
          setTags(result.data)
          setTotalPages(result.pagination.totalPages)
          setTotalTags(result.pagination.total)
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الوسوم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    // Debounce البحث
    const timer = setTimeout(() => {
      setCurrentPage(1) // إعادة تعيين الصفحة عند البحث
      fetchTags()
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, searchTerm, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    if (!authLoading) {
      fetchTags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الوسم؟')) return

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTags()
      } else {
        alert('فشل حذف الوسم')
      }
    } catch (error) {
      console.error('خطأ في حذف الوسم:', error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الوسوم</h1>
          <p className="text-gray-500 mt-1">إدارة وسوم المحتوى والتصنيفات الفرعية</p>
        </div>
        <Link href="/admin/tags/new">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إضافة وسم جديد
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوسوم</CardTitle>
            <TagIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTags}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الوسوم النشطة</CardTitle>
            <TagIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.filter(t => t.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الوسوم غير النشطة</CardTitle>
            <TagIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.filter(t => !t.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن وسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
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
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الوسوم ({totalTags})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-4 font-semibold">الوسم</th>
                  <th className="text-right p-4 font-semibold">الاسم بالإنجليزية</th>
                  <th className="text-right p-4 font-semibold">عدد المنشورات</th>
                  <th className="text-right p-4 font-semibold">الحالة</th>
                  <th className="text-right p-4 font-semibold">تاريخ الإنشاء</th>
                  <th className="text-center p-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      لا توجد وسوم
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {tag.color && (
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{tag.nameAr}</div>
                            <div className="text-sm text-gray-500" dir="ltr">
                              /{tag.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600" dir="ltr">
                        {tag.nameEn || '-'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          <TagIcon className="h-3 w-3" />
                          {tag._count.posts}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            tag.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tag.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(tag.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem asChild>
                                <Link href={`/tag/${tag.slug}`} target="_blank">
                                  <Eye className="h-4 w-4 ml-2" />
                                  عرض في الموقع
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tags/${tag.id}/edit`}>
                                  <Edit className="h-4 w-4 ml-2" />
                                  تعديل
                                </Link>
                              </DropdownMenuItem>

                              {tag._count.posts === 0 && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(tag.id)}
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

