'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import {
  ArrowRight,
  Save,
  RotateCcw,
  FolderOpen,
  Star,
  Heart,
  Bookmark,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react'
import { PostSettings, availableColors, availableIcons } from '@/types/post-settings.types'
import { v4 as uuidv4 } from 'uuid'

const iconComponents = {
  folder: FolderOpen,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  sparkles: Sparkles,
}

const displayStylesLabels = {
  compact: 'مدمج',
  card: 'بطاقات',
  detailed: 'تفصيلي'
}

export default function PostSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [settings, setSettings] = useState<PostSettings>({
    pageLayout: 'single-column', // القيمة الافتراضية
    relatedPostsCards: [{
      id: uuidv4(),
      enabled: true,
      title: 'ذات صلة',
      backgroundColor: 'from-purple-600 to-pink-600',
      icon: 'folder',
      displayMode: 'auto',
      selectedCategories: [],
      maxPosts: 10,
      showReciterName: true,
      showDuration: true,
      displayStyle: 'compact',
      columnsLayout: 'double',
      order: 0,
    }],
  })

  useEffect(() => {
    fetchSettings()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=post')
      const result = await response.json()

      if (result.success && result.data) {
        // التأكد من القيم الافتراضية
        if (!result.data.pageLayout) {
          result.data.pageLayout = 'single-column'
        }
        if (!result.data.relatedPostsCards || result.data.relatedPostsCards.length === 0) {
          result.data.relatedPostsCards = [{
            id: uuidv4(),
            enabled: true,
            title: 'ذات صلة',
            backgroundColor: 'from-purple-600 to-pink-600',
            icon: 'folder',
            displayMode: 'auto',
            maxPosts: 10,
            showReciterName: true,
            showDuration: true,
            displayStyle: 'compact',
            columnsLayout: 'double',
            order: 0,
          }]
        }
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Error fetching post settings:', error)
      setMessage({ type: 'error', text: 'فشل في جلب إعدادات المنشورات' })
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group: 'post',
          data: settings
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم حفظ إعدادات المنشورات بنجاح ✅' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل في حفظ الإعدادات' })
      }
    } catch (error) {
      console.error('Error saving post settings:', error)
      setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين إعدادات المنشورات إلى الافتراضي؟')) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group: 'post'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSettings({
          pageLayout: 'single-column',
          relatedPostsCards: [{
            id: uuidv4(),
            enabled: true,
            title: 'ذات صلة',
            backgroundColor: 'from-purple-600 to-pink-600',
            icon: 'folder',
            displayMode: 'auto',
            selectedCategories: [],
            maxPosts: 10,
            showReciterName: true,
            showDuration: true,
            displayStyle: 'compact',
            columnsLayout: 'double',
            order: 0,
          }],
        })
        setMessage({ type: 'success', text: 'تم إعادة تعيين الإعدادات بنجاح' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل في إعادة تعيين الإعدادات' })
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      setMessage({ type: 'error', text: 'فشل في إعادة تعيين الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const addNewCard = () => {
    setSettings(prev => ({
      ...prev,
      relatedPostsCards: [...prev.relatedPostsCards, {
        id: uuidv4(),
        enabled: true,
        title: 'ذات صلة',
        backgroundColor: 'from-blue-600 to-cyan-600',
        icon: 'star',
        displayMode: 'auto',
        selectedCategories: [],
        maxPosts: 10,
        showReciterName: true,
        showDuration: true,
        displayStyle: 'compact',
        columnsLayout: 'double',
        order: prev.relatedPostsCards.length,
      }]
    }))
  }

  const updateCard = (index: number, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      relatedPostsCards: prev.relatedPostsCards.map((card, idx) => 
        idx === index ? { ...card, [field]: value } : card
      )
    }))
  }

  const deleteCard = (index: number) => {
    if (settings.relatedPostsCards.length === 1) {
      alert('لا يمكن حذف البطاقة الأخيرة!')
      return
    }
    if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟')) {
      return
    }
    setSettings(prev => ({
      ...prev,
      relatedPostsCards: prev.relatedPostsCards.filter((_, idx) => idx !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل إعدادات المنشورات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/settings">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              إعدادات صفحة المقال
            </h1>
            <p className="text-gray-600 mt-1">
              تخصيص بطاقات المنشورات ذات الصلة
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 ml-2" />
            إعادة التعيين
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Page Layout Settings - منفصل */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
          تخطيط صفحة المقال
        </h2>
        <div className="space-y-4">
          <Label htmlFor="pageLayout" className="text-base font-semibold">اختر تخطيط الصفحة</Label>
          <Select
            value={settings.pageLayout}
            onValueChange={(value: 'single-column' | 'two-columns') => setSettings(prev => ({ ...prev, pageLayout: value }))}
          >
            <SelectTrigger id="pageLayout" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-column">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border-2 border-gray-400 rounded"></div>
                  <span>عمود واحد (المحتوى فقط)</span>
                </div>
              </SelectItem>
              <SelectItem value="two-columns">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-5 h-6 border-2 border-gray-400 rounded"></div>
                    <div className="w-3 h-6 border-2 border-gray-400 rounded"></div>
                  </div>
                  <span>عمودين (محتوى + عمود جانبي)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600 mt-2">
            {settings.pageLayout === 'single-column' 
              ? '📄 العرض بعمود واحد: المحتوى يأخذ العرض الكامل، والعناصر ذات الصلة تظهر في النهاية'
              : '📱 العرض بعمودين: المحتوى في الوسط + عمود جانبي للعناصر ذات الصلة (يتحول لعمود واحد على الموبايل)'
            }
          </p>

          {/* معاينة التخطيط */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold mb-3 text-gray-700">معاينة التخطيط:</p>
            {settings.pageLayout === 'single-column' ? (
              <div className="bg-white p-4 rounded border-2 border-gray-300">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded mb-2 flex items-center justify-center text-sm text-gray-700">
                  المحتوى الكامل
                </div>
                <div className="h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded flex items-center justify-center text-sm text-gray-700">
                  العناصر ذات الصلة (في النهاية)
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded border-2 border-gray-300 flex gap-3">
                <div className="flex-1 h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center text-sm text-gray-700">
                  المحتوى
                </div>
                <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded flex items-center justify-center text-sm text-gray-700 text-center">
                  Sidebar<br/>ذات صلة
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Related Posts Cards Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            بطاقات "ذات صلة"
          </h2>
          <Button onClick={addNewCard} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 ml-2" />
            إضافة بطاقة جديدة
          </Button>
        </div>

        <div className="space-y-6">
          {settings.relatedPostsCards.map((card, index) => {
            const IconComponent = iconComponents[card.icon]
            
            return (
              <Card key={card.id} className="p-5 border-2 border-gray-100 relative">
                <div className="absolute top-3 left-3 text-gray-400 text-xs flex items-center gap-2">
                  <GripVertical className="h-4 w-4" />
                  <span>#{index + 1}</span>
                </div>
                
                <div className="flex justify-end mb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCard(index)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    title="حذف البطاقة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor={`enabled-${card.id}`} className="text-base font-semibold">تفعيل هذه البطاقة</Label>
                    <Switch
                      id={`enabled-${card.id}`}
                      checked={card.enabled}
                      onCheckedChange={(checked) => updateCard(index, 'enabled', checked)}
                    />
                  </div>

                  {card.enabled && (
                    <>
                      {/* Title */}
                      <div>
                        <Label htmlFor={`title-${card.id}`}>عنوان البطاقة</Label>
                        <Input
                          id={`title-${card.id}`}
                          value={card.title}
                          onChange={(e) => updateCard(index, 'title', e.target.value)}
                          placeholder="ذات صلة"
                          className="mt-2"
                        />
                      </div>

                      {/* Display Style & Columns Layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`displayStyle-${card.id}`}>نمط العرض</Label>
                          <Select
                            value={card.displayStyle}
                            onValueChange={(value: 'compact' | 'card' | 'detailed') => updateCard(index, 'displayStyle', value)}
                          >
                            <SelectTrigger id={`displayStyle-${card.id}`} className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="compact">مدمج (Compact)</SelectItem>
                              <SelectItem value="card">بطاقات (Card)</SelectItem>
                              <SelectItem value="detailed">تفصيلي (Detailed)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`columnsLayout-${card.id}`}>تخطيط الأعمدة</Label>
                          <Select
                            value={card.columnsLayout}
                            onValueChange={(value: 'single' | 'double') => updateCard(index, 'columnsLayout', value)}
                          >
                            <SelectTrigger id={`columnsLayout-${card.id}`} className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">عمود واحد</SelectItem>
                              <SelectItem value="double">عمودين</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Background Color */}
                      <div>
                        <Label htmlFor={`bgColor-${card.id}`}>لون خلفية البطاقة</Label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {availableColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => updateCard(index, 'backgroundColor', color.value)}
                              className={`relative p-4 rounded-lg border-2 transition-all ${
                                card.backgroundColor === color.value
                                  ? 'border-primary shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`h-12 rounded-md ${color.preview} mb-2`}></div>
                              <p className="text-xs text-gray-700 font-medium text-center">{color.label}</p>
                              {card.backgroundColor === color.value && (
                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Icon */}
                      <div>
                        <Label htmlFor={`icon-${card.id}`}>أيقونة البطاقة</Label>
                        <div className="mt-2 grid grid-cols-5 gap-2">
                          {availableIcons.map((icon) => {
                            const Icon = iconComponents[icon.value as keyof typeof iconComponents]
                            return (
                              <button
                                key={icon.value}
                                type="button"
                                onClick={() => updateCard(index, 'icon', icon.value as any)}
                                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                                  card.icon === icon.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                title={icon.label}
                              >
                                <Icon className="h-6 w-6" />
                                <span className="text-xs">{icon.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Display Mode */}
                      <div>
                        <Label htmlFor={`displayMode-${card.id}`}>وضع العرض</Label>
                        <Select
                          value={card.displayMode}
                          onValueChange={(value: 'auto' | 'manual') => {
                            updateCard(index, 'displayMode', value)
                            // إعادة تعيين الأقسام المختارة عند التغيير
                            if (value === 'auto') {
                              updateCard(index, 'selectedCategories', [])
                            }
                          }}
                        >
                          <SelectTrigger id={`displayMode-${card.id}`} className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">تلقائي (من نفس القسم)</SelectItem>
                            <SelectItem value="manual">يدوي (اختيار أقسام محددة)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-1">
                          {card.displayMode === 'auto'
                            ? 'سيتم عرض المنشورات من نفس قسم المقال تلقائياً'
                            : 'اختر قسماً أو قسمين محددين لجلب المنشورات منها'}
                        </p>
                      </div>

                      {/* Manual Category Selection */}
                      {card.displayMode === 'manual' && (
                        <div>
                          <Label>اختيار الأقسام (حد أقصى 2)</Label>
                          <div className="mt-2 space-y-2">
                            {categories.map((category) => {
                              const isSelected = card.selectedCategories?.includes(category.id) || false
                              const canSelect = (card.selectedCategories?.length || 0) < 2 || isSelected
                              
                              return (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      // إزالة من القائمة
                                      updateCard(
                                        index,
                                        'selectedCategories',
                                        (card.selectedCategories || []).filter((id: string) => id !== category.id)
                                      )
                                    } else if (canSelect) {
                                      // إضافة للقائمة
                                      updateCard(
                                        index,
                                        'selectedCategories',
                                        [...(card.selectedCategories || []), category.id]
                                      )
                                    }
                                  }}
                                  disabled={!canSelect}
                                  className={`w-full p-3 rounded-lg border-2 transition-all text-right ${
                                    isSelected
                                      ? 'border-primary bg-primary/5'
                                      : canSelect
                                      ? 'border-gray-200 hover:border-gray-300'
                                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{category.nameAr}</span>
                                    {isSelected && (
                                      <div className="bg-primary text-white rounded-full p-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            تم اختيار {card.selectedCategories?.length || 0} من 2 أقسام كحد أقصى
                          </p>
                        </div>
                      )}

                      {/* Max Posts */}
                      <div>
                        <Label htmlFor={`maxPosts-${card.id}`}>عدد المنشورات الأقصى</Label>
                        <Input
                          id={`maxPosts-${card.id}`}
                          type="number"
                          min="1"
                          max="20"
                          value={card.maxPosts}
                          onChange={(e) => updateCard(index, 'maxPosts', parseInt(e.target.value) || 10)}
                          className="mt-2"
                        />
                      </div>

                      {/* Show Reciter Name & Duration */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`showReciterName-${card.id}`}>عرض اسم القارئ</Label>
                          <Switch
                            id={`showReciterName-${card.id}`}
                            checked={card.showReciterName}
                            onCheckedChange={(checked) => updateCard(index, 'showReciterName', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`showDuration-${card.id}`}>عرض مدة المقطع</Label>
                          <Switch
                            id={`showDuration-${card.id}`}
                            checked={card.showDuration}
                            onCheckedChange={(checked) => updateCard(index, 'showDuration', checked)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Preview */}
                {card.enabled && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-gray-900">معاينة</h3>
                    </div>
                    <div className={`bg-gradient-to-r ${card.backgroundColor} text-white p-3 rounded-t-lg`}>
                      <h4 className="font-bold flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {card.title}
                      </h4>
                    </div>
                    <div className={`p-2 bg-gray-50 rounded-b-lg ${card.columnsLayout === 'double' ? 'grid grid-cols-2' : 'grid grid-cols-1'} gap-2`}>
                      {[1, 2].slice(0, card.columnsLayout === 'single' ? 1 : 2).map((i) => (
                        <div key={i} className="bg-white p-3 rounded-lg flex items-center gap-2">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs text-primary">{i}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-1">عنوان تجريبي {i}</p>
                            {card.showReciterName && <p className="text-[10px] text-gray-600">القارئ</p>}
                          </div>
                          {card.showDuration && <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded-full">5:30</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
