import React from 'react';
import { Head } from 'vite-react-ssg';
import siteMetadata from '../../metadata.json';
import { SITE_URL } from '../data/config';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
  preloadImage?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path = '/',
  ogImage,
  ogType = 'website',
  keywords,
  preloadImage,
  jsonLd,
  noindex = false,
}) => {
  const routesMeta = (siteMetadata as unknown as {
    routes?: Record<string, { title?: string; description?: string; canonical?: string; ogType?: string; keywords?: string[] }>;
  }).routes || {};
  const routeConfig = routesMeta[path] || {};

  const finalTitle = title || routeConfig.title || siteMetadata.name;
  const finalDescription = description || routeConfig.description || siteMetadata.description;

  // Canonical rule:
  // Root '/' gets a trailing slash ('https://vaibhavgrand.in/')
  // All subpages get NO trailing slash ('https://vaibhavgrand.in/menu')
  // This consistently matches sitemap.xml and Cloudflare static directory outputs
  let canonicalUrl = routeConfig.canonical;
  if (canonicalUrl) {
    canonicalUrl = canonicalUrl
      .replace(/^https?:\/\/vaibhavgrand\.(com|in)/, SITE_URL)
      .replace(/^https?:\/\/vaibhav-grand\.vercel\.app/, SITE_URL);
  } else {
    const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
    canonicalUrl = cleanPath ? `${SITE_URL}/${cleanPath}` : `${SITE_URL}/`;
  }

  // Ensure og:image and twitter:image are absolute URLs on SITE_URL
  const toAbsoluteUrl = (imgUrl?: string): string => {
    if (!imgUrl) {
      return `${SITE_URL}/assets/images/chicken_mandi_hero_1789894879370.webp`;
    }
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl
        .replace(/^https?:\/\/vaibhavgrand\.(com|in)/, SITE_URL)
        .replace(/^https?:\/\/vaibhav-grand\.vercel\.app/, SITE_URL);
    }
    const clean = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
    return `${SITE_URL}${clean}`;
  };

  const finalOgImage = toAbsoluteUrl(ogImage || siteMetadata.defaultOgImage);
  const finalOgType = ogType || routeConfig.ogType || 'website';
  const finalKeywords = keywords || routeConfig.keywords || [];

  return (
    <Head>
      {/* Primary Meta */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {finalKeywords.length > 0 && (
        <meta name="keywords" content={finalKeywords.join(', ')} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={finalOgType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:site_name" content={siteMetadata.name} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* LCP Image Preload */}
      {preloadImage && (
        <link rel="preload" as="image" href={preloadImage} fetchPriority="high" />
      )}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Head>
  );
};
