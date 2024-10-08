import { Seo } from '@/types/seo'
import qs from 'qs'

/**
 * Get full Strapi URL from path
 * @param {string} path Path of the URL
 * @returns {string} Full Strapi URL
 */
export function getStrapiURL(path: string = ''): string {
  // Default to the server-side URL
  let url = process.env.STRAPI_API_URL

  // When on the client-side (in the browser), use the environment variable
  if (typeof window !== 'undefined') {
    url = process.env.NEXT_PUBLIC_STRAPI_API_URL
  }

  return `${url}${path}`
}

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @returns Parsed API call response
 */
export async function fetchAPI<T>(
  path: string,
  urlParamsObject: object = {},
  options: object = {},
): Promise<{
  data: T
  meta: {
    pagination: {
      start: number
      limit: number
      total: number
    }
  }
}> {
  // Merge default and user options
  const cache =
    process.env.NODE_ENV === 'development'
      ? 'no-store'
      : ('force-cache' as RequestCache)

  const mergedOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    cache,
    ...options,
  }

  // Build request URL
  const queryString = qs.stringify(urlParamsObject)
  const requestUrl = `${getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ''}`)}`

  // Trigger API call
  const response = await fetch(requestUrl, mergedOptions)

  // Handle response
  if (!response.ok) {
    console.error(response.statusText)
    throw new Error(`An error occured please try again`)
  }
  const res = await response.json()
  return {
    data: res.data,
    meta: res.meta,
  }
}

/**
 * Get public site URL
 * @returns {string} Public site URL
 */
export function getPublicSiteURL() {
  let publicSiteUrl = 'http://localhost:3000'
  if (
    typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SITE_URL.length > 0
  ) {
    publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  }
  return publicSiteUrl
}

/**
 * generateSeoMeta
 * @param path
 * @param seo
 * @param type
 * @param locale
 * @returns
 */
export function generateSeoMeta(
  path: string,
  seo: Seo,
  type: string,
  locale: string,
) {
  const publicSiteUrl = getPublicSiteURL()

  // Find the first Facebook and Twitter entries in metaSocial
  const facebookData = seo.metaSocial.find(
    (entry) => entry.socialNetwork === 'Facebook',
  )
  const twitterData = seo.metaSocial.find(
    (entry) => entry.socialNetwork === 'Twitter',
  )

  return {
    metadataBase: new URL(publicSiteUrl),
    alternates: {
      canonical: seo.canonicalURL ?? `${publicSiteUrl}/${path}`,
    },
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords,
    openGraph: {
      title: facebookData?.title || seo.metaTitle,
      description: facebookData?.description || seo.metaDescription,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: facebookData
        ? [
            {
              url: facebookData.image.data.attributes.url,
              width: facebookData.image.data.attributes.width,
              height: facebookData.image.data.attributes.height,
            },
          ]
        : [
            {
              url: seo.metaImage.data.attributes.url,
              width: seo.metaImage.data.attributes.width,
              height: seo.metaImage.data.attributes.height,
            },
          ],
      locale: locale,
      type: type,
    },
    twitter: {
      cardType: 'summary_large_image',
      title: twitterData?.title || seo.metaTitle,
      description: twitterData?.description || seo.metaDescription,
      images: twitterData
        ? [twitterData.image.data.attributes.url]
        : [seo.metaImage.data.attributes.url],
    },
  }
}
