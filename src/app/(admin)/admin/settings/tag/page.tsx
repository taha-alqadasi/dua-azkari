'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, Eye, EyeOff, Search, X, Check } from 'lucide-react'
import { TagPageSettings } from '@/types/settings.types'

interface Tag {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

export default function TagSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'display' | 'mostUsed' | 'allTags' | 'detailed' | 'seo' | 'ads'>('display')
  
  // جلب قائمة الوسوم المتاحة
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  const [settings, setSettings] = useState<TagPageSettings>({
    seo: {
      title: 'جميع الوسوم - دعاء أذكاري',
      description: 'استكشف جميع وسوم الأدعية والأذكار الإسلامية المصنفة حسب الموضوعات',
      keywords: 'وسوم, أدعية, أذكار, تصنيفات إسلامية',
      ogImage: ''
    },
    postsPerPage: 12,
    showDescription: true,
    showPostCount: true,
    mostUsedTags: {
      show: true,
      title: 'الوسوم الأكثر استخداماً',
      count: 8,
      sortBy: 'usage',
      layout: 'grid',
      manualSelection: false,
      selectedTagIds: []
    },
    allTags: {
      show: true,
      title: 'جميع الوسوم',
      count: 50,
      groupByLetter: true,
      showEmptyLetters: false,
      layout: 'alphabetical',
      manualSelection: false,
      selectedTagIds: []
    },
    detailedView: {
      show: true,
      title: 'عرض تفصيلي',
      count: 20,
      showIcon: true,
      showStats: true,
      showRelatedTags: true,
      relatedTagsCount: 5,
      cardStyle: 'detailed',
      layout: 'grid',
      manualSelection: false,
      selectedTagIds: []
    },
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      customAds: []
    }
  })

  useEffect(() => {
    fetchSettings()
    fetchTags()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      setFilteredTags(allTags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    } else {
      setFilteredTags(allTags)
    }
  }, [searchQuery, allTags])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const result = await response.json()
      if (result.success) {
        setAllTags(result.data)
        setFilteredTags(result.data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=tagPage')
      const result = await response.json()

      if (result.success && result.data) {
        const defaultSettings = {
          seo: {
            title: 'جميع الوسوم - دعاء أذكاري',
            description: 'استكشف جميع وسوم الأدعية والأذكار الإسلامية المصنفة حسب الموضوعات',
            keywords: 'وسوم, أدعية, أذكار, تصنيفات إسلامية',
            ogImage: ''
          },
          postsPerPage: 12,
          showDescription: true,
          showPostCount: true,
          mostUsedTags: {
            show: true,
            title: 'الوسوم الأكثر استخداماً',
            count: 8,
            sortBy: 'usage' as const,
            layout: 'grid' as const,
            manualSelection: false,
            selectedTagIds: []
          },
          allTags: {
            show: true,
            title: 'جميع الوسوم',
            count: 50,
            groupByLetter: true,
            showEmptyLetters: false,
            layout: 'alphabetical' as const,
            manualSelection: false,
            selectedTagIds: []
          },
          detailedView: {
            show: true,
            title: 'عرض تفصيلي',
            count: 20,
            showIcon: true,
            showStats: true,
            showRelatedTags: true,
            relatedTagsCount: 5,
            cardStyle: 'detailed' as const,
            layout: 'grid' as const,
            manualSelection: false,
            selectedTagIds: []
          },
          ads: {
            enabled: false,
            publisherId: '',
            headerAd: { enabled: false, code: '' },
            footerAd: { enabled: false, code: '' },
            sidebarAd: { enabled: false, code: '' },
            customAds: []
          }
        }

        // دمج عميق للإعدادات للتأكد من وجود جميع الخصائص
        setSettings({
          seo: { ...defaultSettings.seo, ...(result.data.seo || {}) },
          postsPerPage: result.data.postsPerPage ?? defaultSettings.postsPerPage,
          showDescription: result.data.showDescription ?? defaultSettings.showDescription,
          showPostCount: result.data.showPostCount ?? defaultSettings.showPostCount,
          mostUsedTags: {
            ...defaultSettings.mostUsedTags,
            ...(result.data.mostUsedTags || {}),
            selectedTagIds: result.data.mostUsedTags?.selectedTagIds || []
          },
          allTags: {
            ...defaultSettings.allTags,
            ...(result.data.allTags || {}),
            selectedTagIds: result.data.allTags?.selectedTagIds || []
          },
          detailedView: {
            ...defaultSettings.detailedView,
            ...(result.data.detailedView || {}),
            selectedTagIds: result.data.detailedView?.selectedTagIds || []
          },
          ads: { ...defaultSettings.ads, ...(result.data.ads || {}) }
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'فشل في جلب الإعدادات' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'tagPage', data: settings })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح - سيتم تطبيق التغييرات خلال 5 ثواني' })
        
        // إعادة تحميل الصفحة بعد 2 ثانية لإلغاء الكاش
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل في حفظ الإعدادات' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const toggleTagSelection = (tagId: string) => {
    const selected = settings.mostUsedTags.selectedTagIds || []
    const newSelected = selected.includes(tagId)
      ? selected.filter(id => id !== tagId)
      : [...selected, tagId]
    
    setSettings({
      ...settings,
      mostUsedTags: {
        ...settings.mostUsedTags,
        selectedTagIds: newSelected
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'display', label: 'طريقة العرض' },
    { id: 'mostUsed', label: 'الأكثر استخداماً' },
    { id: 'allTags', label: 'جميع الوسوم' },
    { id: 'detailed', label: 'عرض تفصيلي' },
    { id: 'seo', label: 'SEO' },
    { id: 'ads', label: 'الإعلانات' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/settings">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إعدادات صفحة الوسوم</h1>
            <p className="text-gray-600 mt-1">تخصيص صفحة عرض الوسوم والفئات</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600">
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>

      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Tabs - من اليمين لليسار */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 justify-end flex-row-reverse">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* طريقة العرض */}
      {activeTab === 'display' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">إعدادات العرض العامة</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="postsPerPage">عدد المقاطع لكل صفحة</Label>
                <Input
                  id="postsPerPage"
                  type="number"
                  min={6}
                  max={50}
                  value={settings.postsPerPage}
                  onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value) || 12 })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showDescription"
                  checked={settings.showDescription}
                  onChange={(e) => setSettings({ ...settings, showDescription: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="showDescription" className="cursor-pointer">عرض الوصف</Label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showPostCount"
                  checked={settings.showPostCount}
                  onChange={(e) => setSettings({ ...settings, showPostCount: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="showPostCount" className="cursor-pointer">عرض عدد المقاطع</Label>
              </div>
            </div>

            {/* إظهار/إخفاء الأقسام */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4">التحكم في عرض الأقسام</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">الوسوم الأكثر استخداماً</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSettings({
                        ...settings,
                        mostUsedTags: { ...settings.mostUsedTags, show: !settings.mostUsedTags.show }
                      })}
                    >
                      {settings.mostUsedTags.show ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {settings.mostUsedTags.show ? 'مفعّل' : 'معطّل'}
                  </p>
                </Card>

                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">جميع الوسوم</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSettings({
                        ...settings,
                        allTags: { ...settings.allTags, show: !settings.allTags.show }
                      })}
                    >
                      {settings.allTags.show ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {settings.allTags.show ? 'مفعّل' : 'معطّل'}
                  </p>
                </Card>

                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">العرض التفصيلي</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSettings({
                        ...settings,
                        detailedView: { ...settings.detailedView, show: !settings.detailedView.show }
                      })}
                    >
                      {settings.detailedView.show ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {settings.detailedView.show ? 'مفعّل' : 'معطّل'}
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* الوسوم الأكثر استخداماً */}
      {activeTab === 'mostUsed' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">الوسوم الأكثر استخداماً</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="mostUsedTitle">عنوان القسم</Label>
              <Input
                id="mostUsedTitle"
                value={settings.mostUsedTags.title}
                onChange={(e) => setSettings({
                  ...settings,
                  mostUsedTags: { ...settings.mostUsedTags, title: e.target.value }
                })}
                className="mt-2"
              />
            </div>

            {/* اختيار يدوي أو تلقائي */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="manualSelection"
                  checked={settings.mostUsedTags.manualSelection}
                  onChange={(e) => setSettings({
                    ...settings,
                    mostUsedTags: { ...settings.mostUsedTags, manualSelection: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="manualSelection" className="cursor-pointer font-medium">
                  اختيار الوسوم يدوياً
                </Label>
              </div>
              <p className="text-sm text-gray-600">
                {settings.mostUsedTags.manualSelection 
                  ? 'اختر الوسوم التي تريد عرضها بشكل يدوي' 
                  : 'سيتم عرض الوسوم الأكثر استخداماً تلقائياً'}
              </p>
            </div>

            {!settings.mostUsedTags.manualSelection && (
              <div>
                <Label htmlFor="mostUsedCount">عدد الوسوم المعروضة</Label>
                <Input
                  id="mostUsedCount"
                  type="number"
                  min={3}
                  max={20}
                  value={settings.mostUsedTags.count}
                  onChange={(e) => setSettings({
                    ...settings,
                    mostUsedTags: { ...settings.mostUsedTags, count: parseInt(e.target.value) || 8 }
                  })}
                  className="mt-2"
                />
              </div>
            )}

            {/* اختيار الوسوم يدوياً */}
            {settings.mostUsedTags.manualSelection && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label>اختر الوسوم المراد عرضها</Label>
                  <span className="text-sm text-gray-600">
                    تم اختيار {settings.mostUsedTags.selectedTagIds?.length || 0} وسم
                  </span>
                </div>

                {/* بحث */}
                <div className="relative mb-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن وسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* قائمة الوسوم */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredTags.map((tag) => {
                    const isSelected = (settings.mostUsedTags.selectedTagIds || []).includes(tag.id)
                    return (
                      <div
                        key={tag.id}
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border-2 border-primary' 
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium">{tag.name}</p>
                              <p className="text-xs text-gray-600">{tag._count.posts} مقطع</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="sortBy">الترتيب</Label>
                <select
                  id="sortBy"
                  value={settings.mostUsedTags.sortBy}
                  onChange={(e) => setSettings({
                    ...settings,
                    mostUsedTags: { ...settings.mostUsedTags, sortBy: e.target.value as any }
                  })}
                  className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                >
                  <option value="usage">الأكثر استخداماً</option>
                  <option value="name">الاسم</option>
                  <option value="recent">الأحدث</option>
                </select>
              </div>

              <div>
                <Label htmlFor="layout">نمط العرض</Label>
                <select
                  id="layout"
                  value={settings.mostUsedTags.layout}
                  onChange={(e) => setSettings({
                    ...settings,
                    mostUsedTags: { ...settings.mostUsedTags, layout: e.target.value as any }
                  })}
                  className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                >
                  <option value="grid">شبكة</option>
                  <option value="list">قائمة</option>
                  <option value="cloud">سحابة</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* جميع الوسوم */}
      {activeTab === 'allTags' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">جميع الوسوم</h2>
          <div className="space-y-6">
            {/* عنوان القسم */}
            <div>
              <Label htmlFor="allTagsTitle">عنوان القسم</Label>
              <Input
                id="allTagsTitle"
                value={settings.allTags.title}
                onChange={(e) => setSettings({
                  ...settings,
                  allTags: { ...settings.allTags, title: e.target.value }
                })}
                className="mt-2"
              />
            </div>

            {/* عدد الوسوم المعروضة */}
            <div>
              <Label htmlFor="allTagsCount">عدد الوسوم المعروضة</Label>
              <Input
                id="allTagsCount"
                type="number"
                min="1"
                max="100"
                value={settings.allTags.count}
                onChange={(e) => setSettings({
                  ...settings,
                  allTags: { ...settings.allTags, count: parseInt(e.target.value) || 50 }
                })}
                className="mt-2"
              />
            </div>

            {/* اختيار يدوي */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <input
                  type="checkbox"
                  id="allTagsManualSelection"
                  checked={settings.allTags.manualSelection}
                  onChange={(e) => setSettings({
                    ...settings,
                    allTags: { ...settings.allTags, manualSelection: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="allTagsManualSelection" className="cursor-pointer font-bold">
                  اختيار الوسوم يدوياً
                </Label>
              </div>

              {/* قائمة الوسوم للاختيار اليدوي */}
              {settings.allTags.manualSelection && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>اختر الوسوم المراد عرضها</Label>
                    <span className="text-sm text-gray-600">
                      تم اختيار {settings.allTags.selectedTagIds?.length || 0} وسم
                    </span>
                  </div>

                  {/* بحث */}
                  <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ابحث عن وسم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  {/* قائمة الوسوم */}
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                    {filteredTags.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">لا توجد وسوم</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredTags.map((tag) => (
                          <div key={tag.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`allTags-tag-${tag.id}`}
                              checked={settings.allTags.selectedTagIds?.includes(tag.id) || false}
                              onChange={(e) => {
                                const selected = settings.allTags.selectedTagIds || []
                                const newSelected = e.target.checked
                                  ? [...selected, tag.id]
                                  : selected.filter(id => id !== tag.id)
                                setSettings({
                                  ...settings,
                                  allTags: { ...settings.allTags, selectedTagIds: newSelected }
                                })
                              }}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`allTags-tag-${tag.id}`} className="cursor-pointer flex-1">
                              {tag.name} <span className="text-gray-500">({tag._count?.posts || 0})</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* خيارات إضافية */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="groupByLetter"
                  checked={settings.allTags.groupByLetter}
                  onChange={(e) => setSettings({
                    ...settings,
                    allTags: { ...settings.allTags, groupByLetter: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="groupByLetter" className="cursor-pointer">تجميع حسب الحرف</Label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showEmptyLetters"
                  checked={settings.allTags.showEmptyLetters}
                  onChange={(e) => setSettings({
                    ...settings,
                    allTags: { ...settings.allTags, showEmptyLetters: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="showEmptyLetters" className="cursor-pointer">عرض الحروف الفارغة</Label>
              </div>
            </div>

            {/* نمط العرض */}
            <div>
              <Label htmlFor="allTagsLayout">نمط العرض</Label>
              <select
                id="allTagsLayout"
                value={settings.allTags.layout}
                onChange={(e) => setSettings({
                  ...settings,
                  allTags: { ...settings.allTags, layout: e.target.value as any }
                })}
                className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
              >
                <option value="grid">شبكة</option>
                <option value="list">قائمة</option>
                <option value="alphabetical">أبجدي</option>
                <option value="cloud">سحابة</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* العرض التفصيلي */}
      {activeTab === 'detailed' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">إعدادات العرض التفصيلي</h2>
          <div className="space-y-6">
            {/* عنوان القسم */}
            <div>
              <Label htmlFor="detailedTitle">عنوان القسم</Label>
              <Input
                id="detailedTitle"
                value={settings.detailedView.title}
                onChange={(e) => setSettings({
                  ...settings,
                  detailedView: { ...settings.detailedView, title: e.target.value }
                })}
                className="mt-2"
              />
            </div>

            {/* عدد الوسوم المعروضة */}
            <div>
              <Label htmlFor="detailedCount">عدد الوسوم المعروضة</Label>
              <Input
                id="detailedCount"
                type="number"
                min="1"
                max="100"
                value={settings.detailedView.count}
                onChange={(e) => setSettings({
                  ...settings,
                  detailedView: { ...settings.detailedView, count: parseInt(e.target.value) || 20 }
                })}
                className="mt-2"
              />
            </div>

            {/* اختيار يدوي */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <input
                  type="checkbox"
                  id="detailedManualSelection"
                  checked={settings.detailedView.manualSelection}
                  onChange={(e) => setSettings({
                    ...settings,
                    detailedView: { ...settings.detailedView, manualSelection: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="detailedManualSelection" className="cursor-pointer font-bold">
                  اختيار الوسوم يدوياً
                </Label>
              </div>

              {/* قائمة الوسوم للاختيار اليدوي */}
              {settings.detailedView.manualSelection && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>اختر الوسوم المراد عرضها</Label>
                    <span className="text-sm text-gray-600">
                      تم اختيار {settings.detailedView.selectedTagIds?.length || 0} وسم
                    </span>
                  </div>

                  {/* بحث */}
                  <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ابحث عن وسم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  {/* قائمة الوسوم */}
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                    {filteredTags.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">لا توجد وسوم</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredTags.map((tag) => (
                          <div key={tag.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`detailed-tag-${tag.id}`}
                              checked={settings.detailedView.selectedTagIds?.includes(tag.id) || false}
                              onChange={(e) => {
                                const selected = settings.detailedView.selectedTagIds || []
                                const newSelected = e.target.checked
                                  ? [...selected, tag.id]
                                  : selected.filter(id => id !== tag.id)
                                setSettings({
                                  ...settings,
                                  detailedView: { ...settings.detailedView, selectedTagIds: newSelected }
                                })
                              }}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`detailed-tag-${tag.id}`} className="cursor-pointer flex-1">
                              {tag.name} <span className="text-gray-500">({tag._count?.posts || 0})</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* خيارات العرض */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showIcon"
                  checked={settings.detailedView.showIcon}
                  onChange={(e) => setSettings({
                    ...settings,
                    detailedView: { ...settings.detailedView, showIcon: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="showIcon" className="cursor-pointer">عرض الأيقونات</Label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showStats"
                  checked={settings.detailedView.showStats}
                  onChange={(e) => setSettings({
                    ...settings,
                    detailedView: { ...settings.detailedView, showStats: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="showStats" className="cursor-pointer">عرض الإحصائيات</Label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showRelatedTags"
                  checked={settings.detailedView.showRelatedTags}
                  onChange={(e) => setSettings({
                    ...settings,
                    detailedView: { ...settings.detailedView, showRelatedTags: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <Label htmlFor="showRelatedTags" className="cursor-pointer">عرض الوسوم ذات الصلة</Label>
              </div>
            </div>

            {/* إعدادات متقدمة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="relatedTagsCount">عدد الوسوم ذات الصلة</Label>
                <Input
                  id="relatedTagsCount"
                  type="number"
                  min={3}
                  max={10}
                  value={settings.detailedView.relatedTagsCount}
                  onChange={(e) => setSettings({
                    ...settings,
                    detailedView: { ...settings.detailedView, relatedTagsCount: parseInt(e.target.value) || 5 }
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="detailedLayout">نمط العرض</Label>
                <select
                  id="detailedLayout"
                  value={settings.detailedView.layout}
                  onChange={(e) => setSettings({
                    ...settings,
                    detailedView: { ...settings.detailedView, layout: e.target.value as any }
                  })}
                  className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                >
                  <option value="grid">شبكة</option>
                  <option value="list">قائمة</option>
                </select>
              </div>

              <div>
                <Label htmlFor="cardStyle">نمط البطاقة</Label>
                <select
                  id="cardStyle"
                  value={settings.detailedView.cardStyle}
                  onChange={(e) => setSettings({
                    ...settings,
                    detailedView: { ...settings.detailedView, cardStyle: e.target.value as any }
                  })}
                  className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                >
                  <option value="minimal">مبسطة</option>
                  <option value="detailed">تفصيلية</option>
                  <option value="compact">مدمجة</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SEO */}
      {activeTab === 'seo' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">إعدادات SEO</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="seoTitle">عنوان الصفحة (Title)</Label>
              <Input
                id="seoTitle"
                value={settings.seo.title}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, title: e.target.value }
                })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="seoDescription">وصف الصفحة (Description)</Label>
              <textarea
                id="seoDescription"
                value={settings.seo.description}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, description: e.target.value }
                })}
                rows={4}
                className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <Label htmlFor="seoKeywords">الكلمات المفتاحية (Keywords)</Label>
              <Input
                id="seoKeywords"
                value={settings.seo.keywords}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, keywords: e.target.value }
                })}
                className="mt-2"
                placeholder="وسوم, أدعية, أذكار, تصنيفات إسلامية"
              />
            </div>

            <div>
              <Label htmlFor="ogImage">صورة Open Graph</Label>
              <Input
                id="ogImage"
                type="url"
                value={settings.seo.ogImage}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, ogImage: e.target.value }
                })}
                className="mt-2"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </Card>
      )}

      {/* الإعلانات */}
      {activeTab === 'ads' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">إعدادات الإعلانات</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="adsEnabled"
                checked={settings.ads.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  ads: { ...settings.ads, enabled: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <Label htmlFor="adsEnabled" className="cursor-pointer">تفعيل الإعلانات</Label>
            </div>

            {settings.ads.enabled && (
              <>
                <div>
                  <Label htmlFor="publisherId">رقم الناشر (Publisher ID)</Label>
                  <Input
                    id="publisherId"
                    value={settings.ads.publisherId}
                    onChange={(e) => setSettings({
                      ...settings,
                      ads: { ...settings.ads, publisherId: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="headerAdEnabled"
                        checked={settings.ads.headerAd.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          ads: {
                            ...settings.ads,
                            headerAd: { ...settings.ads.headerAd, enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="headerAdEnabled" className="cursor-pointer font-medium">إعلان الهيدر</Label>
                    </div>
                    {settings.ads.headerAd.enabled && (
                      <textarea
                        value={settings.ads.headerAd.code}
                        onChange={(e) => setSettings({
                          ...settings,
                          ads: {
                            ...settings.ads,
                            headerAd: { ...settings.ads.headerAd, code: e.target.value }
                          }
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        placeholder="كود الإعلان"
                      />
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="footerAdEnabled"
                        checked={settings.ads.footerAd.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          ads: {
                            ...settings.ads,
                            footerAd: { ...settings.ads.footerAd, enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="footerAdEnabled" className="cursor-pointer font-medium">إعلان الفوتر</Label>
                    </div>
                    {settings.ads.footerAd.enabled && (
                      <textarea
                        value={settings.ads.footerAd.code}
                        onChange={(e) => setSettings({
                          ...settings,
                          ads: {
                            ...settings.ads,
                            footerAd: { ...settings.ads.footerAd, code: e.target.value }
                          }
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        placeholder="كود الإعلان"
                      />
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="sidebarAdEnabled"
                        checked={settings.ads.sidebarAd.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          ads: {
                            ...settings.ads,
                            sidebarAd: { ...settings.ads.sidebarAd, enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="sidebarAdEnabled" className="cursor-pointer font-medium">إعلان الشريط الجانبي</Label>
                    </div>
                    {settings.ads.sidebarAd.enabled && (
                      <textarea
                        value={settings.ads.sidebarAd.code}
                        onChange={(e) => setSettings({
                          ...settings,
                          ads: {
                            ...settings.ads,
                            sidebarAd: { ...settings.ads.sidebarAd, code: e.target.value }
                          }
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        placeholder="كود الإعلان"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
