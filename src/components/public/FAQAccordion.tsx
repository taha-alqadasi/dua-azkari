'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set([items[0]?.id]))

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد أسئلة شائعة متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id)
        return (
          <div
            key={item.id}
            className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 text-right flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-right flex-1">
                  {item.question}
                </h3>
              </div>
              <span className="flex-shrink-0 mr-4">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-primary transition-transform" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                )}
              </span>
            </button>

            {isOpen && (
              <div
                id={`faq-answer-${item.id}`}
                className="px-6 py-4 bg-muted/30 border-t border-border animate-in slide-in-from-top-2 duration-200"
              >
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

