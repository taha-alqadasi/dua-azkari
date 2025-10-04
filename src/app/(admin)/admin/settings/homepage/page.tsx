'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  ArrowRight,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react'
import { HomePageSettings, HomeBlock } from '@/types/settings.types'

export default function HomepageSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<HomePageSettings>({
    blocks: [],
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      customAds: []
    }
  })
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchSettings()
    fetchCategories()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=homePage')
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'فشل في جلب الإعدادات' })
    } finally {
      setLoading(false)
    }
  }

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
          group: 'homePage',
          data: settings
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
        setTimeout(() => setMessage(null), 3000)
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

  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين الإعدادات للقيم الافتراضية؟')) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group: 'homePage'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
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

  const addBlock = () => {
    const newBlock: HomeBlock = {
      id: `block-${Date.now()}`,
      title: '',
      categoryId: '',
      postsCount: 6,
      icon: '📿',
      blockColor: '#1e9e94',
      backgroundColor: '#ffffff',
      orderNumber: settings.blocks.length,
      isActive: true
    }

    setSettings({
      ...settings,
      blocks: [...settings.blocks, newBlock]
    })
  }

  const updateBlock = (index: number, field: keyof HomeBlock, value: any) => {
    const updatedBlocks = [...settings.blocks]
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      [field]: value
    }

    setSettings({
      ...settings,
      blocks: updatedBlocks
    })
  }

  const deleteBlock = (index: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا البلوك؟')) {
      return
    }

    const updatedBlocks = settings.blocks.filter((_, i) => i !== index)
    setSettings({
      ...settings,
      blocks: updatedBlocks
    })
  }

  const toggleBlockActive = (index: number) => {
    const updatedBlocks = [...settings.blocks]
    updatedBlocks[index].isActive = !updatedBlocks[index].isActive

    setSettings({
      ...settings,
      blocks: updatedBlocks
    })
  }

  const addCustomAd = () => {
    const newAd = {
      id: `ad-${Date.now()}`,
      name: '',
      position: '',
      code: '',
      enabled: true
    }

    setSettings({
      ...settings,
      ads: {
        ...settings.ads,
        customAds: [...settings.ads.customAds, newAd]
      }
    })
  }

  const updateCustomAd = (index: number, field: string, value: any) => {
    const updatedAds = [...settings.ads.customAds]
    updatedAds[index] = {
      ...updatedAds[index],
      [field]: value
    }

    setSettings({
      ...settings,
      ads: {
        ...settings.ads,
        customAds: updatedAds
      }
    })
  }

  const deleteCustomAd = (index: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      return
    }

    const updatedAds = settings.ads.customAds.filter((_, i) => i !== index)
    setSettings({
      ...settings,
      ads: {
        ...settings.ads,
        customAds: updatedAds
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
              إعدادات الصفحة الرئيسية
            </h1>
            <p className="text-gray-600 mt-1">
              تخصيص البلوكات في الصفحة الرئيسية
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

      {/* Message */}
      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Blocks Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            بلوكات الصفحة الرئيسية
          </h2>
          <Button
            type="button"
            onClick={addBlock}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة بلوك
          </Button>
        </div>

        {settings.blocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">لم يتم إضافة أي بلوكات بعد</p>
            <Button
              type="button"
              onClick={addBlock}
              variant="outline"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة بلوك جديد
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.blocks.map((block, index) => (
              <Card
                key={block.id}
                className={`p-5 ${!block.isActive ? 'opacity-50 bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className="cursor-move text-gray-400 hover:text-gray-600 mt-2">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Block Content */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* عنوان البلوك */}
                      <div>
                        <Label>عنوان البلوك</Label>
                        <Input
                          value={block.title}
                          onChange={(e) => updateBlock(index, 'title', e.target.value)}
                          placeholder="مثال: أذكار الصباح"
                          className="mt-2"
                        />
                      </div>

                      {/* اختيار القسم */}
                      <div>
                        <Label>القسم</Label>
                        <select
                          value={block.categoryId}
                          onChange={(e) => updateBlock(index, 'categoryId', e.target.value)}
                          className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                        >
                          <option value="">اختر القسم</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nameAr}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* عدد الأذكار */}
                      <div>
                        <Label>عدد الأذكار</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={block.postsCount}
                          onChange={(e) => updateBlock(index, 'postsCount', parseInt(e.target.value) || 6)}
                          className="mt-2"
                        />
                      </div>

                      {/* الأيقونة */}
                      <div>
                        <Label>الأيقونة (Emoji)</Label>
                        <Input
                          value={block.icon}
                          onChange={(e) => updateBlock(index, 'icon', e.target.value)}
                          placeholder="📿"
                          className="mt-2"
                        />
                      </div>

                      {/* لون البلوك */}
                      <div>
                        <Label>لون البلوك</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={block.blockColor}
                            onChange={(e) => updateBlock(index, 'blockColor', e.target.value)}
                            className="w-20 h-11 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={block.blockColor}
                            onChange={(e) => updateBlock(index, 'blockColor', e.target.value)}
                            placeholder="#1e9e94"
                            className="flex-1"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* لون خلفية البلوك */}
                      <div>
                        <Label>لون خلفية البلوك</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={block.backgroundColor}
                            onChange={(e) => updateBlock(index, 'backgroundColor', e.target.value)}
                            className="w-20 h-11 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={block.backgroundColor}
                            onChange={(e) => updateBlock(index, 'backgroundColor', e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleBlockActive(index)}
                      title={block.isActive ? 'إخفاء' : 'إظهار'}
                    >
                      {block.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => deleteBlock(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* إشعار بنقل الإعلانات */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📢</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              إعدادات الإعلانات انتقلت!
            </h2>
            <p className="text-gray-700 mb-4">
              تم نقل جميع إعدادات الإعلانات إلى صفحة مخصصة ومتقدمة مع نظام Lazy Loading ذكي
            </p>
            <Link href="/admin/settings/ads">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                انتقل إلى إعدادات الإعلانات
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Submit Button (Mobile) */}
      <div className="md:hidden">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
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
  )
}

