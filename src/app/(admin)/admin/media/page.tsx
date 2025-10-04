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
  Trash2, 
  Loader2,
  Image as ImageIcon,
  Music,
  FileText,
  Eye,
  Copy,
  Download,
  X,
  Filter
} from 'lucide-react'
import Image from 'next/image'
import { MediaUploadModal } from '@/components/shared/MediaUploadModal'

interface MediaFile {
  id: string
  fileName: string
  fileType: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'OTHER'
  mimeType: string
  fileSize: number
  fileUrl: string
  createdAt: string
  uploadedBy: string
  uploader?: {
    name: string
    email: string
  }
}

interface MediaResponse {
  success: boolean
  data: MediaFile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function MediaPage() {
  const { isLoading: authLoading } = useAuth()
  const [media, setMedia] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFiles, setTotalFiles] = useState(0)
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'largest' | 'smallest'>('newest')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      fetchMedia()
    }
  }, [authLoading, currentPage, searchTerm, filterType, sortBy])

  const fetchMedia = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'ALL' && { type: filterType })
      })

      const response = await fetch(`/api/media?${params}`)
      if (response.ok) {
        const result: MediaResponse = await response.json()
        if (result.success) {
          let sortedMedia = [...result.data]
          
          // الفرز
          switch (sortBy) {
            case 'newest':
              sortedMedia.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              break
            case 'oldest':
              sortedMedia.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              break
            case 'largest':
              sortedMedia.sort((a, b) => b.fileSize - a.fileSize)
              break
            case 'smallest':
              sortedMedia.sort((a, b) => a.fileSize - b.fileSize)
              break
          }
          
          setMedia(sortedMedia)
          setTotalPages(result.pagination.totalPages)
          setTotalFiles(result.pagination.total)
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الوسائط:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMedia()
      } else {
        alert('فشل حذف الملف')
      }
    } catch (error) {
      console.error('خطأ في حذف الملف:', error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('تم نسخ الرابط!')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'IMAGE':
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      case 'AUDIO':
        return <Music className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchMedia()
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
          <h1 className="text-3xl font-bold text-gray-900">مكتبة الوسائط</h1>
          <p className="text-gray-500 mt-1">إدارة الصور والملفات الصوتية</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="h-4 w-4 ml-2" />
            رفع ملف جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الملفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الصور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {media.filter(m => m.fileType === 'IMAGE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الملفات الصوتية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {media.filter(m => m.fileType === 'AUDIO').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الحجم الإجمالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatFileSize(media.reduce((acc, m) => acc + m.fileSize, 0))}
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
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن ملف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 ml-2" />
                بحث
              </Button>
            </form>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="ALL">جميع الأنواع</option>
                <option value="IMAGE">صور فقط</option>
                <option value="AUDIO">صوتيات فقط</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
                <option value="largest">الأكبر حجماً</option>
                <option value="smallest">الأصغر حجماً</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {media.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            لا توجد ملفات
          </div>
        ) : (
          media.map((file) => (
            <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                {file.fileType === 'IMAGE' ? (
                  <Image
                    src={file.fileUrl}
                    alt={file.fileName}
                    fill
                    className="object-cover"
                  />
                ) : file.fileType === 'AUDIO' ? (
                  <Music className="h-16 w-16 text-purple-400" />
                ) : (
                  <FileText className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getFileIcon(file.fileType)}
                      <p className="text-sm font-medium truncate" title={file.fileName}>
                        {file.fileName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                        <Eye className="h-4 w-4 ml-2" />
                        {file.fileType === 'AUDIO' ? 'استماع' : 'عرض'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyUrl(file.fileUrl)}>
                        <Copy className="h-4 w-4 ml-2" />
                        نسخ الرابط
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={file.fileUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 ml-2" />
                          تحميل
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(file.createdAt).toLocaleDateString('ar-SA')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
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
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{previewFile.fileName}</h3>
                <p className="text-sm text-gray-500">{formatFileSize(previewFile.fileSize)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              {previewFile.fileType === 'IMAGE' ? (
                <div className="relative w-full" style={{ minHeight: '400px' }}>
                  <Image
                    src={previewFile.fileUrl}
                    alt={previewFile.fileName}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded"
                  />
                </div>
              ) : previewFile.fileType === 'AUDIO' ? (
                <div className="py-8">
                  <div className="flex items-center justify-center mb-4">
                    <Music className="h-24 w-24 text-purple-400" />
                  </div>
                  <audio controls className="w-full">
                    <source src={previewFile.fileUrl} type={previewFile.mimeType} />
                    متصفحك لا يدعم تشغيل الصوت
                  </audio>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  لا يمكن معاينة هذا النوع من الملفات
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex gap-2 justify-end">
              <Button variant="outline" onClick={() => handleCopyUrl(previewFile.fileUrl)}>
                <Copy className="h-4 w-4 ml-2" />
                نسخ الرابط
              </Button>
              <Button variant="outline" asChild>
                <a href={previewFile.fileUrl} download>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Upload Modal */}
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={(fileUrl, mediaData) => {
          fetchMedia()
        }}
        title="رفع ملف جديد"
        description="اختر طريقة الرفع المناسبة (محلي أو سحابي)"
      />
    </div>
  )
}
