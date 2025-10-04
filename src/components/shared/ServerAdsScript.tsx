import { prisma } from '@/lib/prisma'
import Script from 'next/script'

async function getAdsSettings() {
  try {
    const adsSettings = await prisma.setting.findUnique({
      where: { settingKey: 'ads' }
    })
    return adsSettings?.settingValue as any || {}
  } catch (error) {
    console.error('Error fetching ads settings:', error)
    return {}
  }
}

/**
 * Server Component لحقن سكريبت AdSense في الـ head
 * يظهر في view-source ويحسن SEO
 */
export async function ServerAdsScript() {
  const settings = await getAdsSettings()

  // إذا لم تكن الإعلانات مفعلة أو لا يوجد Publisher ID
  if (!settings.enabled || !settings.publisherId) {
    return null
  }

  return (
    <>
      {/* Google AdSense Script */}
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      {/* تهيئة AdSense */}
      <Script
        id="adsense-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 0;
          `
        }}
      />
    </>
  )
}

