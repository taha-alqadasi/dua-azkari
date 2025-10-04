'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface CustomCodeSettings {
  headerCode?: string
  footerCode?: string
  customCss?: string
  customJs?: string
}

export function CustomCodeInjector() {
  const [settings, setSettings] = useState<CustomCodeSettings | null>(null)

  useEffect(() => {
    // جلب إعدادات الأكواد المخصصة
    fetch('/api/settings?group=customCode')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setSettings(result.data)
        }
      })
      .catch(err => console.error('Error fetching custom code settings:', err))
  }, [])

  useEffect(() => {
    if (!settings) return

    // حقن Header Code في <head>
    if (settings.headerCode) {
      const headerContainer = document.createElement('div')
      headerContainer.innerHTML = settings.headerCode
      
      // إضافة كل عنصر من Header Code إلى <head>
      Array.from(headerContainer.children).forEach(child => {
        document.head.appendChild(child.cloneNode(true))
      })
    }

    // حقن Custom CSS
    if (settings.customCss) {
      const styleElement = document.createElement('style')
      styleElement.id = 'custom-css-injected'
      styleElement.textContent = settings.customCss
      document.head.appendChild(styleElement)
    }

    // حقن Footer Code قبل </body>
    if (settings.footerCode) {
      const footerContainer = document.createElement('div')
      footerContainer.innerHTML = settings.footerCode
      
      Array.from(footerContainer.children).forEach(child => {
        document.body.appendChild(child.cloneNode(true))
      })
    }

    // حقن Custom JS
    if (settings.customJs) {
      const scriptElement = document.createElement('script')
      scriptElement.id = 'custom-js-injected'
      scriptElement.textContent = settings.customJs
      document.body.appendChild(scriptElement)
    }

    // Cleanup عند unmount
    return () => {
      // إزالة Custom CSS
      const customCss = document.getElementById('custom-css-injected')
      if (customCss) customCss.remove()

      // إزالة Custom JS
      const customJs = document.getElementById('custom-js-injected')
      if (customJs) customJs.remove()
    }
  }, [settings])

  return null
}

