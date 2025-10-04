'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, Plus, Trash2, Menu as MenuIcon, GripVertical, Lock } from 'lucide-react'
import { MenuSettings, MenuItem } from '@/types/settings.types'
import { usePermissions } from '@/hooks/use-permissions'
import { useSettings } from '@/contexts/SettingsContext'

export default function MenusSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'sidebar'>('header')
  const [settings, setSettings] = useState<MenuSettings>({
    headerMenu: [],
    footerMenu: [],
    sidebarMenu: []
  })

  // التحقق من الصلاحيات
  const { hasPermission, loading: permissionsLoading } = usePermissions()
  const canManageMenus = hasPermission('MANAGE_MENUS', 'menus')
  const canUpdate = hasPermission('UPDATE', 'settings')
  const canCreate = hasPermission('CREATE', 'settings')

  // لتحديث الإعدادات في Context
  const { refreshSettings } = useSettings()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=menus')
      const result = await response.json()

      if (result.success && result.data) {
        setSettings(result.data)
      } else {
        // إذا لم توجد بيانات، نستخدم قيم افتراضية فارغة
        setSettings({
          headerMenu: [],
          footerMenu: [],
          sidebarMenu: []
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
        body: JSON.stringify({ group: 'menus', data: settings })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
        // تحديث الإعدادات في Context لتطبيقها مباشرة على الموقع
        await refreshSettings()
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

  const addMenuItem = (menuType: 'header' | 'footer' | 'sidebar') => {
    const menuKey = `${menuType}Menu` as keyof MenuSettings
    const currentMenu = settings[menuKey] as MenuItem[]
    
    // حساب رقم الترتيب التلقائي (آخر رقم + 1)
    const maxOrderNumber = currentMenu.length > 0
      ? Math.max(...currentMenu.map(item => item.orderNumber))
      : 0
    
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: '',
      url: '',
      icon: '',
      target: '_self',
      orderNumber: maxOrderNumber + 1,
      isActive: true,
      children: []
    }

    setSettings({
      ...settings,
      [menuKey]: [...currentMenu, newItem]
    })
  }

  const updateMenuItem = (menuType: 'header' | 'footer' | 'sidebar', index: number, field: keyof MenuItem, value: any) => {
    const menuKey = `${menuType}Menu` as keyof MenuSettings
    const updatedMenu = [...settings[menuKey] as MenuItem[]]
    updatedMenu[index] = {
      ...updatedMenu[index],
      [field]: value
    }

    setSettings({
      ...settings,
      [menuKey]: updatedMenu
    })
  }

  const deleteMenuItem = (menuType: 'header' | 'footer' | 'sidebar', index: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return

    const menuKey = `${menuType}Menu` as keyof MenuSettings
    const currentMenu = settings[menuKey] as MenuItem[]
    const filteredMenu = currentMenu.filter((_, i) => i !== index)
    
    setSettings({
      ...settings,
      [menuKey]: filteredMenu
    })
    
    // إعادة ترتيب الأرقام بعد الحذف (اختياري)
    const reorderedMenu = filteredMenu.map((item, idx) => ({
      ...item,
      orderNumber: idx + 1
    }))
    
    setSettings({
      ...settings,
      [menuKey]: reorderedMenu
    })
  }

  const getCurrentMenu = () => {
    switch (activeTab) {
      case 'header':
        return settings.headerMenu
      case 'footer':
        return settings.footerMenu
      case 'sidebar':
        return settings.sidebarMenu
      default:
        return []
    }
  }

  // عرض رسالة إذا لم يكن لديه صلاحية
  if (!permissionsLoading && !canManageMenus && !canUpdate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك</h2>
          <p className="text-gray-600 mb-4">
            ليس لديك صلاحية الوصول إلى إدارة القوائم
          </p>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowRight className="h-5 w-5 ml-2" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (loading || permissionsLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900">إدارة القوائم</h1>
            <p className="text-gray-600 mt-1">تخصيص قوائم الهيدر والفوتر</p>
          </div>
        </div>
        {(canManageMenus || canUpdate) && (
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600">
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        )}
      </div>

      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('header')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'header'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            قائمة الهيدر
          </button>
          <button
            onClick={() => setActiveTab('footer')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'footer'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            قائمة الفوتر
          </button>
          <button
            onClick={() => setActiveTab('sidebar')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'sidebar'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            القائمة الجانبية
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MenuIcon className="h-5 w-5" />
            {activeTab === 'header' ? 'قائمة الهيدر' : activeTab === 'footer' ? 'قائمة الفوتر' : 'القائمة الجانبية'}
          </h2>
          {(canManageMenus || canCreate) && (
            <Button
              type="button"
              onClick={() => addMenuItem(activeTab)}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Plus className="h-4 w-4 ml-1" />
              إضافة عنصر
            </Button>
          )}
        </div>

        {getCurrentMenu().length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">لم يتم إضافة عناصر للقائمة بعد</p>
            {(canManageMenus || canCreate) && (
              <Button type="button" onClick={() => addMenuItem(activeTab)} variant="outline">
                <Plus className="h-4 w-4 ml-2" />
                إضافة عنصر جديد
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {getCurrentMenu().map((item, index) => (
              <Card key={item.id} className="p-4 bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className="cursor-move text-gray-400 hover:text-gray-600 mt-2">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Item Fields */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">التسمية</Label>
                        <Input
                          value={item.label}
                          onChange={(e) => updateMenuItem(activeTab, index, 'label', e.target.value)}
                          placeholder="مثال: الرئيسية"
                          className="mt-1"
                          disabled={!canManageMenus && !canUpdate}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">الرابط</Label>
                        <Input
                          value={item.url}
                          onChange={(e) => updateMenuItem(activeTab, index, 'url', e.target.value)}
                          placeholder="/"
                          className="mt-1"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">الأيقونة (اختياري)</Label>
                        <Input
                          value={item.icon}
                          onChange={(e) => updateMenuItem(activeTab, index, 'icon', e.target.value)}
                          placeholder="🏠"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">الهدف</Label>
                        <select
                          value={item.target}
                          onChange={(e) => updateMenuItem(activeTab, index, 'target', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        >
                          <option value="_self">نفس الصفحة</option>
                          <option value="_blank">صفحة جديدة</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">الترتيب</Label>
                        <Input
                          type="number"
                          value={item.orderNumber}
                          onChange={(e) => updateMenuItem(activeTab, index, 'orderNumber', parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`active-${item.id}`}
                        checked={item.isActive}
                        onChange={(e) => updateMenuItem(activeTab, index, 'isActive', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`active-${item.id}`} className="text-sm cursor-pointer">
                        عنصر نشط
                      </Label>
                    </div>
                  </div>

                  {/* Actions */}
                  {(canManageMenus || hasPermission('DELETE', 'settings')) && (
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMenuItem(activeTab, index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

