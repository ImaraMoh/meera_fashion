import React, { useMemo } from 'react';
import {
  Instagram,
  Music2,
  ExternalLink,
  Heart,
  Play,
  Sparkles,
} from 'lucide-react';

import type { BrandSettings, Product } from '../../types';

import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface SocialShowcaseProps {
  settings: BrandSettings;
  products?: Product[];
}

interface SocialProduct {
  product: Product;
  platform: 'Instagram' | 'TikTok';
  url: string;
  type: 'photo' | 'reel';
}

export const SocialShowcase: React.FC<SocialShowcaseProps> = ({
  settings,
  products = [],
}) => {
  /**
   * ============================================================
   * REAL PRODUCTS
   * ============================================================
   *
   * Only products that actually exist in the database
   * are displayed.
   */
  const socialProducts = useMemo<SocialProduct[]>(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    const validProducts = products.filter((product) => {
      if (!product) return false;

      const hasName = Boolean(
        String(product.name || '').trim()
      );

      const hasImage = Boolean(
        product.images?.main ||
          product.images?.thumbnail
      );

      return hasName && hasImage;
    });

    return validProducts
      .slice(0, 4)
      .map((product, index) => {
        const isTikTok = index % 2 === 0;

        return {
          product,
          platform: isTikTok
            ? 'TikTok'
            : 'Instagram',
          url: isTikTok
            ? settings.tiktokUrl
            : settings.instagramUrl,
          type: isTikTok
            ? 'reel'
            : 'photo',
        };
      });
  }, [
    products,
    settings.tiktokUrl,
    settings.instagramUrl,
  ]);

  /**
   * ============================================================
   * FORMAT CATEGORY
   * ============================================================
   */
  const formatCategory = (
    category?: string
  ) => {
    if (!category) {
      return 'Meera Fashion';
    }

    return category
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  /**
   * ============================================================
   * PRODUCT IMAGE
   * ============================================================
   */
  const getProductImage = (
    product: Product
  ) => {
    return (
      product.images?.main ||
      product.images?.thumbnail ||
      ''
    );
  };

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <section className="relative overflow-hidden border-t border-rose-100 bg-white py-10 sm:py-14 lg:py-16">

      {/* ======================================================
          SUBTLE BACKGROUND FLOURISHES
      ====================================================== */}

      <div className="pointer-events-none absolute -right-32 top-10 h-64 w-64 rounded-full bg-[#C94F7C]/5 blur-3xl" />

      <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-[#B76E79]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* ======================================================
            SECTION HEADER
        ====================================================== */}

        <div className="mb-5 flex flex-col gap-3 border-b border-rose-100 pb-4 sm:mb-8 sm:pb-5 md:flex-row md:items-end md:justify-between lg:mb-10">

          {/* Heading */}

          <div className="min-w-0">

            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9E315A] sm:text-xs sm:tracking-[0.25em]">

              <Sparkles className="h-3 w-3 text-[#C94F7C] sm:h-3.5 sm:w-3.5" />

              Social Community

            </span>

            <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-[#241B20] sm:text-3xl">

              Follow{' '}

              {settings.brandName ||
                'Meera Fashion'}

            </h2>

            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#6B5560] sm:mt-2 sm:text-sm">

              Explore our latest styles and
              discover pieces from the Meera Fashion
              collection across our social community.

            </p>

          </div>

          {/* ==================================================
              SOCIAL LINKS
          ================================================== */}

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">

            {/* TikTok */}

            {settings.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-[#FFF0F5] px-2.5 py-2 text-[10px] font-bold text-[#9E315A] transition-colors hover:bg-[#F8DDE7] sm:flex-none sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
              >

                <Music2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />

                <span className="truncate">
                  TikTok{' '}
                  <span className="hidden sm:inline">
                    {settings.tiktokHandle || ''}
                  </span>
                </span>

                <ExternalLink className="hidden h-3 w-3 shrink-0 opacity-60 sm:block" />

              </a>
            )}

            {/* Instagram */}

            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#9E315A] px-2.5 py-2 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-[#C94F7C] sm:flex-none sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
              >

                <Instagram className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />

                <span className="truncate">
                  Instagram{' '}
                  <span className="hidden sm:inline">
                    {settings.instagramHandle || ''}
                  </span>
                </span>

                <ExternalLink className="hidden h-3 w-3 shrink-0 opacity-70 sm:block" />

              </a>
            )}

          </div>

        </div>

        {/* ======================================================
            PRODUCT SOCIAL GALLERY
        ====================================================== */}

        {socialProducts.length > 0 ? (
          <>
            {/* ==================================================
                MOBILE GALLERY
                Horizontal swipe instead of vertical stacking
            ================================================== */}

            <div
              className="flex gap-3 overflow-x-auto pb-2 sm:hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >

              {socialProducts.map(
                ({
                  product,
                  platform,
                  url,
                  type,
                }) => {
                  const image =
                    getProductImage(product);

                  const category =
                    formatCategory(
                      String(
                        product.category || ''
                      )
                    );

                  return (
                    <a
                      key={
                        product.id ||
                        product.slug ||
                        product.name
                      }
                      href={url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative h-[300px] w-[78vw] max-w-[310px] shrink-0 overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 shadow-sm"
                    >

                      {/* Product Image */}

                      <img
                        src={getOptimizedImageUrl(
                          image,
                          {
                            width: 450,
                            quality: 70,
                          }
                        )}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(event) =>
                          handleImageError(
                            event,
                            'saree'
                          )
                        }
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Gradient */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90" />

                      {/* Platform */}

                      <div className="absolute right-3 top-3 rounded-full bg-black/45 p-2 text-white backdrop-blur-md">

                        {platform === 'TikTok' ? (
                          <Music2 className="h-3.5 w-3.5" />
                        ) : (
                          <Instagram className="h-3.5 w-3.5" />
                        )}

                      </div>

                      {/* Category */}

                      <div className="absolute left-3 top-3">

                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#9E315A] shadow-sm backdrop-blur-sm">
                          {category}
                        </span>

                      </div>

                      {/* Reel */}

                      {type === 'reel' && (
                        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/25 text-white backdrop-blur-md">

                          <Play className="ml-0.5 h-4 w-4 fill-white" />

                        </div>
                      )}

                      {/* Product Info */}

                      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white">

                        <p className="line-clamp-2 text-sm font-semibold leading-snug">
                          {product.name}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">

                          <span className="truncate text-[10px] text-rose-200">
                            {platform === 'TikTok'
                              ? settings.tiktokHandle
                              : settings.instagramHandle}
                          </span>

                          <span className="flex shrink-0 items-center gap-1 text-[10px] text-rose-200">

                            <Heart className="h-3 w-3" />

                            {platform}

                          </span>

                        </div>

                      </div>

                    </a>
                  );
                }
              )}

            </div>

            {/* Mobile swipe hint */}

            {socialProducts.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-[#A47786] sm:hidden">

                <span>
                  Swipe to explore
                </span>

                <span className="text-[#C94F7C]">
                  →
                </span>

              </div>
            )}

            {/* ==================================================
                TABLET + DESKTOP GALLERY
            ================================================== */}

            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">

              {socialProducts.map(
                ({
                  product,
                  platform,
                  url,
                  type,
                }) => {
                  const image =
                    getProductImage(product);

                  const category =
                    formatCategory(
                      String(
                        product.category || ''
                      )
                    );

                  return (
                    <a
                      key={
                        product.id ||
                        product.slug ||
                        product.name
                      }
                      href={url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-2xs transition-all duration-300 hover:shadow-luxury"
                    >

                      {/* ==================================================
                          PRODUCT IMAGE
                      ================================================== */}

                      <img
                        src={getOptimizedImageUrl(
                          image,
                          {
                            width: 450,
                            quality: 70,
                          }
                        )}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(event) =>
                          handleImageError(
                            event,
                            'saree'
                          )
                        }
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* ==================================================
                          GRADIENT
                      ================================================== */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />

                      {/* ==================================================
                          PLATFORM BADGE
                      ================================================== */}

                      <div className="absolute right-3 top-3 rounded-full bg-black/45 p-1.5 text-white backdrop-blur-md">

                        {platform === 'TikTok' ? (
                          <Music2 className="h-3.5 w-3.5" />
                        ) : (
                          <Instagram className="h-3.5 w-3.5" />
                        )}

                      </div>

                      {/* ==================================================
                          CATEGORY BADGE
                      ================================================== */}

                      <div className="absolute left-3 top-3">

                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#9E315A] shadow-sm backdrop-blur-sm">
                          {category}
                        </span>

                      </div>

                      {/* ==================================================
                          REEL PLAY ICON
                      ================================================== */}

                      {type === 'reel' && (
                        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/30 text-white backdrop-blur-md transition-transform group-hover:scale-110">

                          <Play className="ml-0.5 h-4 w-4 fill-white" />

                        </div>
                      )}

                      {/* ==================================================
                          PRODUCT CONTENT
                      ================================================== */}

                      <div className="relative z-10 flex h-full flex-col justify-end text-white">

                        <p className="line-clamp-2 text-sm font-semibold leading-snug">
                          {product.name}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">

                          <span className="truncate text-[10px] text-rose-200">
                            {platform === 'TikTok'
                              ? settings.tiktokHandle
                              : settings.instagramHandle}
                          </span>

                          <span className="flex shrink-0 items-center gap-1 text-[10px] text-rose-200">

                            <Heart className="h-3 w-3" />

                            {platform}

                          </span>

                        </div>

                      </div>

                    </a>
                  );
                }
              )}

            </div>
          </>
        ) : (
          /* ====================================================
             NO PRODUCTS
          ==================================================== */

          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-[#FFF7FA] to-white px-5 py-10 text-center sm:rounded-3xl sm:px-6 sm:py-16">

            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 sm:mb-4 sm:h-14 sm:w-14">

              <Sparkles className="h-5 w-5 text-[#C94F7C] sm:h-6 sm:w-6" />

            </div>

            <h3 className="font-serif text-lg font-bold text-[#241B20] sm:text-xl">
              Discover Our Collection
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[#6B5560] sm:mt-2 sm:text-sm">
              Our latest products will appear here
              once they are available in the collection.
            </p>

          </div>
        )}

      </div>

    </section>
  );
};