import { prisma } from '@/lib/prisma'
import Script from 'next/script'

// مكون لحقن HTML خام بدون wrapper (يحل مشكلة Hydration)
function RawHTML({ html }: { html: string }) {
  // استخراج script و style tags والمحتوى الآخر
  const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || []
  const styleMatches = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/gi) || []
  const metaMatches = html.match(/<meta\b[^>]*\/?>/gi) || []
  const linkMatches = html.match(/<link\b[^>]*\/?>/gi) || []

  return (
    <>
      {metaMatches.map((meta, i) => (
        <meta key={`meta-${i}`} {...parseHTMLAttributes(meta)} />
      ))}
      {linkMatches.map((link, i) => (
        <link key={`link-${i}`} {...parseHTMLAttributes(link)} />
      ))}
      {styleMatches.map((style, i) => {
        const content = style.replace(/<\/?style[^>]*>/gi, '')
        return <style key={`style-${i}`} dangerouslySetInnerHTML={{ __html: content }} />
      })}
      {scriptMatches.map((script, i) => {
        const content = script.replace(/<\/?script[^>]*>/gi, '')
        return <Script key={`script-${i}`} id={`custom-header-${i}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: content }} />
      })}
    </>
  )
}

// دالة مساعدة لاستخراج attributes من HTML string
function parseHTMLAttributes(htmlString: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const attrRegex = /(\w+)=["']([^"']+)["']/g
  let match
  while ((match = attrRegex.exec(htmlString)) !== null) {
    attrs[match[1]] = match[2]
  }
  return attrs
}

async function getSettings() {
  try {
    const [webmaster, customCode, general] = await Promise.all([
      prisma.setting.findUnique({
        where: { settingKey: 'webmaster' }
      }),
      prisma.setting.findUnique({
        where: { settingKey: 'customCode' }
      }),
      prisma.setting.findUnique({
        where: { settingKey: 'general' }
      })
    ])

    return {
      webmaster: webmaster?.settingValue as any || {},
      customCode: customCode?.settingValue as any || {},
      general: general?.settingValue as any || {}
    }
  } catch (error) {
    console.error('[ServerMetaTags] Error fetching settings:', error)
    return {
      webmaster: {},
      customCode: {},
      general: {}
    }
  }
}

export async function ServerMetaTags() {
  const { webmaster, customCode, general } = await getSettings()

  return (
    <>
      {/* Favicon - توحيد الفافيكون في جميع الصفحات */}
      {general.faviconUrl && (
        <>
          <link rel="icon" href={general.faviconUrl} />
          <link rel="shortcut icon" href={general.faviconUrl} />
          <link rel="apple-touch-icon" href={general.faviconUrl} />
        </>
      )}

      {/* Meta Verification Tags */}
      {webmaster.googleVerification && (
        <meta name="google-site-verification" content={webmaster.googleVerification} />
      )}
      {webmaster.yandexVerification && (
        <meta name="yandex-verification" content={webmaster.yandexVerification} />
      )}
      {webmaster.bingVerification && (
        <meta name="msvalidate.01" content={webmaster.bingVerification} />
      )}
      {webmaster.baiduVerification && (
        <meta name="baidu-site-verification" content={webmaster.baiduVerification} />
      )}

      {/* Custom Header Code - Raw HTML injection without wrapper */}
      {customCode.headerCode && (
        <RawHTML html={customCode.headerCode} />
      )}

      {/* Custom CSS */}
      {customCode.customCss && (
        <style dangerouslySetInnerHTML={{ __html: customCode.customCss }} />
      )}

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
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${webmaster.googleTagManagerId}');
          `}
        </Script>
      )}
    </>
  )
}

// مكون Footer HTML
function RawFooterHTML({ html }: { html: string }) {
  const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || []
  const divMatches = html.match(/<div\b[^>]*>([\s\S]*?)<\/div>/gi) || []

  return (
    <>
      {divMatches.map((div, i) => {
        const content = div.replace(/<\/?div[^>]*>/gi, '')
        return <div key={`footer-div-${i}`} dangerouslySetInnerHTML={{ __html: content }} />
      })}
      {scriptMatches.map((script, i) => {
        const content = script.replace(/<\/?script[^>]*>/gi, '')
        return <Script key={`footer-script-${i}`} id={`custom-footer-${i}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: content }} />
      })}
    </>
  )
}

export async function ServerFooterScripts() {
  const { webmaster, customCode } = await getSettings()

  return (
    <>
      {/* Google Tag Manager (noscript) */}
      {webmaster.googleTagManagerId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${webmaster.googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}

      {/* Custom Footer Code - Raw HTML injection */}
      {customCode.footerCode && (
        <RawFooterHTML html={customCode.footerCode} />
      )}

      {/* Custom JavaScript */}
      {customCode.customJs && (
        <Script 
          id="custom-js" 
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: customCode.customJs }} 
        />
      )}
    </>
  )
}

