'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[200px] border border-input rounded-md flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
})

export interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQBuilderProps {
  value: FAQItem[]
  onChange: (items: FAQItem[]) => void
}

export default function FAQBuilder({ value, onChange }: FAQBuilderProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const addItem = () => {
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: ''
    }
    onChange([...value, newItem])
    setExpandedItems(new Set([...expandedItems, newItem.id]))
  }

  const removeItem = (id: string) => {
    onChange(value.filter(item => item.id !== id))
    const newExpanded = new Set(expandedItems)
    newExpanded.delete(id)
    setExpandedItems(newExpanded)
  }

  const updateItem = (id: string, field: 'question' | 'answer', newValue: string) => {
    onChange(
      value.map(item =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    )
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...value]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
      onChange(newItems)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">الأسئلة الشائعة</h3>
          <p className="text-sm text-muted-foreground">
            أضف الأسئلة والأجوبة التي ستظهر في الصفحة
          </p>
        </div>
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة سؤال
        </Button>
      </div>

      {value.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              لا توجد أسئلة بعد. انقر على "إضافة سؤال" لبدء البناء
            </p>
            <Button
              type="button"
              onClick={addItem}
              variant="default"
              size="sm"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة أول سؤال
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {value.map((item, index) => {
          const isExpanded = expandedItems.has(item.id)
          return (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === value.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium truncate">
                      {item.question || `سؤال ${index + 1}`}
                    </CardTitle>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(item.id)}
                    className="flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="p-4 space-y-4 border-t">
                  <div>
                    <Label htmlFor={`question-${item.id}`}>
                      السؤال *
                    </Label>
                    <Input
                      id={`question-${item.id}`}
                      value={item.question}
                      onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                      placeholder="ما هو...؟"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`answer-${item.id}`}>
                      الإجابة *
                    </Label>
                    <div className="mt-2">
                      <RichTextEditor
                        value={item.answer}
                        onChange={(data) => updateItem(item.id, 'answer', data)}
                        placeholder="اكتب الإجابة هنا..."
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {value.length > 0 && (
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة سؤال آخر
        </Button>
      )}
    </div>
  )
}

