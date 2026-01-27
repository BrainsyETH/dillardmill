/**
 * SEO Metadata Helpers
 * 
 * Generate Open Graph and Twitter Card metadata for pages.
 */

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article';
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphMetadata(data: OpenGraphData) {
  return {
    title: data.title,
    description: data.description,
    url: data.url,
    siteName: 'Pine Valley Lodging & Events',
    images: [
      {
        url: data.image,
        width: 1200,
        height: 630,
        alt: data.title,
      },
    ],
    locale: 'en_US',
    type: data.type || 'website',
  };
}

/**
 * Generate Twitter Card metadata
 */
export function generateTwitterMetadata(data: OpenGraphData) {
  return {
    card: 'summary_large_image',
    title: data.title,
    description: data.description,
    images: [data.image],
  };
}

/**
 * Generate complete metadata object for Next.js
 */
export function generatePageMetadata(data: OpenGraphData) {
  return {
    title: data.title,
    description: data.description,
    openGraph: generateOpenGraphMetadata(data),
    twitter: generateTwitterMetadata(data),
  };
}
