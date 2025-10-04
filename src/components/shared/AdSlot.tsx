'use client'

import { useEffect, useRef, useState } from 'react'
import { AdsSlot } from '@/types/ads.types'

interface AdSlotProps {
  slot: AdsSlot
  googleAdSenseId: string
  lazyLoad?: boolean
  lazyLoadThreshold?: number
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdSlot({ slot, googleAdSenseId, lazyLoad = true, lazyLoadThreshold = 200 }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(!lazyLoad)
  const [isLoaded, setIsLoaded] = useState(false)

  // Lazy Loading باستخدام Intersection Observer
  useEffect(() => {
    if (!lazyLoad || isVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: `${lazyLoadThreshold}px`,
        threshold: 0.01
      }
    )

    if (adRef.current) {
      observer.observe(adRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [lazyLoad, lazyLoadThreshold, isVisible])

  // تحميل الإعلان عند الظهور
  useEffect(() => {
    if (!isVisible || isLoaded || !slot.enabled) return

    try {
      // تحميل سكريبت AdSense إذا لم يكن محملاً
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script')
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdSenseId}`
        script.async = true
        script.crossOrigin = 'anonymous'
        document.head.appendChild(script)
      }

      // تهيئة الإعلان
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
      
      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading AdSense:', error)
    }
  }, [isVisible, isLoaded, slot.enabled, googleAdSenseId])

  if (!slot.enabled) return null

  // حساب الأبعاد بناءً على النوع
  const getAdStyle = (): React.CSSProperties => {
    if (slot.responsive) {
      return {
        display: 'block',
        minHeight: slot.height || 250,
      }
    }

    return {
      display: 'inline-block',
      width: slot.width || 'auto',
      height: slot.height || 'auto',
    }
  }

  // إظهار لون تمييزي إذا لم يكن هناك معرف إعلان (للتوضيح فقط)
  const hasValidAdUnit = googleAdSenseId && slot.adUnitId

  return (
    <div 
      ref={adRef}
      className={`ad-slot ad-${slot.position} my-4`}
      data-ad-slot-id={slot.id}
    >
      {isVisible ? (
        hasValidAdUnit ? (
          <ins
            className="adsbygoogle"
            style={getAdStyle()}
            data-ad-client={googleAdSenseId}
            data-ad-slot={slot.adUnitId}
            data-ad-format={slot.format}
            data-full-width-responsive={slot.responsive ? 'true' : 'false'}
          />
        ) : (
          // Placeholder عندما لا يوجد معرف إعلان صحيح
          <div 
            className="rounded-lg flex items-center justify-center text-gray-600 text-sm border-2 border-dashed"
            style={{ 
              minHeight: slot.height || 250,
              backgroundColor: '#f7e0c3',
              borderColor: '#f59e0b'
            }}
          >
            <div className="text-center p-4">
              <div className="text-2xl mb-2">📢</div>
              <div className="font-semibold">موضع إعلان</div>
              <div className="text-xs mt-1 opacity-75">قم بإضافة معرف الإعلان من الإعدادات</div>
            </div>
          </div>
        )
      ) : (
        // Placeholder أثناء الانتظار (Lazy Loading)
        <div 
          className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm"
          style={{ minHeight: slot.height || 250 }}
        >
          <div className="text-center">
            <div className="animate-pulse">⏳</div>
            <div className="mt-2">جاري تحميل الإعلان...</div>
          </div>
        </div>
      )}
    </div>
  )
}

