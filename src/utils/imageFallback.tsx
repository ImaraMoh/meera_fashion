import React, { useState } from 'react';

export const DEFAULT_FALLBACK_IMAGE = '/src/assets/images/meera_hero_model_1788152289614.jpg';
export const JEWELLERY_FALLBACK_IMAGE = '/src/assets/images/meera_jewellery_bangles_1788152322855.jpg';
export const PERFORMANCE_FALLBACK_IMAGE = '/src/assets/images/meera_performance_set_1788152305062.jpg';

export type ImageFallbackCategory = 'saree' | 'jewellery' | 'performance' | 'general';

/**
 * Automatically optimizes and compresses external image URLs (e.g. Unsplash)
 * by applying modern auto=format (WebP/AVIF), width constraints, and optimal quality compression.
 */
export const getOptimizedImageUrl = (
  url?: string | null,
  options?: {
    width?: number;
    quality?: number;
    fallbackType?: ImageFallbackCategory;
  }
): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    if (options?.fallbackType === 'jewellery') return JEWELLERY_FALLBACK_IMAGE;
    if (options?.fallbackType === 'performance') return PERFORMANCE_FALLBACK_IMAGE;
    return DEFAULT_FALLBACK_IMAGE;
  }

  const trimmed = url.trim();

  // If it's already a local asset or data URL, return as-is
  if (trimmed.startsWith('data:') || trimmed.startsWith('/src/assets') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Optimize Unsplash images dynamically
  if (trimmed.includes('images.unsplash.com')) {
    const width = options?.width || 500;
    const quality = options?.quality || 68;
    try {
      // Split base URL from search params
      const baseUrl = trimmed.split('?')[0];
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackType: ImageFallbackCategory = 'general'
) => {
  const target = e.currentTarget;
  // Prevent infinite error loop if fallback also fails
  if (target.dataset.hasFallback === 'true') {
    return;
  }
  target.dataset.hasFallback = 'true';

  if (fallbackType === 'jewellery') {
    target.src = JEWELLERY_FALLBACK_IMAGE;
  } else if (fallbackType === 'performance') {
    target.src = PERFORMANCE_FALLBACK_IMAGE;
  } else {
    target.src = DEFAULT_FALLBACK_IMAGE;
  }
};

/**
 * Reusable high-performance lazy-loaded image component
 * Renders an optimized skeleton placeholder while loading and fades in seamlessly.
 */
export type OptimizedImgProps = React.ComponentProps<'img'> & {
  src: string;
  fallbackType?: ImageFallbackCategory;
  targetWidth?: number;
  targetQuality?: number;
  containerClassName?: string;
};

export const OptimizedImg = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackType = 'general',
  targetWidth = 500,
  targetQuality = 68,
  loading = 'lazy',
  ...props
}: OptimizedImgProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const optimizedSrc = getOptimizedImageUrl(src, {
    width: targetWidth,
    quality: targetQuality,
    fallbackType,
  });

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer skeleton placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/40 via-rose-50/80 to-rose-100/40 animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        alt={alt || 'Meera Boutique Collection'}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setIsLoaded(true);
          handleImageError(e, fallbackType);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

