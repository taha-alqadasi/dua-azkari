'use client'

import { useEffect, useState } from 'react'
import { AdSlot } from './AdSlot'
import { AdsSettings, AdsSlot as AdsSlotType } from '@/types/ads.types'

interface AdsManagerProps {
  page: 'home' | 'post' | 'category' | 'tag' | 'search'
  position?: 'header' | 'sidebar' | 'in-content' | 'footer' | 'between-posts' | 'custom'
  customPosition?: string
  index?: number // للمواضع between-posts
}

export function AdsManager({ page, position, customPosition, index }: AdsManagerProps) {
  const [adsSettings, setAdsSettings] = useState<AdsSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdsSettings()
  }, [])

  const fetchAdsSettings = async () => {
    try {
      const res = await fetch('/api/settings?group=ads')
      if (res.ok) {
        const result = await res.json()
        if (result.success) {
          setAdsSettings(result.data as AdsSettings)
        }
      }
    } catch (error) {
      console.error('Error fetching ads settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !adsSettings || !adsSettings.enabled) return null

  const pageSettings = adsSettings.pages[page]
  if (!pageSettings || !pageSettings.enabled) return null

  // تصفية الإعلانات حسب الموضع
  let slots: AdsSlotType[] = pageSettings.slots.filter(slot => {
    if (!slot.enabled) return false
    if (position && slot.position !== position) return false
    if (customPosition && slot.customPosition !== customPosition) return false
    
    // للإعلانات between-posts، تحقق من index
    if (slot.position === 'between-posts' && index !== undefined && slot.afterEvery) {
      return (index + 1) % slot.afterEvery === 0
    }
    
    return true
  })

  // ترتيب حسب orderIndex
  slots = slots.sort((a, b) => a.orderIndex - b.orderIndex)

  if (slots.length === 0) return null

  return (
    <div className={`ads-container ads-${page}-${position || customPosition}`}>
      {slots.map((slot) => (
        <AdSlot
          key={slot.id}
          slot={slot}
          googleAdSenseId={adsSettings.googleAdSenseId}
          lazyLoad={adsSettings.lazyLoad}
          lazyLoadThreshold={adsSettings.lazyLoadThreshold}
        />
      ))}
    </div>
  )
}

