'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  BarChart3,
  ChevronLeft,
  Tag,
  FileType
} from 'lucide-react'
import { Resource } from '@/types/permissions.types'

interface AdminSidebarProps {
  onClose?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
  requiredPermission?: {
    action: string
    resource: Resource
  }
  adminOnly?: boolean
}

const navigation: NavItem[] = [
  {
    title: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'المحتوى',
    href: '/admin/posts',
    icon: FileText,
    requiredPermission: {
      action: 'READ',
      resource: 'posts'
    },
    children: [
      {
        title: 'جميع المنشورات',
        href: '/admin/posts',
        icon: FileText,
        requiredPermission: {
          action: 'READ',
          resource: 'posts'
        }
      },
      {
        title: 'إضافة منشور',
        href: '/admin/posts/new',
        icon: Plus,
        requiredPermission: {
          action: 'CREATE',
          resource: 'posts'
        }
      },
      {
        title: 'الصفحات',
        href: '/admin/pages',
        icon: FileType,
        requiredPermission: {
          action: 'READ',
          resource: 'pages'
        }
      },
      {
        title: 'التصنيفات',
        href: '/admin/categories',
        icon: FolderOpen,
        requiredPermission: {
          action: 'READ',
          resource: 'categories'
        }
      },
      {
        title: 'الوسوم',
        href: '/admin/tags',
        icon: Tag,
        requiredPermission: {
          action: 'READ',
          resource: 'tags'
        }
      },
    ]
  },
  {
    title: 'مكتبة الوسائط',
    href: '/admin/media',
    icon: Image,
    requiredPermission: {
      action: 'READ',
      resource: 'media'
    }
  },
  {
    title: 'الإحصائيات',
    href: '/admin/analytics',
    icon: BarChart3,
    requiredPermission: {
      action: 'READ',
      resource: 'analytics'
    }
  },
  {
    title: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
    requiredPermission: {
      action: 'READ',
      resource: 'settings'
    }
  },
]

export function AdminSidebar({ onClose }: AdminSidebarProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { hasPermission, isAdmin } = usePermissions()

  // تصفية القائمة بناءً على الصلاحيات
  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => {
      // إذا كان العنصر يتطلب صلاحية Admin فقط
      if (item.adminOnly && !isAdmin()) {
        return false
      }

      // إذا كان العنصر يتطلب صلاحية معينة
      if (item.requiredPermission) {
        const { action, resource } = item.requiredPermission
        return hasPermission(action, resource)
      }

      // إذا لم يكن هناك قيود، اعرضه
      return true
    }).map(item => {
      // تصفية العناصر الفرعية أيضاً
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          if (child.adminOnly && !isAdmin()) {
            return false
          }
          if (child.requiredPermission) {
            const { action, resource } = child.requiredPermission
            return hasPermission(action, resource)
          }
          return true
        })

        // إذا لم يتبق أي عناصر فرعية، لا تعرض العنصر الأب
        if (filteredChildren.length === 0) {
          return null
        }

        return {
          ...item,
          children: filteredChildren
        }
      }

      return item
    }).filter(Boolean) as NavItem[]
  }, [hasPermission, isAdmin])

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isExpanded = (href: string) => expandedItems.includes(href)

  return (
    <div
      style={{
        width: isCollapsed ? '80px' : '280px',
        height: '100vh',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.05)'
      }}
      dir="rtl"
    >
      {/* Header */}
      <div style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 20px',
        background: 'linear-gradient(135deg, #1e9e94 0%, #16a085 100%)',
        color: 'white'
      }}>
        {!isCollapsed && (
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }} onClick={onClose}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              د
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'white', fontSize: '16px' }}>دعاء أذكاري</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>لوحة الإدارة</div>
            </div>
          </Link>
        )}
        {onClose ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            style={{ 
              width: '40px', 
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: 'white'
            }}
          >
            <X className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex"
            style={{ 
              width: '40px', 
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: 'white'
            }}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredNavigation.map((item) => {
          const active = isActive(item.href)
          const expanded = isExpanded(item.href)
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.href}>
              {hasChildren ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: active ? 'linear-gradient(135deg, #1e9e94 0%, #16a085 100%)' : 'transparent',
                      color: active ? 'white' : '#64748b',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'right'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9'
                        e.currentTarget.style.color = '#334155'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#64748b'
                      }
                    }}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span style={{ flex: 1, textAlign: 'right' }}>{item.title}</span>
                        <ChevronLeft 
                          className="h-4 w-4" 
                          style={{ 
                            transform: expanded ? 'rotate(-90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }} 
                        />
                      </>
                    )}
                  </button>
                  
                  {expanded && !isCollapsed && (
                    <div style={{ 
                      marginTop: '4px',
                      marginRight: '20px',
                      borderRight: '2px solid #e2e8f0',
                      paddingRight: '16px'
                    }}>
                      {item.children?.map((child) => {
                        const childActive = isActive(child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={(e) => {
                              // Immediate visual feedback
                              if (onClose) onClose()
                            }}
                            prefetch={true}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              color: childActive ? '#1e9e94' : '#64748b',
                              backgroundColor: childActive ? '#f0fdfc' : 'transparent',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                              marginBottom: '2px'
                            }}
                            onMouseEnter={(e) => {
                              if (!childActive) {
                                e.currentTarget.style.backgroundColor = '#f8fafc'
                                e.currentTarget.style.color = '#334155'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!childActive) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.color = '#64748b'
                              }
                            }}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span style={{ flex: 1, textAlign: 'right' }}>{child.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={(e) => {
                    // Immediate visual feedback
                    if (onClose) onClose()
                  }}
                  prefetch={true}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    background: active ? 'linear-gradient(135deg, #1e9e94 0%, #16a085 100%)' : 'transparent',
                    color: active ? 'white' : '#64748b',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: active ? '0 4px 12px rgba(30, 158, 148, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9'
                      e.currentTarget.style.color = '#334155'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#64748b'
                    }
                  }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span style={{ flex: 1, textAlign: 'right' }}>{item.title}</span>}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Section */}
      <div style={{ 
        borderTop: '1px solid #e2e8f0', 
        padding: '20px 16px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {!isCollapsed && user && (
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '16px',
            borderRadius: '16px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1e9e94',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {user.name?.charAt(0) || 'م'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginTop: '8px'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1e9e94 0%, #16a085 100%)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {user.role === 'ADMIN' ? '🔑 مدير النظام' : user.role === 'EDITOR' ? '✏️ محرر' : '👁️ مشاهد'}
              </span>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={logout}
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '12px',
            padding: isCollapsed ? '12px' : '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
            e.currentTarget.style.color = '#dc2626'
          }}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </Button>
      </div>
    </div>
  )
}