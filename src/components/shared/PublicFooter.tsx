import Link from 'next/link'
import { 
  FolderOpen, 
  Hash, 
  Volume2, 
  Mail, 
  Phone, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  MessageCircle,
  Send,
  Clock,
  Heart,
  ChevronLeft,
  ArrowUpRight
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface PublicFooterProps {
  siteName?: string
  siteDescription?: string
  logoUrl?: string
  copyrightText?: string
  madeWithLoveText?: string
  contactEmail?: string
  contactPhone?: string
}

// جلب قوائم الفوتر والسوشال ميديا من قاعدة البيانات
async function getFooterData() {
  try {
    const [menusSettings, socialSettings] = await Promise.all([
      prisma.setting.findUnique({
        where: { settingKey: 'menus' }
      }),
      prisma.setting.findUnique({
        where: { settingKey: 'socialMedia' }
      })
    ])

    return {
      footerMenu: (menusSettings?.settingValue as any)?.footerMenu || [],
      socialMedia: (socialSettings?.settingValue as any) || {}
    }
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return {
      footerMenu: [],
      socialMedia: {}
    }
  }
}

export async function PublicFooter({
  siteName = 'دعاء أذكاري',
  siteDescription = 'منصة إسلامية شاملة للأدعية والأذكار الصحيحة من القرآن الكريم والسنة النبوية الشريفة',
  logoUrl,
  copyrightText,
  madeWithLoveText = 'صُنع بـ ❤️ لخدمة الإسلام',
  contactEmail = 'info@dua-azkari.com',
  contactPhone = '+966 50 000 0000'
}: PublicFooterProps) {
  const { footerMenu, socialMedia } = await getFooterData()
  
  // فلترة القوائم النشطة وترتيبها
  const activeFooterMenu = footerMenu
    .filter((item: any) => item.isActive)
    .sort((a: any, b: any) => a.orderNumber - b.orderNumber)
  
  const currentYear = new Date().getFullYear()
  const finalCopyrightText = copyrightText 
    ? copyrightText.replace(/:year/g, currentYear.toString())
    : `جميع الحقوق محفوظة © ${currentYear} ${siteName}`

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10">
        {/* Top Section - Brand & Social */}
        <div className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 border-b border-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Brand */}
              <div className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                  {logoUrl ? (
                    <img src={logoUrl} alt={siteName} className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-emerald-500/50 transform hover:scale-110 transition-transform">
                      🕌
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-2xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {siteName}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">منصتك الإسلامية المتكاملة</p>
                  </div>
                </div>
                <p className="text-gray-400 text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {siteDescription}
                </p>
              </div>

              {/* Social Media - Prominent Display */}
              {socialMedia.enabled && (socialMedia.facebook || socialMedia.twitter || socialMedia.instagram || socialMedia.youtube || socialMedia.telegram || socialMedia.whatsapp) && (
                <div className="text-center lg:text-left">
                  <h4 className="font-bold text-lg mb-4 flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-2xl">🌐</span>
                    تابعنا على منصات التواصل
                  </h4>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {socialMedia.facebook && (
                      <a 
                        href={socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
                        title="Facebook"
                      >
                        <Facebook className="h-6 w-6 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                    )}
                    {socialMedia.twitter && (
                      <a 
                        href={socialMedia.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-sky-500/50"
                        title="Twitter"
                      >
                        <Twitter className="h-6 w-6 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                    )}
                    {socialMedia.instagram && (
                      <a 
                        href={socialMedia.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative w-12 h-12 bg-gradient-to-br from-pink-600 via-purple-600 to-orange-500 hover:from-pink-500 hover:via-purple-500 hover:to-orange-400 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50"
                        title="Instagram"
                      >
                        <Instagram className="h-6 w-6 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                    )}
                    {socialMedia.youtube && (
                      <a 
                        href={socialMedia.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-red-500/50"
                        title="YouTube"
                      >
                        <Youtube className="h-6 w-6 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                    )}
                    {socialMedia.telegram && (
                      <a 
                        href={socialMedia.telegram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
                        title="Telegram"
                      >
                        <Send className="h-6 w-6 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                    )}
                    {socialMedia.whatsapp && (
                      <a 
                        href={`https://wa.me/${socialMedia.whatsapp.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-green-500/50"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-6 w-6 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">انضم لمجتمعنا المتنامي من المؤمنين</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section - Links Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-emerald-400">
                <ChevronLeft className="h-5 w-5" />
                روابط سريعة
              </h4>
              <ul className="space-y-3">
                {activeFooterMenu.length > 0 ? (
                  activeFooterMenu.map((item: any) => (
                    <li key={item.id}>
                      <Link 
                        href={item.url} 
                        target={item.target}
                        className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all hover:translate-x-2"
                      >
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        <span className="text-sm">{item.label}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all hover:translate-x-2">
                        <span className="text-sm">الرئيسية</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/listen-all" className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all hover:translate-x-2">
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm">جميع المقاطع</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/categories" className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all hover:translate-x-2">
                        <FolderOpen className="h-4 w-4" />
                        <span className="text-sm">التصنيفات</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/tags" className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all hover:translate-x-2">
                        <Hash className="h-4 w-4" />
                        <span className="text-sm">الوسوم</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Important Pages */}
            <div>
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-teal-400">
                <ChevronLeft className="h-5 w-5" />
                صفحات مفيدة
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about-us" className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all hover:translate-x-2">
                    <span className="text-sm">من نحن</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all hover:translate-x-2">
                    <span className="text-sm">سياسة الخصوصية</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all hover:translate-x-2">
                    <span className="text-sm">شروط الاستخدام</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all hover:translate-x-2">
                    <span className="text-sm">اتصل بنا</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-cyan-400">
                <ChevronLeft className="h-5 w-5" />
                مصادر مفيدة
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="/sitemap.xml" target="_blank" className="group flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all hover:translate-x-2">
                    <span className="text-sm">خريطة الموقع (XML)</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="/sitemap" className="group flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all hover:translate-x-2">
                    <span className="text-sm">خريطة الموقع (HTML)</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <Link href="/app-android" className="group flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all hover:translate-x-2">
                    <span className="text-sm">تطبيق أندرويد</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link href="/app-ios" className="group flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all hover:translate-x-2">
                    <span className="text-sm">تطبيق iOS</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-purple-400">
                <ChevronLeft className="h-5 w-5" />
                تواصل معنا
              </h4>
              <div className="space-y-4">
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="group flex items-start gap-3 text-gray-400 hover:text-purple-400 transition-colors">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-600/30 transition-colors">
                      <Mail className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                      <p className="text-sm font-medium">{contactEmail}</p>
                    </div>
                  </a>
                )}
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="group flex items-start gap-3 text-gray-400 hover:text-purple-400 transition-colors">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-600/30 transition-colors">
                      <Phone className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">الهاتف</p>
                      <p className="text-sm font-medium">{contactPhone}</p>
                    </div>
                  </a>
                )}
                <div className="flex items-start gap-3 text-gray-400">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">متاح</p>
                    <p className="text-sm font-medium">على مدار الساعة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">{finalCopyrightText}</p>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <span>{madeWithLoveText}</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
