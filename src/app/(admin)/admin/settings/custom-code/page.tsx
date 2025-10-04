'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, Code, AlertCircle } from 'lucide-react'
import { CustomCodeSettings } from '@/types/settings.types'

export default function CustomCodeSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<CustomCodeSettings>({
    headerCode: '',
    footerCode: '',
    customCss: '',
    customJs: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=customCode')
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
        body: JSON.stringify({ group: 'customCode', data: settings })
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
            <h1 className="text-3xl font-bold text-gray-900">أكواد خاصة</h1>
            <p className="text-gray-600 mt-1">إضافة أكواد HTML/CSS/JS مخصصة</p>
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

      {/* Warning */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-900 mb-1">تحذير مهم</h3>
            <p className="text-sm text-yellow-800">
              إضافة أكواد خاطئة قد تؤثر على عمل الموقع. تأكد من صحة الأكواد قبل الحفظ. يُنصح بعمل نسخة احتياطية قبل التعديل.
            </p>
          </div>
        </div>
      </Card>

      {/* Header Code */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Code className="h-5 w-5" />
          أكواد في الهيدر (Head)
        </h2>
        <div className="space-y-3">
          <Label htmlFor="headerCode">الأكواد التي ستُضاف في  &lt;head&gt; قبل &lt;/head&gt;</Label>
          <textarea
            id="headerCode"
            value={settings.headerCode}
            onChange={(e) => setSettings({ ...settings, headerCode: e.target.value })}
            placeholder={`<!-- مثال: -->
<meta name="author" content="Your Name">
<link rel="stylesheet" href="https://example.com/custom.css">
<script src="https://example.com/custom.js"></script>`}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors min-h-[200px] font-mono text-sm"
            dir="ltr"
          />
          <p className="text-sm text-gray-500">
            مثال: أكواد Meta Tags إضافية، خطوط ويب، أو سكربتات Analytics
          </p>
        </div>
      </Card>

      {/* Footer Code */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Code className="h-5 w-5" />
          أكواد في الفوتر (Body)
        </h2>
        <div className="space-y-3">
          <Label htmlFor="footerCode">الأكواد التي ستُضاف قبل &lt;/body&gt;</Label>
          <textarea
            id="footerCode"
            value={settings.footerCode}
            onChange={(e) => setSettings({ ...settings, footerCode: e.target.value })}
            placeholder={`<!-- مثال: -->
<script>
  // Your custom JavaScript code here
  console.log('Custom script loaded');
</script>`}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors min-h-[200px] font-mono text-sm"
            dir="ltr"
          />
          <p className="text-sm text-gray-500">
            مثال: سكربتات JavaScript، Chat Widgets، أو أكواد تتبع إضافية
          </p>
        </div>
      </Card>

      {/* Custom CSS */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Code className="h-5 w-5" />
          CSS مخصص
        </h2>
        <div className="space-y-3">
          <Label htmlFor="customCss">أضف تنسيقات CSS مخصصة</Label>
          <textarea
            id="customCss"
            value={settings.customCss}
            onChange={(e) => setSettings({ ...settings, customCss: e.target.value })}
            placeholder={`/* مثال: */
.custom-class {
  background-color: #1e9e94;
  color: white;
  padding: 20px;
  border-radius: 10px;
}

body {
  font-family: 'Cairo', sans-serif;
}`}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors min-h-[250px] font-mono text-sm"
            dir="ltr"
          />
          <p className="text-sm text-gray-500">
            تنسيقات CSS ستُطبق على جميع صفحات الموقع. استخدم هذا لتخصيص المظهر بدون تعديل الملفات.
          </p>
        </div>
      </Card>

      {/* Custom JavaScript */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Code className="h-5 w-5" />
          JavaScript مخصص
        </h2>
        <div className="space-y-3">
          <Label htmlFor="customJs">أضف سكربتات JavaScript مخصصة</Label>
          <textarea
            id="customJs"
            value={settings.customJs}
            onChange={(e) => setSettings({ ...settings, customJs: e.target.value })}
            placeholder={`// مثال:
document.addEventListener('DOMContentLoaded', function() {
  console.log('Custom JS loaded');
  
  // Your custom JavaScript code here
});

// مثال: إضافة زر مخصص
function customFunction() {
  alert('Hello from custom JS!');
}`}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors min-h-[250px] font-mono text-sm"
            dir="ltr"
          />
          <p className="text-sm text-gray-500">
            سكربتات JavaScript ستُنفذ على جميع صفحات الموقع. تأكد من صحة الكود لتجنب الأخطاء.
          </p>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3">💡 نصائح مفيدة</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="shrink-0">•</span>
            <span>اختبر الأكواد في بيئة تطوير قبل تطبيقها على الموقع الرئيسي</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0">•</span>
            <span>استخدم التعليقات (Comments) لتوثيق الأكواد المخصصة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0">•</span>
            <span>تجنب استخدام أكواد من مصادر غير موثوقة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0">•</span>
            <span>راجع أداء الموقع بعد إضافة السكربتات الجديدة</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}

