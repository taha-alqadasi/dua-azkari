'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save, 
  ArrowLeft, 
  Eye,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { PageTemplateSelector } from './PageTemplateSelector'
import type { PageTemplate } from '@/types/page-schemas'
import FAQBuilder, { type FAQItem } from './FAQBuilder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Settings, Search, HelpCircle } from 'lucide-react'

// تحميل CKEditor بشكل كسول (lazy loading)
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] border border-input rounded-md flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
})

interface PageFormData {
  titleAr: string
  titleEn: string
  slug: string
  content: string
  template: PageTemplate
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  faqItems: FAQItem[]
}

interface PageFormProps {
  pageId?: string
  initialData?: Partial<PageFormData>
}

export default function PageForm({ pageId, initialData }: PageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Parse FAQ items if template is faq
  const parseFAQItems = (content: string, template: string): FAQItem[] => {
    if (template === 'faq' && content) {
      try {
        const parsed = JSON.parse(content)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }
  
  const [formData, setFormData] = useState<PageFormData>({
    titleAr: '',
    titleEn: '',
    slug: '',
    content: '',
    template: 'default',
    status: 'DRAFT',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    faqItems: [],
    ...initialData,
    faqItems: parseFAQItems(initialData?.content || '', initialData?.template || 'default')
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // إنشاء slug تلقائياً من العنوان العربي
    if (field === 'titleAr' && !pageId) {
      const slug = generateSlug(value)
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation based on template
    if (!formData.titleAr || !formData.slug) {
      alert('يرجى ملء الحقول المطلوبة: العنوان العربي والرابط المختصر')
      return
    }

    if (formData.template === 'faq') {
      if (formData.faqItems.length === 0) {
        alert('يرجى إضافة سؤال واحد على الأقل')
        return
      }
      // Validate FAQ items
      const hasInvalidItem = formData.faqItems.some(item => !item.question.trim() || !item.answer.trim())
      if (hasInvalidItem) {
        alert('يرجى التأكد من ملء جميع الأسئلة والأجوبة')
        return
      }
    } else {
      if (!formData.content) {
        alert('يرجى ملء محتوى الصفحة')
        return
      }
    }

    setLoading(true)

    try {
      const url = pageId ? `/api/pages/${pageId}` : '/api/pages'
      const method = pageId ? 'PUT' : 'POST'

      // Prepare data for submission
      const submitData = { ...formData }
      
      // If FAQ template, convert faqItems to JSON string in content
      if (formData.template === 'faq') {
        submitData.content = JSON.stringify(formData.faqItems)
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/pages')
        router.refresh()
      } else {
        alert(data.error || 'حدث خطأ أثناء حفظ الصفحة')
      }
    } catch (error) {
      console.error('خطأ في حفظ الصفحة:', error)
      alert('حدث خطأ أثناء حفظ الصفحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للصفحات
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {pageId ? 'تعديل الصفحة' : 'إضافة صفحة جديدة'}
            </h1>
            <p className="text-muted-foreground">
              {pageId ? 'تعديل بيانات الصفحة' : 'إنشاء صفحة ثابتة جديدة'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData(prev => ({ ...prev, status: 'DRAFT' }))
              setTimeout(() => document.getElementById('submit-form')?.click(), 100)
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            حفظ كمسودة
          </Button>
          
          <Button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, status: 'PUBLISHED' }))
              setTimeout(() => document.getElementById('submit-form')?.click(), 100)
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              pageId ? <Save className="ml-2 h-4 w-4" /> : <Eye className="ml-2 h-4 w-4" />
            )}
            {pageId ? 'حفظ التعديلات' : 'نشر'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Template Selector First */}
        <div className="lg:order-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>نوع الصفحة</CardTitle>
              <CardDescription>اختر نوع الصفحة والتنسيق المناسب</CardDescription>
            </CardHeader>
            <CardContent>
              <PageTemplateSelector
                value={formData.template}
                onChange={(template) => setFormData(prev => ({ ...prev, template }))}
                disabled={!!pageId}
              />
              {pageId && (
                <p className="text-xs text-amber-600 mt-3 p-2 bg-amber-50 rounded-md border border-amber-200">
                  ⚠️ لا يمكن تغيير نوع الصفحة بعد الإنشاء
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 lg:order-1 space-y-6">
          <Tabs defaultValue="content" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Settings className="h-4 w-4" />
                الإعدادات
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Search className="h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-background">
                {formData.template === 'faq' ? <HelpCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                المحتوى
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الأساسية</CardTitle>
                  <CardDescription>المعلومات الأساسية للصفحة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="titleAr">العنوان العربي *</Label>
                      <Input
                        id="titleAr"
                        value={formData.titleAr}
                        onChange={(e) => handleInputChange('titleAr', e.target.value)}
                        placeholder="من نحن"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="titleEn">العنوان الإنجليزي</Label>
                      <Input
                        id="titleEn"
                        value={formData.titleEn}
                        onChange={(e) => handleInputChange('titleEn', e.target.value)}
                        placeholder="About Us"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slug">الرابط المختصر * (يتم إنشاؤه تلقائياً)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="about-us"
                      required
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      يتم إنشاؤه تلقائياً من العنوان العربي، ويمكنك تعديله
                    </p>
                  </div>

                  {/* FAQ Builder or Rich Text Editor based on template */}
                  {formData.template === 'faq' ? (
                    <div>
                      <FAQBuilder
                        value={formData.faqItems}
                        onChange={(items) => setFormData(prev => ({ ...prev, faqItems: items }))}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="content">محتوى الصفحة *</Label>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(data) => handleInputChange('content', data)}
                        placeholder="اكتب محتوى الصفحة هنا..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        استخدم المحرر النصي لتنسيق المحتوى بشكل احترافي
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>تحسين محركات البحث (SEO)</CardTitle>
                  <CardDescription>إعدادات SEO للصفحة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">عنوان SEO</Label>
                    <Input
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      placeholder="من نحن - دعاء أذكاري"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">وصف SEO</Label>
                    <textarea
                      id="seoDescription"
                      value={formData.seoDescription}
                      onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                      placeholder="معلومات عن منصة دعاء أذكاري..."
                      className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoKeywords">كلمات مفتاحية (SEO)</Label>
                    <Input
                      id="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
                      placeholder="من نحن, عن الموقع, دعاء أذكاري"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      افصل الكلمات المفتاحية بفاصلة (,)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات</CardTitle>
                  <CardDescription>إعدادات إضافية للصفحة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">حالة الصفحة</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm mt-2"
                    >
                      <option value="DRAFT">مسودة</option>
                      <option value="PUBLISHED">منشورة</option>
                      <option value="ARCHIVED">مؤرشفة</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hidden submit button */}
        <button
          id="submit-form"
          type="submit"
          className="hidden"
          disabled={loading}
        />
      </form>
    </div>
  )
}

