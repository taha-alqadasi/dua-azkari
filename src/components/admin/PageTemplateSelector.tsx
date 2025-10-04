'use client'

import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { FileText, HelpCircle, Mail, Info, Scale, Shield } from 'lucide-react'
import type { PageTemplate } from '@/types/page-schemas'

interface PageTemplateSelectorProps {
  value: PageTemplate
  onChange: (template: PageTemplate) => void
  disabled?: boolean
}

const templates: {
  value: PageTemplate
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  {
    value: 'default',
    label: 'صفحة عادية',
    description: 'محتوى نصي بسيط باستخدام المحرر',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    value: 'faq',
    label: 'أسئلة وأجوبة',
    description: 'هيكل منظم للأسئلة الشائعة مع SEO Schema',
    icon: HelpCircle,
    color: 'bg-purple-500'
  },
  {
    value: 'contact',
    label: 'اتصل بنا',
    description: 'معلومات التواصل + نموذج اتصال + خريطة',
    icon: Mail,
    color: 'bg-green-500'
  },
  {
    value: 'about',
    label: 'من نحن',
    description: 'الرؤية، الرسالة، القيم، الفريق',
    icon: Info,
    color: 'bg-orange-500'
  },
  {
    value: 'terms',
    label: 'شروط وأحكام',
    description: 'محتوى قانوني منظم بأقسام',
    icon: Scale,
    color: 'bg-red-500'
  },
  {
    value: 'privacy',
    label: 'سياسة الخصوصية',
    description: 'سياسة الخصوصية مع أقسام منظمة',
    icon: Shield,
    color: 'bg-indigo-500'
  }
]

export function PageTemplateSelector({ value, onChange, disabled }: PageTemplateSelectorProps) {
  return (
    <div>
      <div className="space-y-3">
        {templates.map((template) => {
          const Icon = template.icon
          const isSelected = value === template.value
          
          return (
            <Card
              key={template.value}
              className={`
                relative cursor-pointer transition-all duration-200 p-4
                ${isSelected 
                  ? 'border-primary border-2 shadow-lg bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !disabled && onChange(template.value)}
            >
              <div className="flex items-center gap-3">
                <div className={`${template.color} p-2.5 rounded-xl shadow-sm shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm mb-0.5 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {template.label}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {template.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
      
      {value !== 'default' && !disabled && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex gap-2">
            <span className="text-amber-600 text-lg shrink-0">⚠️</span>
            <p className="text-sm text-amber-700 leading-relaxed">
              تغيير نوع الصفحة سيؤدي إلى تغيير بنية المحتوى. تأكد من حفظ عملك أولاً.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

