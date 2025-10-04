'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePermissions } from '@/hooks/use-permissions'
import {
  Settings,
  Home,
  FileText,
  Volume2,
  Folder,
  Tag,
  Search,
  Zap,
  Share2,
  Menu,
  Image,
  Code,
  Palette,
  ArrowRightLeft,
  Users,
  Shield
} from 'lucide-react'

const settingsCategories = [
  {
    id: 'general',
    title: 'الإعدادات الأساسية',
    description: 'إعدادات الموقع العامة مثل الاسم، الشعار، والأيقونة',
    icon: Settings,
    color: 'from-blue-500 to-cyan-500',
    href: '/admin/settings/general'
  },
  {
    id: 'homepage',
    title: 'الصفحة الرئيسية',
    description: 'تخصيص البلوكات في الصفحة الرئيسية',
    icon: Home,
    color: 'from-emerald-500 to-teal-500',
    href: '/admin/settings/homepage'
  },
  {
    id: 'ads',
    title: 'الإعلانات (AdSense)',
    description: 'إدارة إعلانات Google AdSense مع Lazy Loading ذكي',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    href: '/admin/settings/ads'
  },
  {
    id: 'post',
    title: 'صفحة المقال',
    description: 'إعدادات صفحات المقالات والأذكار',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    href: '/admin/settings/post'
  },
  {
    id: 'audio',
    title: 'المقاطع الصوتية',
    description: 'إعدادات صفحة جميع المقاطع الصوتية (/listen-all)',
    icon: Volume2,
    color: 'from-teal-500 to-emerald-500',
    href: '/admin/settings/audio'
  },
  {
    id: 'category',
    title: 'صفحة الفئة',
    description: 'إعدادات صفحات الفئات والتصنيفات',
    icon: Folder,
    color: 'from-orange-500 to-amber-500',
    href: '/admin/settings/category'
  },
  {
    id: 'tag',
    title: 'صفحة الوسوم',
    description: 'إعدادات صفحات الوسوم والكلمات المفتاحية',
    icon: Tag,
    color: 'from-rose-500 to-red-500',
    href: '/admin/settings/tag'
  },
  {
    id: 'seo',
    title: 'SEO وأدوات المشرفين',
    description: 'إعدادات محركات البحث وأدوات التحليل',
    icon: Search,
    color: 'from-indigo-500 to-blue-500',
    href: '/admin/settings/seo'
  },
  {
    id: 'redirections',
    title: 'التحويلات (Redirections)',
    description: 'إعادة توجيه الروابط القديمة إلى روابط جديدة - 301/302',
    icon: ArrowRightLeft,
    color: 'from-violet-500 to-purple-500',
    href: '/admin/settings/redirections'
  },
  {
    id: 'social',
    title: 'منصات التواصل',
    description: 'روابط حسابات التواصل الاجتماعي',
    icon: Share2,
    color: 'from-cyan-500 to-blue-500',
    href: '/admin/settings/social'
  },
  {
    id: 'users',
    title: 'المستخدمين',
    description: 'إدارة المستخدمين وحساباتهم',
    icon: Users,
    color: 'from-blue-600 to-cyan-600',
    href: '/admin/users',
    adminOnly: true
  },
  {
    id: 'roles',
    title: 'الأدوار والصلاحيات',
    description: 'تخصيص الأدوار وصلاحياتها',
    icon: Shield,
    color: 'from-purple-600 to-pink-600',
    href: '/admin/roles',
    adminOnly: true
  },
  {
    id: 'menus',
    title: 'القوائم',
    description: 'إدارة قوائم الهيدر والفوتر',
    icon: Menu,
    color: 'from-slate-500 to-gray-500',
    href: '/admin/settings/menus'
  },
  {
    id: 'icons',
    title: 'إدارة الأيقونات',
    description: 'رفع وإدارة الأيقونات المخصصة',
    icon: Image,
    color: 'from-green-500 to-emerald-500',
    href: '/admin/settings/icons'
  },
  {
    id: 'custom-code',
    title: 'أكواد خاصة',
    description: 'إضافة أكواد HTML/CSS/JS مخصصة',
    icon: Code,
    color: 'from-gray-600 to-slate-600',
    href: '/admin/settings/custom-code'
  },
  {
    id: 'misc',
    title: 'إعدادات متنوعة',
    description: 'Theme color، إحصائيات، وإعدادات أخرى',
    icon: Palette,
    color: 'from-fuchsia-500 to-purple-500',
    href: '/admin/settings/misc'
  }
]

export default function SettingsPage() {
  const { isAdmin } = usePermissions()

  // تصفية الإعدادات حسب الصلاحيات
  const filteredCategories = settingsCategories.filter((category: any) => {
    if (category.adminOnly) {
      return isAdmin()
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          إعدادات الموقع
        </h1>
        <p className="text-lg text-gray-600">
          تخصيص جميع إعدادات الموقع من مكان واحد
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.id} href={category.href}>
              <Card className="group p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/30 cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-teal-50 border-2 border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              نصائح مهمة
            </h3>
            <p className="text-sm text-gray-600">
              احرص على حفظ التغييرات بعد تعديل أي إعداد. بعض الإعدادات قد تحتاج إلى إعادة تحميل الصفحة لرؤية التأثير.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

