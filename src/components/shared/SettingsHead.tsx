import { GeneralSettings, WebmasterSettings } from '@/types/settings.types'
import Script from 'next/script'

interface SettingsHeadProps {
  generalSettings: GeneralSettings
  webmasterSettings: WebmasterSettings
}

export function SettingsHead({ generalSettings, webmasterSettings }: SettingsHeadProps) {
  return (
    <>
      {/* Favicon */}
      {generalSettings.faviconUrl && (
        <>
          <link rel="icon" href={generalSettings.faviconUrl} />
          <link rel="shortcut icon" href={generalSettings.faviconUrl} />
        </>
      )}

      {/* Meta Tags for Webmaster Tools */}
      {webmasterSettings.googleVerification && (
        <meta name="google-site-verification" content={webmasterSettings.googleVerification} />
      )}

      {webmasterSettings.yandexVerification && (
        <meta name="yandex-verification" content={webmasterSettings.yandexVerification} />
      )}

      {webmasterSettings.bingVerification && (
        <meta name="msvalidate.01" content={webmasterSettings.bingVerification} />
      )}

      {webmasterSettings.baiduVerification && (
        <meta name="baidu-site-verification" content={webmasterSettings.baiduVerification} />
      )}

      {/* Robots meta tag */}
      {webmasterSettings.noindex && (
        <meta name="robots" content="noindex, nofollow" />
      )}

      {/* Google Analytics */}
      {webmasterSettings.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${webmasterSettings.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${webmasterSettings.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {webmasterSettings.googleTagManagerId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${webmasterSettings.googleTagManagerId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${webmasterSettings.googleTagManagerId}`}
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

