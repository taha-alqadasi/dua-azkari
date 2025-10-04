import { z } from 'zod'

// Schema لإعدادات بطاقة "ذات صلة"
export const relatedPostsCardSchema = z.object({
  id: z.string().optional(),
  enabled: z.boolean().default(true),
  title: z.string().default('ذات صلة'),
  backgroundColor: z.string().default('from-purple-600 to-pink-600'),
  icon: z.enum(['folder', 'star', 'heart', 'bookmark', 'sparkles']).default('folder'),
  displayMode: z.enum(['auto', 'manual']).default('auto'), // auto = من نفس القسم، manual = اختيار أقسام محددة
  selectedCategories: z.array(z.string()).default([]), // الأقسام المختارة يدوياً (للوضع اليدوي)
  maxPosts: z.number().min(1).max(20).default(10),
  showReciterName: z.boolean().default(true),
  showDuration: z.boolean().default(true),
  displayStyle: z.enum(['compact', 'card', 'detailed']).default('compact'), // أنماط العرض
  columnsLayout: z.enum(['single', 'double']).default('double'), // عمود أو عمودين
  order: z.number().default(0),
})

export const postSettingsSchema = z.object({
  // تخطيط الصفحة - منفصل عن إعدادات "ذات صلة"
  pageLayout: z.enum(['single-column', 'two-columns']).default('single-column'),
  
  // إعدادات بطاقات "ذات صلة"
  relatedPostsCards: z.array(relatedPostsCardSchema).default([]), // دعم بطاقات متعددة
})

export type RelatedPostsCardSettings = z.infer<typeof relatedPostsCardSchema>
export type PostSettings = z.infer<typeof postSettingsSchema>

// الألوان المتاحة للبطاقة
export const availableColors = [
  { value: 'from-purple-600 to-pink-600', label: 'بنفسجي - وردي', preview: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { value: 'from-blue-600 to-cyan-600', label: 'أزرق - سماوي', preview: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
  { value: 'from-emerald-600 to-teal-600', label: 'أخضر - فيروزي', preview: 'bg-gradient-to-r from-emerald-600 to-teal-600' },
  { value: 'from-orange-600 to-amber-600', label: 'برتقالي - عنبر', preview: 'bg-gradient-to-r from-orange-600 to-amber-600' },
  { value: 'from-red-600 to-rose-600', label: 'أحمر - وردي', preview: 'bg-gradient-to-r from-red-600 to-rose-600' },
  { value: 'from-slate-600 to-indigo-600', label: 'رمادي - نيلي', preview: 'bg-gradient-to-r from-slate-600 to-indigo-600' },
]

// الأيقونات المتاحة
export const availableIcons = [
  { value: 'folder', label: 'مجلد' },
  { value: 'star', label: 'نجمة' },
  { value: 'heart', label: 'قلب' },
  { value: 'bookmark', label: 'علامة مرجعية' },
  { value: 'sparkles', label: 'تألق' },
]
