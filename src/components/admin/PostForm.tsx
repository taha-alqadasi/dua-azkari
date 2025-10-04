'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save, 
  ArrowLeft, 
  Upload,
  Eye,
  Loader2,
  X,
  Plus,
  Edit2
} from 'lucide-react'
import Link from 'next/link'
import { MediaUploadModal } from '@/components/shared/MediaUploadModal'
import { generateSmartFileName, getFileExtension } from '@/lib/file-naming'

interface Category {
  id: string
  nameAr: string
}

interface Tag {
  id: string
  nameAr: string
  slug: string
  color?: string
}

interface PostFormData {
  titleAr: string
  titleEn: string
  slug: string
  description: string
  content: string
  audioUrl: string
  audioDuration: number
  audioFileSize: number
  thumbnailUrl: string
  reciterName: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isFeatured: boolean
  categoryId: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

interface PostFormProps {
  postId?: string
  initialData?: Partial<PostFormData>
  initialTags?: string[]
}

export default function PostForm({ postId, initialData, initialTags = [] }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
  const [tagSearch, setTagSearch] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [showAudioUploadModal, setShowAudioUploadModal] = useState(false)
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
  const [suggestedAudioFileName, setSuggestedAudioFileName] = useState('')
  const [suggestedImageFileName, setSuggestedImageFileName] = useState('')
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [slugEditable, setSlugEditable] = useState(!postId) // عند الإنشاء يكون قابل للتعديل تلقائياً
  
  const [formData, setFormData] = useState<PostFormData>({
    titleAr: '',
    titleEn: '',
    slug: '',
    description: '',
    content: '',
    audioUrl: '',
    audioDuration: 0,
    audioFileSize: 0,
    thumbnailUrl: '',
    reciterName: '',
    status: 'DRAFT',
    isFeatured: false,
    categoryId: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ...initialData
  })

  useEffect(() => {
    fetchCategoriesAndTags()
  }, [])

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/categories?limit=100&active=true'),
        fetch('/api/tags?limit=100&active=true')
      ])
      
      if (categoriesRes.ok) {
        const categoriesResult = await categoriesRes.json()
        if (categoriesResult.success) {
          setCategories(categoriesResult.data)
        }
      }
      
      if (tagsRes.ok) {
        const tagsResult = await tagsRes.json()
        if (tagsResult.success) {
          setTags(tagsResult.data)
        }
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      // إزالة الرموز الخاصة فقط، الإبقاء على الأحرف العربية والإنجليزية والأرقام
      .replace(/[^\u0600-\u06FF\w\s-]/g, '') // يدعم العربية + الإنجليزية + الأرقام
      .replace(/\s+/g, '-') // استبدال المسافات بشرطة
      .replace(/-+/g, '-') // إزالة الشرطات المتكررة
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // إنشاء slug تلقائياً من العنوان العربي فقط عند الإنشاء الجديد أو عندما يكون قابل للتعديل
    if (field === 'titleAr' && typeof value === 'string' && (!postId || slugEditable)) {
      const slug = generateSlug(value)
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }

  // فتح modal رفع الصوت مع توليد اسم ذكي
  const openAudioUploadModal = () => {
    // توليد اسم ذكي من slug
    if (formData.slug) {
      const suggestedName = generateSmartFileName(formData.slug, 'mp3', [])
      setSuggestedAudioFileName(suggestedName)
    }
    setShowAudioUploadModal(true)
  }

  // فتح modal رفع الصورة مع توليد اسم ذكي
  const openImageUploadModal = () => {
    // توليد اسم ذكي من slug
    if (formData.slug) {
      const suggestedName = generateSmartFileName(formData.slug, 'jpg', [])
      setSuggestedImageFileName(suggestedName)
    }
    setShowImageUploadModal(true)
  }

  // معالج رفع الصوت من Media Upload Modal
  const handleAudioUploadComplete = (fileUrl: string, mediaData: any) => {
    setFormData(prev => ({
      ...prev,
      audioUrl: fileUrl,
      audioFileSize: mediaData?.fileSize || 0,
    }))
    
    // حساب مدة الصوت
    const audio = new Audio(fileUrl)
    audio.addEventListener('loadedmetadata', () => {
      setFormData(prev => ({
        ...prev,
        audioDuration: Math.round(audio.duration)
      }))
    })
    audio.load()
    
    setShowAudioUploadModal(false)
    setSuggestedAudioFileName('')
    setSelectedAudioFile(null)
  }

  // معالج رفع الصورة من Media Upload Modal
  const handleImageUploadComplete = (fileUrl: string) => {
    setFormData(prev => ({
      ...prev,
      thumbnailUrl: fileUrl
    }))
    setShowImageUploadModal(false)
    setSuggestedImageFileName('')
    setSelectedImageFile(null)
  }

  const filteredTags = useCallback(() => {
    if (!tagSearch) return tags
    return tags.filter(tag => 
      tag.nameAr.toLowerCase().includes(tagSearch.toLowerCase())
    )
  }, [tags, tagSearch])

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: newTagName,
          slug: generateSlug(newTagName),
          isActive: true
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTags(prev => [...prev, result.data])
          setSelectedTags(prev => [...prev, result.data.id])
          setNewTagName('')
          setTagSearch('')
          setShowTagSuggestions(false)
        }
      }
    } catch (error) {
      console.error('خطأ في إنشاء الوسم:', error)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titleAr || !formData.audioUrl || !formData.categoryId) {
      alert('يرجى ملء الحقول المطلوبة: العنوان العربي، رابط الصوت، والتصنيف')
      return
    }

    if (!formData.audioDuration || formData.audioDuration <= 0) {
      alert('يرجى إدخال مدة الملف الصوتي')
      return
    }

    if (!formData.audioFileSize || formData.audioFileSize <= 0) {
      alert('يرجى إدخال حجم الملف الصوتي')
      return
    }

    setLoading(true)

    try {
      const url = postId ? `/api/posts/${postId}` : '/api/posts'
      const method = postId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags,
        }),
      })

      // التحقق من نجاح الـ response أولاً
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error:', errorText)
        alert('حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.')
        return
      }

      const data = await response.json()

      if (data.success) {
        alert(`تم ${postId ? 'تحديث' : 'نشر'} المنشور بنجاح!`)
        // Use replace instead of push for better performance
        window.location.href = '/admin/posts'
      } else {
        alert(data.error || 'حدث خطأ أثناء حفظ المنشور')
      }
    } catch (error) {
      console.error('خطأ في حفظ المنشور:', error)
      alert('حدث خطأ أثناء حفظ المنشور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 w-full sm:w-auto">
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm" className="shrink-0">
              <ArrowLeft className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">العودة</span>
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              {postId ? 'تعديل المنشور' : 'إضافة منشور جديد'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {postId ? 'تعديل بيانات المنشور' : 'إنشاء مقطع صوتي جديد'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData(prev => ({ ...prev, status: 'DRAFT' }))
              setTimeout(() => document.getElementById('submit-form')?.click(), 100)
            }}
            disabled={loading}
            className="flex-1 sm:flex-none text-sm"
          >
            {loading ? (
              <Loader2 className="ml-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">حفظ كمسودة</span>
            <span className="sm:hidden">مسودة</span>
          </Button>
          
          <Button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, status: 'PUBLISHED' }))
              setTimeout(() => document.getElementById('submit-form')?.click(), 100)
            }}
            disabled={loading}
            className="flex-1 sm:flex-none text-sm"
          >
            {loading ? (
              <Loader2 className="ml-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              postId ? <Save className="ml-2 h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {postId ? 'حفظ' : 'نشر'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sidebar - Left side (Order First on mobile) */}
        <div className="lg:order-1 space-y-4 sm:space-y-6">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>التصنيف</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="categoryId">اختر التصنيف *</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm mt-2"
                required
              >
                <option value="">اختر التصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nameAr}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Tags with Smart Search */}
          <Card>
            <CardHeader>
              <CardTitle>الوسوم</CardTitle>
              <CardDescription>ابحث وأضف وسوم أو أنشئ وسماً جديداً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tag Search */}
              <div className="relative">
                <Input
                  placeholder="ابحث عن وسم..."
                  value={tagSearch}
                  onChange={(e) => {
                    setTagSearch(e.target.value)
                    setShowTagSuggestions(true)
                  }}
                  onFocus={() => setShowTagSuggestions(true)}
                />
                
                {/* Suggestions Dropdown */}
                {showTagSuggestions && tagSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredTags().length > 0 ? (
                      filteredTags().map((tag) => (
                        <div
                          key={tag.id}
                          onClick={() => {
                            handleTagToggle(tag.id)
                            setTagSearch('')
                            setShowTagSuggestions(false)
                          }}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            {tag.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                            )}
                            {tag.nameAr}
                          </span>
                          {selectedTags.includes(tag.id) && (
                            <span className="text-green-600">✓</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">
                        لا توجد نتائج
                      </div>
                    )}
                    
                    {/* Create New Tag Option */}
                    {tagSearch && !filteredTags().some(t => t.nameAr.toLowerCase() === tagSearch.toLowerCase()) && (
                      <div className="border-t">
                        <div className="px-3 py-2 flex items-center gap-2">
                          <Input
                            placeholder="اسم الوسم الجديد"
                            value={newTagName || tagSearch}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!newTagName && tagSearch) {
                                setNewTagName(tagSearch)
                              }
                              handleCreateTag()
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = tags.find(t => t.id === tagId)
                  if (!tag) return null
                  return (
                    <div
                      key={tagId}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : {}}
                    >
                      {tag.nameAr}
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tagId)}
                        className="hover:bg-white/50 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {selectedTags.length === 0 && (
                <p className="text-sm text-gray-500">لم يتم اختيار أي وسوم بعد</p>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>الحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="status">حالة المنشور</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm mt-2"
                >
                  <option value="DRAFT">مسودة</option>
                  <option value="PUBLISHED">منشور</option>
                  <option value="ARCHIVED">مؤرشف</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>مميز</span>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Right side on desktop, Second on mobile */}
        <div className="lg:col-span-2 lg:order-2 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>المعلومات الأساسية للمنشور</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleAr">العنوان العربي *</Label>
                  <Input
                    id="titleAr"
                    value={formData.titleAr}
                    onChange={(e) => handleInputChange('titleAr', e.target.value)}
                    placeholder="دعاء الصباح"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="titleEn">العنوان الإنجليزي</Label>
                  <Input
                    id="titleEn"
                    value={formData.titleEn}
                    onChange={(e) => handleInputChange('titleEn', e.target.value)}
                    placeholder="Morning Dua"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slug">الرابط المختصر * {!postId && '(يتم إنشاؤه تلقائياً)'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="morning-dua"
                    required
                    dir="ltr"
                    readOnly={!!postId && !slugEditable}
                    className={postId && !slugEditable ? 'bg-gray-100 cursor-not-allowed' : ''}
                  />
                  {postId && (
                    <Button
                      type="button"
                      variant={slugEditable ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setSlugEditable(!slugEditable)}
                      title={slugEditable ? 'قفل التعديل' : 'تعديل الرابط'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {postId && !slugEditable ? (
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ الرابط المختصر محمي من التعديل. اضغط على زر القلم للتعديل.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    يتم إنشاؤه تلقائياً من العنوان العربي، ويمكنك تعديله
                  </p>
                )}
                {!postId && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    📝 ملاحظة: سيتم توليد رقم الدعاء تلقائياً عند الحفظ
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="وصف المقطع الصوتي..."
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>

              <div>
                <Label htmlFor="content">المحتوى</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="نص الدعاء أو المحتوى..."
                  className="w-full min-h-[200px] px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الصوت</CardTitle>
              <CardDescription>تفاصيل الملف الصوتي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="audioFile">رفع ملف صوتي *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="audioUrl"
                    value={formData.audioUrl}
                    onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={openAudioUploadModal}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {formData.audioUrl && (
                  <audio controls className="w-full mt-2">
                    <source src={formData.audioUrl} />
                  </audio>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audioDuration">المدة (بالثواني) *</Label>
                  <Input
                    id="audioDuration"
                    type="number"
                    value={formData.audioDuration}
                    onChange={(e) => handleInputChange('audioDuration', parseInt(e.target.value) || 0)}
                    placeholder="180"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="audioFileSize">حجم الملف (بالبايت) *</Label>
                  <Input
                    id="audioFileSize"
                    type="number"
                    value={formData.audioFileSize}
                    onChange={(e) => handleInputChange('audioFileSize', parseInt(e.target.value) || 0)}
                    placeholder="2048000"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reciterName">اسم القارئ/المنشد</Label>
                <Input
                  id="reciterName"
                  value={formData.reciterName}
                  onChange={(e) => handleInputChange('reciterName', e.target.value)}
                  placeholder="مشاري العفاسي"
                />
              </div>

              <div>
                <Label htmlFor="thumbnailFile">صورة مصغرة</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={openImageUploadModal}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {formData.thumbnailUrl && (
                  <img 
                    src={formData.thumbnailUrl} 
                    alt="Preview" 
                    className="mt-2 w-full max-w-xs rounded border"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>تحسين محركات البحث (SEO)</CardTitle>
              <CardDescription>إعدادات SEO للمنشور</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">عنوان SEO</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="دعاء الصباح - أذكار الصباح"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">وصف SEO</Label>
                <textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="دعاء الصباح المأثور..."
                  className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>

              <div>
                <Label htmlFor="seoKeywords">الكلمات المفتاحية</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
                  placeholder="دعاء الصباح, أذكار, إسلام"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hidden submit button */}
        <button
          id="submit-form"
          type="submit"
          className="hidden"
          disabled={loading}
        />
      </form>

      {/* Media Upload Modals */}
      <MediaUploadModal
        isOpen={showAudioUploadModal}
        onClose={() => {
          setShowAudioUploadModal(false)
          setSuggestedAudioFileName('')
          setSelectedAudioFile(null)
        }}
        onUploadComplete={handleAudioUploadComplete}
        acceptedFileTypes="audio/*"
        title="رفع ملف صوتي"
        description="اختر طريقة الرفع المناسبة (محلي أو سحابي)"
        suggestedFileName={suggestedAudioFileName}
      />

      <MediaUploadModal
        isOpen={showImageUploadModal}
        onClose={() => {
          setShowImageUploadModal(false)
          setSuggestedImageFileName('')
          setSelectedImageFile(null)
        }}
        onUploadComplete={handleImageUploadComplete}
        acceptedFileTypes="image/*"
        title="رفع صورة مصغرة"
        description="اختر طريقة الرفع المناسبة (محلي أو سحابي)"
        suggestedFileName={suggestedImageFileName}
      />
    </div>
  )
}

