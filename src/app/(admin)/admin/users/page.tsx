'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  ArrowRight, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Lock,
  Eye,
  EyeOff,
  X
} from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { AdminOnly } from '@/components/shared/PermissionGuard'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  customRoleId?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  customRole?: {
    id: string
    name: string
    nameEn?: string
    description?: string
  }
  _count?: {
    posts: number
    pages: number
    mediaLibrary: number
  }
}

interface Role {
  id: string
  name: string
  nameEn?: string
  description?: string
  isActive: boolean
  isSystem: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'VIEWER' as 'ADMIN' | 'EDITOR' | 'VIEWER',
    customRoleId: '',
    isActive: true
  })

  const { isAdmin, loading: permissionsLoading } = usePermissions()

  useEffect(() => {
    if (!permissionsLoading && isAdmin()) {
      fetchUsers()
      fetchRoles()
    }
  }, [permissionsLoading])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)

      const response = await fetch(`/api/users?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setUsers(result.data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const result = await response.json()

      if (result.success) {
        setRoles(result.data.filter((r: Role) => r.isActive))
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setShowModal(false)
        setEditingUser(null)
        setFormData({
          email: '',
          name: '',
          password: '',
          role: 'VIEWER',
          customRoleId: '',
          isActive: true
        })
        fetchUsers()
      } else {
        alert(result.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('حدث خطأ أثناء الحفظ')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      customRoleId: user.customRoleId || '',
      isActive: user.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchUsers()
      } else {
        alert(result.error || 'فشل الحذف')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!permissionsLoading && isAdmin()) {
        fetchUsers()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, roleFilter])

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك</h2>
          <p className="text-gray-600 mb-4">
            هذه الصفحة متاحة للمدراء فقط
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
            <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600 mt-1">إضافة وتعديل وإدارة المستخدمين</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setEditingUser(null)
            setFormData({
              email: '',
              name: '',
              password: '',
              role: 'VIEWER',
              customRoleId: '',
              isActive: true
            })
            setShowModal(true)
          }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          <UserPlus className="h-5 w-5 ml-2" />
          إضافة مستخدم
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
          >
            <option value="all">جميع الأدوار</option>
            <option value="ADMIN">أدمن</option>
            <option value="EDITOR">محرر</option>
            <option value="VIEWER">مشاهد</option>
          </select>
        </div>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد مستخدمين</h3>
          <p className="text-gray-600 mb-4">ابدأ بإضافة مستخدم جديد</p>
          <Button onClick={() => setShowModal(true)}>
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة مستخدم
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {user.isActive ? 'نشط' : 'معطل'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    الدور: <strong>{
                      user.role === 'ADMIN' ? 'أدمن' :
                      user.role === 'EDITOR' ? 'محرر' : 'مشاهد'
                    }</strong>
                  </span>
                </div>
                {user.customRole && (
                  <div className="text-sm text-primary">
                    دور مخصص: {user.customRole.name}
                  </div>
                )}
                {user._count && (
                  <div className="text-sm text-gray-500">
                    {user._count.posts} مقال • {user._count.mediaLibrary} ملف
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(user)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 ml-1" />
                  تعديل
                </Button>
                <Button
                  onClick={() => handleDelete(user.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>الاسم *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اسم المستخدم"
                  />
                </div>

                <div>
                  <Label>البريد الإلكتروني *</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                </div>

                <div>
                  <Label>كلمة المرور {!editingUser && '*'}</Label>
                  <Input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'اتركها فارغة إذا لم ترد التغيير' : 'كلمة المرور'}
                    dir="ltr"
                  />
                </div>

                <div>
                  <Label>الدور الأساسي *</Label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                  >
                    <option value="VIEWER">مشاهد</option>
                    <option value="EDITOR">محرر</option>
                    <option value="ADMIN">أدمن</option>
                  </select>
                </div>

                <div>
                  <Label>دور مخصص (اختياري)</Label>
                  <select
                    value={formData.customRoleId}
                    onChange={(e) => setFormData({ ...formData, customRoleId: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                  >
                    <option value="">بدون دور مخصص</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    المستخدم نشط
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

