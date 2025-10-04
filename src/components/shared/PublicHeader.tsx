'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Menu, ArrowRight, Volume2, FolderOpen, Hash, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useSettings } from '@/contexts/SettingsContext'

interface MenuItem {
  id: string
  label: string
  url: string
  icon?: string
  target: '_self' | '_blank'
  orderNumber: number
  isActive: boolean
}

interface PublicHeaderProps {
  showSearch?: boolean
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
  siteName?: string
  siteDescription?: string
  logoUrl?: string
}

export function PublicHeader({ 
  showSearch = true,
  showBackButton = false,
  backButtonText = 'الرئيسية',
  backButtonHref = '/',
  siteName,
  siteDescription,
  logoUrl
}: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { settings, loading } = useSettings()

  // استخدام الإعدادات من Context أو القيم الافتراضية من Props
  const finalSiteName = siteName || settings.general.siteName
  const finalSiteDescription = siteDescription || settings.general.siteDescription
  const finalLogoUrl = logoUrl || settings.general.logoUrl

  // تصفية وترتيب القوائم النشطة
  const menuItems = useMemo(() => {
    if (!settings.menus.headerMenu) return []
    return settings.menus.headerMenu
      .filter((item: MenuItem) => item.isActive)
      .sort((a: MenuItem, b: MenuItem) => a.orderNumber - b.orderNumber)
  }, [settings.menus.headerMenu])

  return (
    <header className="bg-gradient-to-r from-primary via-teal-600 to-cyan-600 text-white sticky top-0 z-50 shadow-xl backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0">
            {finalLogoUrl ? (
              <img src={finalLogoUrl} alt={finalSiteName} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl border-2 border-white/30 shadow-lg">
                د
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{finalSiteName}</h1>
              <p className="text-xs text-white/90">{finalSiteDescription}</p>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-1">
            {menuItems.map((item) => (
              <Link key={item.id} href={item.url} target={item.target}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 gap-2">
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن دعاء أو ذكر..."
                className="w-full pr-10 pl-3 py-2 text-sm rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md bg-white"
              />
            </div>
          )}
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-lg border-2 border-white/30 shadow-lg">
                  د
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold">{siteName}</h1>
                <p className="text-[10px] text-white/90">{siteDescription}</p>
              </div>
            </Link>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="mt-3 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن دعاء أو ذكر..."
                className="w-full pr-10 pl-3 py-2 text-sm rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md bg-white"
              />
            </div>
          )}

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="mt-4 flex flex-col gap-2 pb-4 animate-in slide-in-from-top duration-300">
              {menuItems.map((item) => (
                <Link key={item.id} href={item.url} target={item.target} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-white hover:bg-white/20 justify-start gap-3 text-base py-6">
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

