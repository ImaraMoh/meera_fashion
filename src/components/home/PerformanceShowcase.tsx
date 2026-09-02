import React, { useMemo } from 'react';
import {
  Sparkles,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';

import type { Product, BrandSettings } from '../../types';
import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface PerformanceShowcaseProps {
  performanceProduct: Product;
  settings?: BrandSettings;
  onQuickView: (product: Product) => void;
  onAddToSelection: (product: Product) => void;
  onOpenWhatsAppForProduct: (product: Product) => void;
}

export const PerformanceShowcase: React.FC<
  PerformanceShowcaseProps
> = ({
  performanceProduct,
  settings,
  onQuickView,
  onAddToSelection,
  onOpenWhatsAppForProduct,
}) => {
  /**
   * ------------------------------------------------------------
   * Currency
   * ------------------------------------------------------------
   */
  const currencyCode =
    settings?.currencyCode || 'LKR';

  const formatCurrency = (
    value: number | string | undefined | null
  ) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return '';
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(numericValue);
    } catch {
      return `${
        settings?.currencySymbol || currencyCode
      } ${numericValue.toLocaleString()}`;
    }
  };

  /**
   * ------------------------------------------------------------
   * Actual Product
   * ------------------------------------------------------------
   */
  const product = performanceProduct;

  /**
   * ------------------------------------------------------------
   * Price
   * ------------------------------------------------------------
   */
  const price = Number(product?.price || 0);

  const originalPrice = Number(
    (product as Product & {
      originalPrice?: number | string;
    })?.originalPrice || 0
  );

  /**
   * ------------------------------------------------------------
   * Discount
   * ------------------------------------------------------------
   */
  const discountPercentage = useMemo(() => {
    if (
      !Number.isFinite(originalPrice) ||
      !Number.isFinite(price) ||
      originalPrice <= 0 ||
      price >= originalPrice
    ) {
      return 0;
    }

    return Math.round(
      ((originalPrice - price) / originalPrice) * 100
    );
  }, [price, originalPrice]);

  /**
   * ------------------------------------------------------------
   * Savings
   * ------------------------------------------------------------
   */
  const savings = useMemo(() => {
    if (
      !Number.isFinite(originalPrice) ||
      !Number.isFinite(price) ||
      originalPrice <= price
    ) {
      return 0;
    }

    return originalPrice - price;
  }, [price, originalPrice]);

  /**
   * ------------------------------------------------------------
   * Product Image
   * ------------------------------------------------------------
   */
  const productImage =
    product?.images?.main ||
    product?.images?.thumbnail ||
    '';

  /**
   * ------------------------------------------------------------
   * Stock Status
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * We DO NOT assume that missing stock information means
   * the product is out of stock.
   *
   * Out of stock only when:
   *
   * 1. Database explicitly says unavailable
   * OR
   * 2. A real numeric stock value exists and is <= 0
   *
   * If the DB doesn't contain a stock field, the product
   * will be treated as available.
   * ------------------------------------------------------------
   */

  const rawStockQuantity =
    (product as any)?.stockQuantity ??
    (product as any)?.stock ??
    (product as any)?.quantity;

  const hasStockQuantity =
    rawStockQuantity !== undefined &&
    rawStockQuantity !== null &&
    rawStockQuantity !== '';

  const stockQuantity = hasStockQuantity
    ? Number(rawStockQuantity)
    : null;

  /**
   * Explicit availability values from the DB.
   */
  const explicitlyUnavailable =
    (product as any)?.inStock === false ||
    (product as any)?.isAvailable === false ||
    (product as any)?.available === false;

  /**
   * Only mark out of stock when we actually know
   * that the product is unavailable.
   */
  const isOutOfStock =
    explicitlyUnavailable ||
    (stockQuantity !== null &&
      Number.isFinite(stockQuantity) &&
      stockQuantity <= 0);

  /**
   * Display stock label.
   */
  const stockLabel = isOutOfStock
    ? 'Currently Unavailable'
    : stockQuantity !== null &&
        Number.isFinite(stockQuantity) &&
        stockQuantity > 0
      ? `${stockQuantity} Available`
      : 'Available';

  /**
   * ------------------------------------------------------------
   * Product Highlights
   * ------------------------------------------------------------
   *
   * Generated from actual product information.
   * No fake specifications are added.
   */
  const highlights = useMemo(() => {
    const items: string[] = [];

    const category = String(
      product?.category || ''
    ).trim();

    const subcategory = String(
      (product as any)?.subcategory ||
        (product as any)?.subCategory ||
        ''
    ).trim();

    const material = String(
      (product as any)?.material || ''
    ).trim();

    const fabric = String(
      (product as any)?.fabric || ''
    ).trim();

    const occasion = String(
      (product as any)?.occasion || ''
    ).trim();

    const size = String(
      (product as any)?.size || ''
    ).trim();

    const color = String(
      (product as any)?.color || ''
    ).trim();

    if (category) {
      items.push(
        `${category.charAt(0).toUpperCase()}${category.slice(
          1
        )} collection`
      );
    }

    if (subcategory) {
      items.push(
        `Style: ${subcategory}`
      );
    }

    if (material) {
      items.push(
        `Material: ${material}`
      );
    } else if (fabric) {
      items.push(
        `Fabric: ${fabric}`
      );
    }

    if (occasion) {
      items.push(
        `Suitable for: ${occasion}`
      );
    }

    if (size) {
      items.push(
        `Available size: ${size}`
      );
    }

    if (color) {
      items.push(
        `Colour: ${color}`
      );
    }

    /**
     * If there isn't enough metadata, don't invent
     * product specifications.
     */
    if (items.length === 0) {
      if (product?.name) {
        items.push(
          `Authentic ${product.name} from ${
            settings?.brandName ||
            'Meera Fashion'
          }`
        );
      }

      if (product?.description) {
        items.push(
          'Product details available on inspection'
        );
      }

      items.push(
        'Contact us for availability and sizing'
      );
    }

    return items.slice(0, 4);
  }, [product, settings?.brandName]);

  /**
   * ------------------------------------------------------------
   * Product Description
   * ------------------------------------------------------------
   */
  const description =
    product?.description?.trim() ||
    `Explore this curated performance collection piece from ${
      settings?.brandName ||
      'Meera Fashion'
    }. Contact us for detailed sizing, availability and styling information.`;

  /**
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#FFF5F8] via-[#FFF0F5] to-[#F8DDE7]/40 relative overflow-hidden">

      {/* Background Flourishes */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#C94F7C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#B76E79]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ======================================================
            SECTION HEADER
        ====================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-rose-200/70">

          <div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#9E315A] uppercase mb-1">

              <Sparkles className="w-3.5 h-3.5 text-[#C94F7C]" />

              <span>
                Special Collection
              </span>

            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#241B20]">
              The Meera Performance Edit
            </h2>

            <p className="text-sm sm:text-base text-[#5A4550] mt-1 max-w-xl">
              Discover our curated performance collection,
              selected for elegant stage and cultural occasions.
            </p>

          </div>

          <div className="mt-4 md:mt-0">

            <span className="text-xs uppercase tracking-widest font-semibold text-[#8C5D6C] bg-white/80 border border-rose-200 px-3 py-1.5 rounded-full shadow-xs">

              {product?.category
                ? String(product.category).replace(
                    /^./,
                    (char) =>
                      char.toUpperCase()
                  )
                : 'Performance Collection'}

            </span>

          </div>

        </div>

        {/* ======================================================
            HERO PERFORMANCE SHOWCASE
        ====================================================== */}
        <div className="bg-white rounded-3xl border border-rose-200/80 shadow-luxury-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* ====================================================
              LEFT — PRODUCT IMAGE
          ==================================================== */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] bg-[#FFF0F5] flex items-center justify-center p-6 sm:p-8">

            <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center">

              <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden shadow-luxury border-2 border-white">

                {productImage ? (
                  <img
                    src={getOptimizedImageUrl(
                      productImage,
                      {
                        width: 750,
                        quality: 75,
                        fallbackType:
                          'performance',
                      }
                    )}
                    alt={
                      product?.name ||
                      'Performance collection product'
                    }
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) =>
                      handleImageError(
                        e,
                        'performance'
                      )
                    }
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">

                    <div className="text-center px-6">

                      <Sparkles className="w-10 h-10 text-[#C94F7C] mx-auto mb-3" />

                      <p className="text-sm font-medium text-[#9E315A]">
                        Product image unavailable
                      </p>

                    </div>

                  </div>
                )}

                {/* Product Category Badge */}
                <div className="absolute top-4 left-4 glass-dark text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                  Performance Collection
                </div>

                {/* Actual Discount */}
                {discountPercentage > 0 &&
                  savings > 0 && (
                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
                      Save{' '}
                      {formatCurrency(
                        savings
                      )}
                    </div>
                  )}

              </div>

            </div>

          </div>

          {/* ====================================================
              RIGHT — ACTUAL PRODUCT DETAILS
          ==================================================== */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-white to-[#FFF9FB]">

            <div>

              {/* Category + Stock */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

                <span className="text-xs font-bold tracking-widest text-[#C94F7C] uppercase">

                  {product?.category
                    ? String(
                        product.category
                      ).replace(
                        /^./,
                        (char) =>
                          char.toUpperCase()
                      )
                    : 'Featured Product'}

                </span>

                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isOutOfStock
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isOutOfStock
                    ? '✕ Out of Stock'
                    : `✓ ${stockLabel}`}
                </span>

              </div>

              {/* Product Name */}
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#241B20] mb-3 leading-tight">
                {product?.name ||
                  'Featured Performance Product'}
              </h3>

              {/* ==================================================
                  PRICING
              ================================================== */}
              <div className="flex flex-wrap items-baseline gap-3 mb-6">

                <span className="text-3xl font-serif font-bold text-[#9E315A]">
                  {formatCurrency(price)}
                </span>

                {originalPrice > price && (
                  <span className="text-lg text-[#8C5D6C] line-through font-light">
                    {formatCurrency(
                      originalPrice
                    )}
                  </span>
                )}

                {discountPercentage > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    {discountPercentage}% OFF
                  </span>
                )}

              </div>

              {/* ==================================================
                  DESCRIPTION
              ================================================== */}
              <p className="text-sm text-[#5A4550] leading-relaxed mb-6">
                {description}
              </p>

              {/* ==================================================
                  PRODUCT HIGHLIGHTS
              ================================================== */}
              <div className="space-y-2.5 mb-8">

                {highlights.map(
                  (item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3E2F37]"
                    >

                      <CheckCircle2 className="w-4 h-4 text-[#C94F7C] shrink-0 mt-0.5" />

                      <span>
                        {item}
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ====================================================
                ACTION BUTTONS
            ==================================================== */}
            <div className="pt-6 border-t border-rose-100 space-y-3">

              <div className="flex flex-col sm:flex-row items-center gap-3">

                {/* Add To Selection */}
                <button
                  type="button"
                  onClick={() =>
                    onAddToSelection(
                      product
                    )
                  }
                  disabled={isOutOfStock}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-5 rounded-xl font-semibold text-sm shadow-luxury transition-all cursor-pointer"
                >

                  <ShoppingBag className="w-4 h-4" />

                  <span>
                    {isOutOfStock
                      ? 'Currently Unavailable'
                      : 'Add to Selection'}
                  </span>

                </button>

                {/* Quick View */}
                <button
                  type="button"
                  onClick={() =>
                    onQuickView(product)
                  }
                  className="w-full sm:w-auto px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-[#9E315A] border border-rose-200 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Inspect Details
                </button>

              </div>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() =>
                  onOpenWhatsAppForProduct(
                    product
                  )
                }
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >

                <MessageCircle className="w-4 h-4 fill-white" />

                <span>
                  Enquire About This Product
                </span>

              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};