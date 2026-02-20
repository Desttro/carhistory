import { Fragment, memo } from 'react'
import { isWeb } from 'tamagui'

import { APP_NAME } from '~/constants/app'
import { DEFAULT_LOCALE, LOCALE_META, SUPPORTED_LOCALES } from '~/i18n/locales'

const DEFAULT_OG_IMAGE = `${process.env.ONE_SERVER_URL}/og.jpg`
const DOMAIN = process.env.ONE_SERVER_URL || ''

export const HeadInfo = memo(function HeadInfo({
  title,
  description,
  canonicalUrl,
  currentPath,
  openGraph,
}: {
  title?: string
  description?: string
  canonicalUrl?: string
  currentPath?: string
  openGraph?: {
    type?: string
    locale?: string
    url?: string
    siteName?: string
    images?: { url: string; width?: number; height?: number }[]
  }
}) {
  if (!isWeb) {
    return null
  }

  const fullTitle = title?.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`
  const ogImages = openGraph?.images ?? [
    { url: DEFAULT_OG_IMAGE, width: 1200, height: 630 },
  ]

  return (
    <>
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {title && (
        <>
          <title>{fullTitle}</title>
          <meta property="og:title" content={fullTitle} />
        </>
      )}

      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
        </>
      )}

      {ogImages.map((image) => {
        return (
          <Fragment key={image.url}>
            <meta property="og:image" content={image.url} />
            <meta property="twitter:image" content={image.url} />
            {image.width && <meta property="og:image:width" content={`${image.width}`} />}
            {image.height && (
              <meta property="og:image:height" content={`${image.height}`} />
            )}
          </Fragment>
        )
      })}

      {openGraph && (
        <>
          {openGraph.url && (
            <>
              <meta property="og:url" content={openGraph.url} />
              <meta property="og:type" content="website" />
            </>
          )}

          <meta property="og:locale" content={openGraph.locale ?? 'en_US'} />
          <meta property="og:site_name" content={openGraph.siteName || APP_NAME} />
        </>
      )}

      {currentPath && DOMAIN && (
        <>
          {SUPPORTED_LOCALES.map((loc) => (
            <link
              key={loc}
              rel="alternate"
              hrefLang={LOCALE_META[loc].bcp47}
              href={`${DOMAIN}${loc === DEFAULT_LOCALE ? '' : `/${loc}`}${currentPath}`}
            />
          ))}
          <link rel="alternate" hrefLang="x-default" href={`${DOMAIN}${currentPath}`} />
        </>
      )}
    </>
  )
})
