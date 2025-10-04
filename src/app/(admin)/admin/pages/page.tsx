'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  FileType,
  Loader2
} from 'lucide-react'

interface Page {
  id: string
  titleAr: string
  titleEn?: string | null
  slug: string
  status: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export default function PagesPage() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPages()
  }, [currentPage, search])

  const fetchPages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search })
      })

      const response = await fetch(`/api/pages?${params}`)
      const data = await response.json()

      if (data.success) {
        setPages(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('خطأ في جلب الصفحات:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return

    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchPages()
      } else {
        alert(data.error || 'فشل حذف الصفحة')
      }
    } catch (error) {
      console.error('خطأ في حذف الصفحة:', error)
      alert('حدث خطأ أثناء حذف الصفحة')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: { label: 'منشورة', className: 'bg-green-100 text-green-800' },
      DRAFT: { label: 'مسودة', className: 'bg-yellow-100 text-yellow-800' },
      ARCHIVED: { label: 'مؤرشفة', className: 'bg-gray-100 text-gray-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileType className="h-8 w-8 text-primary" />
            الصفحات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة صفحات الموقع الثابتة
          </p>
        </div>
        <Link href="/admin/pages/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة صفحة جديدة
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث في الصفحات..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <CardTitle>جميع الصفحات ({pages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <FileType className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد صفحات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء أول صفحة</p>
              <Link href="/admin/pages/new">
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة صفحة جديدة
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-semibold">العنوان</th>
                    <th className="text-right py-3 px-4 font-semibold">الرابط</th>
                    <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold">الكاتب</th>
                    <th className="text-right py-3 px-4 font-semibold">تاريخ الإنشاء</th>
                    <th className="text-right py-3 px-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{page.titleAr}</div>
                        {page.titleEn && (
                          <div className="text-sm text-gray-500">{page.titleEn}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(page.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{page.author.name}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(page.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/${page.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/pages/${page.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(page.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <span className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

