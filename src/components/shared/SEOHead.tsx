'use client'

import { useEffect } from 'react'

interface SEOHeadProps {
  webmasterSettings: {
    googleVerification?: string
    yandexVerification?: string
    bingVerification?: string
    baiduVerification?: string
    googleAnalyticsId?: string
    googleTagManagerId?: string
    noindex?: boolean
  }
}

export function SEOHead({ webmasterSettings }: SEOHeadProps) {
  useEffect(() => {
    // إضافة Google Analytics
    if (webmasterSettings.googleAnalyticsId) {
      const script1 = document.createElement('script')
      script1.async = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${webmasterSettings.googleAnalyticsId}`
      document.head.appendChild(script1)

      const script2 = document.createElement('script')
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${webmasterSettings.googleAnalyticsId}');
      `
      document.head.appendChild(script2)
    }

    // إضافة Google Tag Manager
    if (webmasterSettings.googleTagManagerId) {
      const script = document.createElement('script')
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${webmasterSettings.googleTagManagerId}');
      `
      document.head.appendChild(script)

      // إضافة noscript iframe
      const noscript = document.createElement('noscript')
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${webmasterSettings.googleTagManagerId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `
      document.body.insertBefore(noscript, document.body.firstChild)
    }

    // إضافة meta tags للتحقق
    if (webmasterSettings.googleVerification) {
      const meta = document.createElement('meta')
      meta.name = 'google-site-verification'
      meta.content = webmasterSettings.googleVerification
      document.head.appendChild(meta)
    }

    if (webmasterSettings.yandexVerification) {
      const meta = document.createElement('meta')
      meta.name = 'yandex-verification'
      meta.content = webmasterSettings.yandexVerification
      document.head.appendChild(meta)
    }

    if (webmasterSettings.bingVerification) {
      const meta = document.createElement('meta')
      meta.name = 'msvalidate.01'
      meta.content = webmasterSettings.bingVerification
      document.head.appendChild(meta)
    }

    if (webmasterSettings.baiduVerification) {
      const meta = document.createElement('meta')
      meta.name = 'baidu-site-verification'
      meta.content = webmasterSettings.baiduVerification
      document.head.appendChild(meta)
    }

    if (webmasterSettings.noindex) {
      const meta = document.createElement('meta')
      meta.name = 'robots'
      meta.content = 'noindex, nofollow'
      document.head.appendChild(meta)
    }
  }, [webmasterSettings])

  return null
}

