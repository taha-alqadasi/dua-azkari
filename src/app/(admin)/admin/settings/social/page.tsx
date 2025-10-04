'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { ArrowRight, Save, Share2, Facebook, Twitter, Linkedin, Youtube, Instagram, MessageCircle, Eye, EyeOff } from 'lucide-react'
import { SocialMediaSettings } from '@/types/settings.types'

export default function SocialMediaSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<SocialMediaSettings>({
    enabled: true,
    facebook: '',
    facebookAppId: '',
    twitter: '',
    twitterUsername: '',
    linkedin: '',
    youtube: '',
    instagram: '',
    pinterest: '',
    telegram: '',
    whatsapp: '',
    whatsappChannel: '',
    tiktok: '',
    snapchat: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=socialMedia')
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
        body: JSON.stringify({ group: 'socialMedia', data: settings })
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
            <h1 className="text-3xl font-bold text-gray-900">
              منصات التواصل الاجتماعي
            </h1>
            <p className="text-gray-600 mt-1">
              روابط حسابات التواصل الاجتماعي للموقع
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-600 to-teal-600"
        >
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

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          الحسابات الاجتماعية
        </h2>

        {/* Enable/Disable Social Media */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="socialEnabled" className="text-base font-semibold flex items-center gap-2">
                {settings.enabled ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                )}
                عرض روابط التواصل في الفوتر
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                {settings.enabled 
                  ? 'روابط التواصل الاجتماعي تظهر في الفوتر للزوار' 
                  : 'روابط التواصل مخفية ولن تظهر في الموقع'}
              </p>
            </div>
            <Switch
              id="socialEnabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>
        </div>

        <div className="space-y-5">
          {/* Facebook */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                فيس بوك
              </Label>
              <Input
                id="facebook"
                value={settings.facebook}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                placeholder="https://facebook.com/your-page"
                className="mt-2"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="facebookAppId">معرف تطبيق فيس بوك (App ID)</Label>
              <Input
                id="facebookAppId"
                value={settings.facebookAppId}
                onChange={(e) => setSettings({ ...settings, facebookAppId: e.target.value })}
                placeholder="123456789"
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>

          {/* Twitter/X */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                تويتر / إكس (X)
              </Label>
              <Input
                id="twitter"
                value={settings.twitter}
                onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                placeholder="https://twitter.com/your-account"
                className="mt-2"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="twitterUsername">اسم المستخدم في تويتر</Label>
              <Input
                id="twitterUsername"
                value={settings.twitterUsername}
                onChange={(e) => setSettings({ ...settings, twitterUsername: e.target.value })}
                placeholder="@yourusername"
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>

          {/* YouTube */}
          <div>
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              يوتيوب
            </Label>
            <Input
              id="youtube"
              value={settings.youtube}
              onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
              placeholder="https://youtube.com/@your-channel"
              className="mt-2"
              dir="ltr"
            />
          </div>

          {/* Instagram */}
          <div>
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              إنستقرام
            </Label>
            <Input
              id="instagram"
              value={settings.instagram}
              onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              placeholder="https://instagram.com/your-account"
              className="mt-2"
              dir="ltr"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-blue-700" />
              لينكد إن
            </Label>
            <Input
              id="linkedin"
              value={settings.linkedin}
              onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/your-company"
              className="mt-2"
              dir="ltr"
            />
          </div>

          {/* Pinterest */}
          <div>
            <Label htmlFor="pinterest" className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
              </svg>
              بينترست
            </Label>
            <Input
              id="pinterest"
              value={settings.pinterest}
              onChange={(e) => setSettings({ ...settings, pinterest: e.target.value })}
              placeholder="https://pinterest.com/your-account"
              className="mt-2"
              dir="ltr"
            />
          </div>

          {/* Telegram */}
          <div>
            <Label htmlFor="telegram" className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="m12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              تيليجرام
            </Label>
            <Input
              id="telegram"
              value={settings.telegram}
              onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
              placeholder="https://t.me/your-channel"
              className="mt-2"
              dir="ltr"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                واتساب (رقم الهاتف)
              </Label>
              <Input
                id="whatsapp"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="966500000000"
                className="mt-2"
                dir="ltr"
              />
              <p className="text-sm text-gray-500 mt-1">
                مثال: 966500000000 (بدون + أو صفر في البداية)
              </p>
            </div>
            <div>
              <Label htmlFor="whatsappChannel">قناة واتساب</Label>
              <Input
                id="whatsappChannel"
                value={settings.whatsappChannel}
                onChange={(e) => setSettings({ ...settings, whatsappChannel: e.target.value })}
                placeholder="https://whatsapp.com/channel/..."
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>

          {/* TikTok */}
          <div>
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              تيك توك
            </Label>
            <Input
              id="tiktok"
              value={settings.tiktok}
              onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
              placeholder="https://tiktok.com/@your-account"
              className="mt-2"
              dir="ltr"
            />
          </div>

          {/* Snapchat */}
          <div>
            <Label htmlFor="snapchat" className="flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5.829 4.533c-.6 1.344-.363 3.752-.267 5.436-.648.359-1.48-.271-1.951-.271-.49 0-1.075.322-1.167.802-.066.346.089.85 1.201 1.289.43.17 1.453.37 1.69.928.333.784-1.71 4.403-4.918 4.931-.251.041-.43.265-.416.519.056.975 2.242 1.357 3.211 1.507.099.134.179.7.306 1.131.057.193.204.424.582.424.493 0 1.312-.38 2.738-.144 1.398.233 2.712 2.215 5.235 2.215 2.345 0 3.744-1.991 5.09-2.215.779-.129 1.448-.088 2.196.058.515.101.977.157 1.124-.349.129-.437.208-.992.305-1.123.96-.149 3.156-.53 3.211-1.505.014-.254-.165-.477-.416-.519-3.154-.52-5.259-4.128-4.918-4.931.236-.557 1.252-.755 1.69-.928.814-.321 1.222-.716 1.213-1.173-.011-.585-.715-.934-1.233-.934-.527 0-1.284.624-1.897.286.096-1.698.332-4.095-.267-5.438-1.135-2.543-3.66-3.829-6.184-3.829-2.508 0-5.014 1.268-6.158 3.833z"/>
              </svg>
              سناب شات
            </Label>
            <Input
              id="snapchat"
              value={settings.snapchat}
              onChange={(e) => setSettings({ ...settings, snapchat: e.target.value })}
              placeholder="https://snapchat.com/add/your-account"
              className="mt-2"
              dir="ltr"
            />
          </div>
        </div>
      </Card>

      <div className="md:hidden">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  )
}

