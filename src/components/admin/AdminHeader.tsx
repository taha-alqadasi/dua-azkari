'use client'

import { Bell, Search, Moon, Sun, Globe, Menu, User, LogOut, Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface AdminHeaderProps {
  title?: string
  description?: string
  onMenuClick?: () => void
}

export function AdminHeader({ title, description, onMenuClick }: AdminHeaderProps) {
  const { user } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      borderBottom: '1px solid #e2e8f0',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        height: '64px',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }} className="sm:h-16 sm:px-6 md:px-8">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden shrink-0"
          style={{ 
            width: '44px', 
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1e9e94 0%, #16a085 100%)',
            border: '1px solid rgba(30, 158, 148, 0.3)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(30, 158, 148, 0.2)',
          }}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Title Section */}
        <div style={{ flex: 1 }} className="hidden sm:block">
          {title && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }} className="sm:text-xl md:text-2xl">{title}</h1>
              {description && (
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }} className="sm:text-sm hidden md:block">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="sm:gap-3">
          {/* Search - Hidden on mobile */}
          <div style={{ position: 'relative', display: 'none' }} className="xl:block">
            <Search style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#64748b'
            }} />
            <Input
              placeholder="البحث في النظام..."
              style={{
                width: '240px',
                paddingRight: '48px',
                paddingLeft: '16px',
                height: '40px',
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontSize: '14px',
                direction: 'rtl',
                transition: 'all 0.2s ease'
              }}
              className="xl:w-64 xl:h-11"
              onFocus={(e) => {
                e.target.style.borderColor = '#1e9e94'
                e.target.style.backgroundColor = 'white'
                e.target.style.boxShadow = '0 0 0 3px rgba(30, 158, 148, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.backgroundColor = '#f8fafc'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex"
            style={{ 
              width: '40px', 
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e9e94'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.borderColor = '#1e9e94'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9'
              e.currentTarget.style.color = '#64748b'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Website Link - Opens in new tab */}
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden md:flex"
              style={{ 
                width: '40px', 
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e9e94'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.borderColor = '#1e9e94'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9'
                e.currentTarget.style.color = '#64748b'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <Globe className="h-5 w-5" />
            </Button>
          </Link>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notificationsRef}>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                width: '40px', 
                height: '40px',
                borderRadius: '10px',
                backgroundColor: showNotifications ? '#1e9e94' : '#f1f5f9',
                border: `1px solid ${showNotifications ? '#1e9e94' : '#e2e8f0'}`,
                color: showNotifications ? 'white' : '#64748b',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!showNotifications) {
                  e.currentTarget.style.backgroundColor = '#1e9e94'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = '#1e9e94'
                }
              }}
              onMouseLeave={(e) => {
                if (!showNotifications) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9'
                  e.currentTarget.style.color = '#64748b'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }
              }}
            >
              <Bell className="h-5 w-5" />
              <span style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                display: 'flex',
                width: '20px',
                height: '20px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                3
              </span>
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 'calc(100% + 8px)',
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#111827'
                }}>
                  الإشعارات
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                      مستخدم جديد سجل في الموقع
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      منذ 5 دقائق
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                      مقال جديد بانتظار المراجعة
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      منذ ساعة
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                      تم رفع ملف جديد للوسائط
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      منذ 3 ساعات
                    </div>
                  </div>
                </div>
                <Link href="/admin/notifications" style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#1e9e94',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    عرض كل الإشعارات
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <Button 
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                padding: 0,
                backgroundColor: showUserMenu ? 'transparent' : '#f1f5f9',
                border: `1px solid ${showUserMenu ? '#1e9e94' : '#e2e8f0'}`,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: showUserMenu ? '0 0 0 3px rgba(30, 158, 148, 0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!showUserMenu) {
                  e.currentTarget.style.borderColor = '#1e9e94'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 158, 148, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!showUserMenu) {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: '10px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#1e9e94',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {user?.name?.charAt(0) || 'م'}
                </div>
              )}
            </Button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 'calc(100% + 8px)',
                width: '240px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                {/* User Info */}
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {user?.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '8px'
                  }}>
                    {user?.email}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#1e9e94',
                    color: 'white',
                    fontSize: '11px',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}>
                    {user?.role === 'ADMIN' ? 'مدير النظام' : user?.role === 'EDITOR' ? 'محرر' : 'مشاهد'}
                  </div>
                </div>

                {/* Menu Items */}
                <div>
                  <Link href="/admin/profile" style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      color: '#111827'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User className="h-4 w-4 text-gray-600" />
                      <span style={{ fontSize: '14px' }}>الملف الشخصي</span>
                    </div>
                  </Link>

                  <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      color: '#111827'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span style={{ fontSize: '14px' }}>الإعدادات</span>
                    </div>
                  </Link>

                  <div style={{
                    height: '1px',
                    backgroundColor: '#e2e8f0',
                    margin: '8px 0'
                  }} />

                  <div 
                    onClick={handleLogout}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      color: '#ef4444'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut className="h-4 w-4" />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>تسجيل الخروج</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}