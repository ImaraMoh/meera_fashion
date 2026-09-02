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
   * ------------------------------------------------------------
   * REAL PRODUCTS
   * ------------------------------------------------------------
   *
   * Select up to 4 products that actually exist in the database.
   *
   * No hard-coded product names.
   * No hard-coded images.
   * No fake likes.
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
        /**
         * Alternate platforms purely for presentation.
         *
         * The actual destination remains the real social
         * profile URL from BrandSettings.
         */
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
   * ------------------------------------------------------------
   * FORMAT CATEGORY
   * ------------------------------------------------------------
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
   * ------------------------------------------------------------
   * PRODUCT IMAGE
   * ------------------------------------------------------------
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

  return (
    <section className="py-16 bg-white border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ======================================================
            SECTION HEADER
        ====================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-rose-100">

          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.25em] text-[#9E315A] uppercase font-display">
              <Sparkles className="w-3.5 h-3.5 text-[#C94F7C]" />

              Social Community
            </span>

            <h2 className="text-3xl font-serif font-bold text-[#241B20] mt-1">
              Follow{' '}
              {settings.brandName ||
                'Meera Fashion'}
            </h2>

            <p className="text-sm text-[#6B5560] mt-2 max-w-xl">
              Explore our latest styles and
              discover pieces from the Meera Fashion
              collection across our social community.
            </p>
          </div>

          {/* ==================================================
              SOCIAL LINKS
          ================================================== */}
          <div className="flex flex-wrap items-center gap-3 mt-5 sm:mt-0">

            {/* TikTok */}
            {settings.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#FFF0F5] hover:bg-[#F8DDE7] text-[#9E315A] px-4 py-2 rounded-full text-xs font-bold transition-colors border border-rose-200"
              >
                <Music2 className="w-4 h-4" />

                <span>
                  TikTok{' '}
                  {settings.tiktokHandle || ''}
                </span>

                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Instagram */}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#9E315A] hover:bg-[#C94F7C] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm"
              >
                <Instagram className="w-4 h-4" />

                <span>
                  Instagram{' '}
                  {settings.instagramHandle || ''}
                </span>

                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
          </div>
        </div>

        {/* ======================================================
            PRODUCT SOCIAL GALLERY
        ====================================================== */}

        {socialProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

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
                    key={product.id || product.slug || product.name}
                    href={url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shadow-2xs hover:shadow-luxury transition-all duration-300 flex flex-col justify-end p-4"
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
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* ==================================================
                        DARK GRADIENT
                    ================================================== */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    {/* ==================================================
                        PLATFORM BADGE
                    ================================================== */}
                    <div className="absolute top-3 right-3 glass-dark text-white p-1.5 rounded-full">

                      {platform === 'TikTok' ? (
                        <Music2 className="w-3.5 h-3.5" />
                      ) : (
                        <Instagram className="w-3.5 h-3.5" />
                      )}

                    </div>

                    {/* ==================================================
                        PRODUCT CATEGORY BADGE
                    ================================================== */}
                    <div className="absolute top-3 left-3">

                      <span className="bg-white/90 backdrop-blur-sm text-[#9E315A] px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        {category}
                      </span>

                    </div>

                    {/* ==================================================
                        REEL PLAY ICON
                    ================================================== */}
                    {type === 'reel' && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform border border-white/30">

                        <Play className="w-4 h-4 fill-white ml-0.5" />

                      </div>
                    )}

                    {/* ==================================================
                        PRODUCT CONTENT
                    ================================================== */}
                    <div className="relative z-10 text-white">

                      <p className="text-sm font-semibold line-clamp-2 leading-snug">
                        {product.name}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2">

                        <span className="text-[10px] text-rose-200 truncate">
                          {platform === 'TikTok'
                            ? settings.tiktokHandle
                            : settings.instagramHandle}
                        </span>

                        <span className="flex items-center gap-1 text-[10px] text-rose-200 shrink-0">
                          <Heart className="w-3 h-3" />

                          {platform}
                        </span>

                      </div>
                    </div>

                  </a>
                );
              }
            )}

          </div>
        ) : (
          /* ====================================================
             NO PRODUCTS
          ==================================================== */
          <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-[#FFF7FA] to-white py-16 px-6 text-center">

            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#C94F7C]" />
            </div>

            <h3 className="text-xl font-serif font-bold text-[#241B20]">
              Discover Our Collection
            </h3>

            <p className="text-sm text-[#6B5560] mt-2 max-w-md mx-auto">
              Our latest products will appear here
              once they are available in the collection.
            </p>

          </div>
        )}

      </div>
    </section>
  );
};