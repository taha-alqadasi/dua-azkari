'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  X, 
  Loader2,
  Cloud,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Edit2
} from 'lucide-react'
import { getFileExtension } from '@/lib/file-naming'

interface MediaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (fileUrl: string, mediaData?: any) => void
  acceptedFileTypes?: string // e.g., "audio/*,image/*"
  title?: string
  description?: string
  suggestedFileName?: string // اسم الملف المقترح
}

export function MediaUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  acceptedFileTypes = "audio/*,image/*,.pdf,.doc,.docx",
  title = "رفع ملف جديد",
  description = "اختر طريقة الرفع المناسبة",
  suggestedFileName = ""
}: MediaUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>('cloud')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customFileName, setCustomFileName] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    altText: '',
    caption: ''
  })

  // تحديث الاسم المقترح عند فتح Modal
  useEffect(() => {
    if (isOpen && suggestedFileName) {
      setCustomFileName(suggestedFileName)
    }
  }, [isOpen, suggestedFileName])

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file,
        altText: file.name.split('.')[0]
      }))
      setError(null)
      setSuccess(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadForm.file) {
      setError('الرجاء اختيار ملف')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('altText', uploadForm.altText)
      formData.append('caption', uploadForm.caption)
      formData.append('uploadType', activeTab) // cloud أو local
      
      // إضافة الاسم المخصص إذا كان موجوداً
      if (customFileName) {
        formData.append('smartFileName', customFileName)
      }

      // محاكاة التقدم
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onUploadComplete(data.data.fileUrl, data.data)
          handleClose()
        }, 1000)
      } else {
        setError(data.error || 'حدث خطأ أثناء رفع الملف')
      }
    } catch (error) {
      console.error('خطأ في رفع الملف:', error)
      setError('حدث خطأ أثناء رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setUploadForm({ file: null, altText: '', caption: '' })
    setError(null)
    setSuccess(false)
    setUploadProgress(0)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'cloud' | 'local')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="cloud" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>Cloudflare (سحابي)</span>
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>محلي</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cloud" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">رفع سحابي إلى Cloudflare R2</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      الملفات سيتم رفعها إلى Cloudflare R2 مع سرعة عالية وموثوقية
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local" className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">رفع محلي</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      الملفات سيتم حفظها على السيرفر المحلي
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleUpload} className="space-y-4 mt-6">
            {/* File Input */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept={acceptedFileTypes}
                disabled={uploading}
              />
              
              {!uploadForm.file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-2">اضغط لاختيار ملف</p>
                  <p className="text-xs text-muted-foreground">
                    أو اسحب الملف وأفلته هنا
                  </p>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{uploadForm.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadForm.file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* اسم الملف المقترح */}
            {customFileName && (
              <div>
                <Label htmlFor="customFileName" className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  اسم الملف (قابل للتعديل)
                </Label>
                <Input
                  id="customFileName"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="اسم الملف"
                  disabled={uploading}
                  dir="ltr"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 الاسم يتم توليده تلقائياً من العنوان + AZKari-app
                </p>
              </div>
            )}

            {/* Alt Text */}
            <div>
              <Label htmlFor="altText">النص البديل</Label>
              <Input
                id="altText"
                value={uploadForm.altText}
                onChange={(e) => setUploadForm(prev => ({ ...prev, altText: e.target.value }))}
                placeholder="وصف الملف"
                disabled={uploading}
              />
            </div>

            {/* Caption */}
            <div>
              <Label htmlFor="caption">التعليق (اختياري)</Label>
              <textarea
                id="caption"
                value={uploadForm.caption}
                onChange={(e) => setUploadForm(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="تعليق على الملف"
                className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
              />
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  جاري الرفع... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    تم رفع الملف بنجاح!
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={uploading}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={!uploadForm.file || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-4 w-4" />
                    رفع إلى {activeTab === 'cloud' ? 'السحابة' : 'السيرفر المحلي'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

