'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  ArrowRight, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Lock,
  X,
  Check
} from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { PermissionLabels, ResourceLabels } from '@/types/permissions.types'

interface Permission {
  id: string
  action: string
  resource: string
  description?: string
}

interface Role {
  id: string
  name: string
  nameEn?: string
  description?: string
  isActive: boolean
  isSystem: boolean
  createdAt: string
  updatedAt: string
  permissions: Permission[]
  _count?: {
    users: number
  }
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    isActive: true,
    permissions: [] as string[]
  })

  const { isAdmin, loading: permissionsLoading } = usePermissions()

  useEffect(() => {
    if (!permissionsLoading && isAdmin()) {
      fetchRoles()
      fetchPermissions()
    }
  }, [permissionsLoading])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const result = await response.json()

      if (result.success) {
        setRoles(result.data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions')
      const result = await response.json()

      if (result.success) {
        setPermissions(result.data)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setShowModal(false)
        setEditingRole(null)
        setFormData({
          name: '',
          nameEn: '',
          description: '',
          isActive: true,
          permissions: []
        })
        fetchRoles()
      } else {
        alert(result.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving role:', error)
      alert('حدث خطأ أثناء الحفظ')
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      nameEn: role.nameEn || '',
      description: role.description || '',
      isActive: role.isActive,
      permissions: role.permissions.map(p => p.id)
    })
    setShowModal(true)
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchRoles()
      } else {
        alert(result.error || 'فشل الحذف')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  // تجميع الصلاحيات حسب المورد
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = []
    }
    acc[perm.resource].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

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
            <h1 className="text-3xl font-bold text-gray-900">إدارة الأدوار والصلاحيات</h1>
            <p className="text-gray-600 mt-1">تخصيص الأدوار وصلاحياتها</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setEditingRole(null)
            setFormData({
              name: '',
              nameEn: '',
              description: '',
              isActive: true,
              permissions: []
            })
            setShowModal(true)
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة دور
        </Button>
      </div>

      {/* Roles List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : roles.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد أدوار مخصصة</h3>
          <p className="text-gray-600 mb-4">ابدأ بإضافة دور جديد</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة دور
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{role.name}</h3>
                    {role.nameEn && (
                      <p className="text-sm text-gray-500">{role.nameEn}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {role.isSystem && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      نظام
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    role.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {role.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
              </div>

              {role.description && (
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  الصلاحيات ({role.permissions.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 5).map((perm) => (
                    <span key={perm.id} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {PermissionLabels[perm.action as keyof typeof PermissionLabels]} - {ResourceLabels[perm.resource as keyof typeof ResourceLabels]}
                    </span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      +{role.permissions.length - 5} أخرى
                    </span>
                  )}
                </div>
              </div>

              {role._count && (
                <p className="text-sm text-gray-500 mb-4">
                  {role._count.users} مستخدم
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(role)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={role.isSystem}
                >
                  <Edit className="h-4 w-4 ml-1" />
                  تعديل
                </Button>
                {!role.isSystem && (
                  <Button
                    onClick={() => handleDelete(role.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingRole ? 'تعديل دور' : 'إضافة دور جديد'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>اسم الدور (بالعربية) *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: مدير محتوى"
                    />
                  </div>

                  <div>
                    <Label>اسم الدور (بالإنجليزية)</Label>
                    <Input
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="Example: Content Manager"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <Label>الوصف</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف مختصر للدور..."
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-lg mb-4 block">الصلاحيات</Label>
                  <div className="space-y-4 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <div key={resource} className="space-y-2">
                        <h4 className="font-bold text-primary">
                          {ResourceLabels[resource as keyof typeof ResourceLabels] || resource}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm">
                                {PermissionLabels[perm.action as keyof typeof PermissionLabels]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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
                    الدور نشط
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingRole ? 'حفظ التعديلات' : 'إضافة الدور'}
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

