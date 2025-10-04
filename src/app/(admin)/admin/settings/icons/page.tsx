'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, Plus, Trash2, Image as ImageIcon, Search } from 'lucide-react'
import { IconsSettings, Icon } from '@/types/settings.types'

export default function IconsSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [settings, setSettings] = useState<IconsSettings>({
    icons: [],
    defaultIcon: '📿',
    moreIcon: '➕'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=icons')
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

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'icons', data: settings })
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

  const addIcon = () => {
    const newIcon: Icon = {
      id: `icon-${Date.now()}`,
      name: '',
      emoji: '',
      imageUrl: '',
      category: 'general',
      isActive: true
    }

    setSettings({
      ...settings,
      icons: [...settings.icons, newIcon]
    })
  }

  const updateIcon = (index: number, field: keyof Icon, value: any) => {
    const updatedIcons = [...settings.icons]
    updatedIcons[index] = {
      ...updatedIcons[index],
      [field]: value
    }

    setSettings({
      ...settings,
      icons: updatedIcons
    })
  }

  const deleteIcon = (index: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الأيقونة؟')) return

    setSettings({
      ...settings,
      icons: settings.icons.filter((_, i) => i !== index)
    })
  }

  const filteredIcons = settings.icons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/settings">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الأيقونات</h1>
            <p className="text-gray-600 mt-1">إضافة وإدارة الأيقونات المخصصة</p>
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

      {/* Default Icons */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">الأيقونات الافتراضية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="defaultIcon">الأيقونة الافتراضية</Label>
            <div className="flex gap-2 mt-2">
              <div className="w-14 h-14 border-2 border-gray-200 rounded-xl flex items-center justify-center text-3xl">
                {settings.defaultIcon}
              </div>
              <Input
                id="defaultIcon"
                value={settings.defaultIcon}
                onChange={(e) => setSettings({ ...settings, defaultIcon: e.target.value })}
                placeholder="📿"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">تُستخدم عند عدم تحديد أيقونة</p>
          </div>

          <div>
            <Label htmlFor="moreIcon">أيقونة المزيد</Label>
            <div className="flex gap-2 mt-2">
              <div className="w-14 h-14 border-2 border-gray-200 rounded-xl flex items-center justify-center text-3xl">
                {settings.moreIcon}
              </div>
              <Input
                id="moreIcon"
                value={settings.moreIcon}
                onChange={(e) => setSettings({ ...settings, moreIcon: e.target.value })}
                placeholder="➕"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">تُستخدم لزر "المزيد"</p>
          </div>
        </div>
      </Card>

      {/* Icons Library */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">مكتبة الأيقونات</h2>
          <Button type="button" onClick={addIcon} size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
            <Plus className="h-4 w-4 ml-1" />
            إضافة أيقونة
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن أيقونة..."
              className="pr-10"
            />
          </div>
        </div>

        {filteredIcons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">لم يتم إضافة أيقونات بعد</p>
            <Button type="button" onClick={addIcon} variant="outline">
              <Plus className="h-4 w-4 ml-2" />
              إضافة أيقونة جديدة
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIcons.map((icon, index) => (
              <Card key={icon.id} className="p-4 bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Icon Preview */}
                  <div className="shrink-0">
                    <div className="w-16 h-16 border-2 border-gray-200 rounded-xl flex items-center justify-center bg-white">
                      {icon.emoji ? (
                        <span className="text-3xl">{icon.emoji}</span>
                      ) : icon.imageUrl ? (
                        <img
                          src={icon.imageUrl}
                          alt={icon.name}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Icon Fields */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">اسم الأيقونة</Label>
                        <Input
                          value={icon.name}
                          onChange={(e) => updateIcon(index, 'name', e.target.value)}
                          placeholder="مثال: أذكار الصباح"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">التصنيف</Label>
                        <select
                          value={icon.category}
                          onChange={(e) => updateIcon(index, 'category', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        >
                          <option value="general">عام</option>
                          <option value="prayer">صلاة</option>
                          <option value="morning">صباح</option>
                          <option value="evening">مساء</option>
                          <option value="quran">قرآن</option>
                          <option value="other">أخرى</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Emoji</Label>
                        <Input
                          value={icon.emoji}
                          onChange={(e) => updateIcon(index, 'emoji', e.target.value)}
                          placeholder="🕌"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">رابط الصورة (اختياري)</Label>
                        <Input
                          value={icon.imageUrl}
                          onChange={(e) => updateIcon(index, 'imageUrl', e.target.value)}
                          placeholder="https://example.com/icon.png"
                          className="mt-1"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`active-${icon.id}`}
                        checked={icon.isActive}
                        onChange={(e) => updateIcon(index, 'isActive', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`active-${icon.id}`} className="text-sm cursor-pointer">
                        تفعيل الأيقونة
                      </Label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => deleteIcon(index)}
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

      {/* Emoji Picker Tip */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">💡 نصيحة</h3>
        <p className="text-sm text-blue-800">
          للحصول على Emoji، استخدم لوحة المفاتيح:
          <br />
          <strong>Windows:</strong> اضغط <kbd className="px-2 py-1 bg-white rounded border">Win + .</kbd>
          <br />
          <strong>Mac:</strong> اضغط <kbd className="px-2 py-1 bg-white rounded border">Cmd + Ctrl + Space</kbd>
        </p>
      </Card>
    </div>
  )
}

