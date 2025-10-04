'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface MetaSettings {
  webmaster: {
    googleVerification?: string
    yandexVerification?: string
    bingVerification?: string
    baiduVerification?: string
    googleAnalyticsId?: string
    googleTagManagerId?: string
    noindex?: boolean
  }
}

export function DynamicMetaTags() {
  const [settings, setSettings] = useState<MetaSettings | null>(null)

  useEffect(() => {
    // جلب الإعدادات
    fetch('/api/settings?group=webmaster')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setSettings({ webmaster: result.data })
        }
      })
      .catch(err => console.error('Error fetching webmaster settings:', err))
  }, [])

  useEffect(() => {
    if (!settings) return

    const { webmaster } = settings

    // إزالة أي meta tags قديمة أولاً
    const oldMetaTags = document.querySelectorAll(
      'meta[name="google-site-verification"], meta[name="yandex-verification"], meta[name="msvalidate.01"], meta[name="baidu-site-verification"]'
    )
    oldMetaTags.forEach(tag => tag.remove())

    // إضافة meta verification tags ديناميكياً
    if (webmaster.googleVerification) {
      const googleMeta = document.createElement('meta')
      googleMeta.name = 'google-site-verification'
      googleMeta.content = webmaster.googleVerification
      googleMeta.setAttribute('data-injected', 'true')
      document.head.appendChild(googleMeta)
    }

    if (webmaster.yandexVerification) {
      const yandexMeta = document.createElement('meta')
      yandexMeta.name = 'yandex-verification'
      yandexMeta.content = webmaster.yandexVerification
      yandexMeta.setAttribute('data-injected', 'true')
      document.head.appendChild(yandexMeta)
    }

    if (webmaster.bingVerification) {
      const bingMeta = document.createElement('meta')
      bingMeta.name = 'msvalidate.01'
      bingMeta.content = webmaster.bingVerification
      bingMeta.setAttribute('data-injected', 'true')
      document.head.appendChild(bingMeta)
    }

    if (webmaster.baiduVerification) {
      const baiduMeta = document.createElement('meta')
      baiduMeta.name = 'baidu-site-verification'
      baiduMeta.content = webmaster.baiduVerification
      baiduMeta.setAttribute('data-injected', 'true')
      document.head.appendChild(baiduMeta)
    }

    // Cleanup function
    return () => {
      // إزالة meta tags عند unmount
      const metaTags = document.querySelectorAll('meta[data-injected="true"]')
      metaTags.forEach(tag => tag.remove())
    }
  }, [settings])

  if (!settings) return null

  const { webmaster } = settings

  return (
    <>
      {/* Google Analytics */}
      {webmaster.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${webmaster.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${webmaster.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {webmaster.googleTagManagerId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${webmaster.googleTagManagerId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${webmaster.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
    </>
  )
}

