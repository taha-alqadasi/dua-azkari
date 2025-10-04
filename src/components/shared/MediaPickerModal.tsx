'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Search, Check, Image as ImageIcon, Loader2 } from 'lucide-react'

interface Media {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
}

interface MediaPickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  mediaType?: 'image' | 'audio' | 'document' | 'all'
  title?: string
}

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  mediaType = 'all',
  title = 'اختر ملف'
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // جلب الوسائط
  const fetchMedia = async () => {
    setLoading(true)
    try {
      let url = `/api/media?page=${page}&limit=12`
      if (mediaType !== 'all') {
        url += `&type=${mediaType}`
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setMedia(result.data)
        setTotalPages(result.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [open, page, searchTerm])

  // رفع ملف جديد
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // التحقق من نوع الملف
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', mediaType === 'all' ? 'image' : mediaType)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      // التحقق من الـ response قبل parse الـ JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload failed:', errorText)
        alert('فشل في رفع الملف')
        return
      }

      const result = await response.json()

      if (result.success) {
        // تحديث القائمة
        await fetchMedia()
        // تحديد الملف الجديد تلقائياً
        setSelectedMedia(result.data.fileUrl)
        alert('تم رفع الملف بنجاح')
      } else {
        alert(result.error || 'فشل في رفع الملف')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('حدث خطأ أثناء رفع الملف')
    } finally {
      setUploading(false)
      // إعادة تعيين input
      e.target.value = ''
    }
  }

  // اختيار الملف
  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia)
      onClose()
      setSelectedMedia(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">مكتبة الوسائط</TabsTrigger>
            <TabsTrigger value="upload">رفع ملف جديد</TabsTrigger>
          </TabsList>

          {/* مكتبة الوسائط */}
          <TabsContent value="library" className="flex-1 flex flex-col overflow-hidden">
            {/* البحث */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن ملف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* قائمة الوسائط */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <ImageIcon className="h-16 w-16 mb-4" />
                  <p>لا توجد ملفات</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedMedia === item.fileUrl
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedMedia(item.fileUrl)}
                    >
                      {/* الصورة */}
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {item.fileType.startsWith('image/') ? (
                          <img
                            src={item.fileUrl}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            <ImageIcon className="h-12 w-12" />
                          </div>
                        )}
                      </div>

                      {/* علامة الاختيار */}
                      {selectedMedia === item.fileUrl && (
                        <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      {/* اسم الملف */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs truncate">
                        {item.fileName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <span className="text-sm text-gray-600">
                  صفحة {page} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}

            {/* زر الاختيار */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedMedia}
                className="bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                اختيار
              </Button>
            </div>
          </TabsContent>

          {/* رفع ملف جديد */}
          <TabsContent value="upload" className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <p className="text-sm text-gray-600">جاري الرفع...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-primary">انقر لاختيار ملف</span> أو اسحب وأفلت
                      </p>
                      <p className="text-xs text-gray-500">
                        {mediaType === 'image'
                          ? 'PNG, JPG, WEBP (حتى 10MB)'
                          : 'جميع أنواع الملفات'}
                      </p>
                    </>
                  )}
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept={mediaType === 'image' ? 'image/*' : undefined}
                  />
                </Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

