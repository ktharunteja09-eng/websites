import React from 'react';
import { Helmet } from 'react-helmet-async';
import siteMetadata from '../../metadata.json';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
  preloadImage?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
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
}) => {
  const routesMeta = (siteMetadata as unknown as { routes?: Record<string, { title?: string; description?: string; canonical?: string; ogType?: string; keywords?: string[] }> }).routes || {};
  const routeConfig = routesMeta[path] || {};

  const siteUrl = siteMetadata.siteUrl || 'https://vaibhavgrand.com';
  const finalTitle = title || routeConfig.title || siteMetadata.name;
  const finalDescription = description || routeConfig.description || siteMetadata.description;
  const canonicalUrl = routeConfig.canonical || `${siteUrl}${path === '/' ? '' : path}`;
  const finalOgImage = ogImage || siteMetadata.defaultOgImage || `${siteUrl}/assets/vaibhav-grand-webp-images/front6.webp`;
  const finalOgType = ogType || routeConfig.ogType || 'website';
  const finalKeywords = keywords || routeConfig.keywords || [];

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />
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
    </Helmet>
  );
};
