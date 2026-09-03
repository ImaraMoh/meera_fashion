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
   * ============================================================
   * CURRENCY
   * ============================================================
   */
  const currencyCode = settings?.currencyCode || 'LKR';

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
   * ============================================================
   * PRODUCT
   * ============================================================
   */
  const product = performanceProduct;

  /**
   * ============================================================
   * PRICE
   * ============================================================
   */
  const price = Number(product?.price || 0);

  const originalPrice = Number(
    (product as Product & {
      originalPrice?: number | string;
    })?.originalPrice || 0
  );

  /**
   * ============================================================
   * DISCOUNT
   * ============================================================
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
   * ============================================================
   * SAVINGS
   * ============================================================
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
   * ============================================================
   * PRODUCT IMAGE
   * ============================================================
   */
  const productImage =
    product?.images?.main ||
    product?.images?.thumbnail ||
    '';

  /**
   * ============================================================
   * STOCK
   * ============================================================
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

  const explicitlyUnavailable =
    (product as any)?.inStock === false ||
    (product as any)?.isAvailable === false ||
    (product as any)?.available === false;

  const isOutOfStock =
    explicitlyUnavailable ||
    (stockQuantity !== null &&
      Number.isFinite(stockQuantity) &&
      stockQuantity <= 0);

  const stockLabel = isOutOfStock
    ? 'Currently Unavailable'
    : stockQuantity !== null &&
        Number.isFinite(stockQuantity) &&
        stockQuantity > 0
      ? `${stockQuantity} Available`
      : 'Available';

  /**
   * ============================================================
   * PRODUCT HIGHLIGHTS
   * ============================================================
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
      items.push(`Style: ${subcategory}`);
    }

    if (material) {
      items.push(`Material: ${material}`);
    } else if (fabric) {
      items.push(`Fabric: ${fabric}`);
    }

    if (occasion) {
      items.push(`Suitable for: ${occasion}`);
    }

    if (size) {
      items.push(`Available size: ${size}`);
    }

    if (color) {
      items.push(`Colour: ${color}`);
    }

    if (items.length === 0) {
      if (product?.name) {
        items.push(
          `Authentic ${product.name} from ${
            settings?.brandName || 'Meera Fashion'
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
   * ============================================================
   * DESCRIPTION
   * ============================================================
   */
  const description =
    product?.description?.trim() ||
    `Explore this curated performance collection piece from ${
      settings?.brandName || 'Meera Fashion'
    }. Contact us for detailed sizing, availability and styling information.`;

  /**
   * ============================================================
   * CATEGORY LABEL
   * ============================================================
   */
  const categoryLabel = product?.category
    ? String(product.category).replace(
        /^./,
        (char) => char.toUpperCase()
      )
    : 'Performance Collection';

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF5F8] via-[#FFF0F5] to-[#F8DDE7]/40 py-10 sm:py-16 lg:py-20">

      {/* ======================================================
          BACKGROUND FLOURISHES
      ====================================================== */}

      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#C94F7C]/10 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[#B76E79]/10 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* ======================================================
            SECTION HEADER
        ====================================================== */}

        <div className="mb-5 flex flex-col gap-3 border-b border-rose-200/70 pb-4 sm:mb-8 sm:pb-5 md:flex-row md:items-end md:justify-between lg:mb-10">

          <div className="min-w-0">

            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9E315A] sm:text-xs sm:tracking-widest">

              <Sparkles className="h-3 w-3 text-[#C94F7C] sm:h-3.5 sm:w-3.5" />

              <span>
                Special Collection
              </span>

            </div>

            <h2 className="max-w-2xl font-serif text-2xl font-bold leading-tight text-[#241B20] sm:text-3xl lg:text-4xl">
              The Meera Performance Edit
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#5A4550] sm:text-sm lg:text-base">
              Discover our curated performance collection,
              selected for elegant stage and cultural occasions.
            </p>

          </div>

          {/* Category */}
          <div className="shrink-0">

            <span className="inline-flex rounded-full border border-rose-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#8C5D6C] shadow-sm sm:px-3 sm:py-1.5 sm:text-xs">
              {categoryLabel}
            </span>

          </div>

        </div>

        {/* ======================================================
            MAIN SHOWCASE
        ====================================================== */}

        <div className="grid overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-luxury-lg sm:rounded-3xl lg:grid-cols-12">

          {/* ====================================================
              LEFT — PRODUCT IMAGE
          ==================================================== */}

          <div className="relative bg-[#FFF0F5] p-2.5 sm:p-5 lg:col-span-7 lg:p-8">

            <div className="relative mx-auto h-[310px] w-full max-w-lg sm:h-[420px] lg:h-[520px]">

              <div className="relative h-full w-full overflow-hidden rounded-xl border-2 border-white shadow-luxury sm:rounded-2xl">

                {productImage ? (
                  <img
                    src={getOptimizedImageUrl(
                      productImage,
                      {
                        width: 750,
                        quality: 75,
                        fallbackType: 'performance',
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
                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">

                    <div className="px-6 text-center">

                      <Sparkles className="mx-auto mb-3 h-9 w-9 text-[#C94F7C] sm:h-10 sm:w-10" />

                      <p className="text-xs font-medium text-[#9E315A] sm:text-sm">
                        Product image unavailable
                      </p>

                    </div>

                  </div>
                )}

                {/* Image overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

                {/* Category badge */}
                <div className="absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:left-4 sm:top-4 sm:px-3.5 sm:py-1.5 sm:text-xs">
                  Performance Collection
                </div>

                {/* Discount */}
                {discountPercentage > 0 &&
                  savings > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-gradient-to-r from-[#9E315A] to-[#C94F7C] px-2.5 py-1 text-[10px] font-bold text-white shadow-md sm:bottom-4 sm:right-4 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs">
                      Save {formatCurrency(savings)}
                    </div>
                  )}

                {/* Mobile product name overlay */}
                <div className="absolute bottom-3 left-3 max-w-[72%] sm:hidden">

                  <p className="line-clamp-2 font-serif text-lg font-bold leading-tight text-white drop-shadow-md">
                    {product?.name ||
                      'Featured Performance Product'}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ====================================================
              RIGHT — PRODUCT DETAILS
          ==================================================== */}

          <div className="flex flex-col bg-gradient-to-b from-white to-[#FFF9FB] p-4 sm:p-7 lg:col-span-5 lg:p-10">

            <div className="flex-1">

              {/* Category + Stock */}

              <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">

                <span className="truncate text-[9px] font-bold uppercase tracking-[0.15em] text-[#C94F7C] sm:text-xs sm:tracking-widest">
                  {categoryLabel}
                </span>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs ${
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

              <h3 className="mb-2 line-clamp-2 font-serif text-xl font-bold leading-tight text-[#241B20] sm:mb-3 sm:text-3xl">
                {product?.name ||
                  'Featured Performance Product'}
              </h3>

              {/* ==================================================
                  PRICE
              ================================================== */}

              <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:mb-5 sm:gap-3">

                <span className="font-serif text-2xl font-bold text-[#9E315A] sm:text-3xl">
                  {formatCurrency(price)}
                </span>

                {originalPrice > price && (
                  <span className="text-sm font-light text-[#8C5D6C] line-through sm:text-lg">
                    {formatCurrency(originalPrice)}
                  </span>
                )}

                {discountPercentage > 0 && (
                  <span className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 sm:px-2 sm:text-xs">
                    {discountPercentage}% OFF
                  </span>
                )}

              </div>

              {/* ==================================================
                  DESCRIPTION
              ================================================== */}

              <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-[#5A4550] sm:mb-6 sm:text-sm">
                {description}
              </p>

              {/* ==================================================
                  HIGHLIGHTS
              ================================================== */}

              <div className="mb-4 grid grid-cols-1 gap-1.5 sm:mb-7 sm:gap-2.5">

                {highlights.map(
                  (item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-2 text-[11px] leading-snug text-[#3E2F37] sm:gap-2.5 sm:text-sm"
                    >

                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C94F7C] sm:h-4 sm:w-4" />

                      <span className="line-clamp-2">
                        {item}
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ====================================================
                ACTIONS
            ==================================================== */}

            <div className="border-t border-rose-100 pt-3 sm:pt-5">

              {/* Primary actions */}

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3">

                {/* Add To Selection */}

                <button
                  type="button"
                  onClick={() =>
                    onAddToSelection(product)
                  }
                  disabled={isOutOfStock}
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#9E315A] to-[#C94F7C] px-3 py-2.5 text-[11px] font-semibold text-white shadow-luxury transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:gap-2 sm:rounded-xl sm:px-5 sm:py-3.5 sm:text-sm"
                >

                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

                  <span className="truncate">
                    {isOutOfStock
                      ? 'Unavailable'
                      : 'Add to Selection'}
                  </span>

                </button>

                {/* Quick View */}

                <button
                  type="button"
                  onClick={() =>
                    onQuickView(product)
                  }
                  className="min-h-11 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] font-semibold text-[#9E315A] transition-colors hover:bg-rose-100 sm:w-auto sm:rounded-xl sm:px-5 sm:py-3.5 sm:text-sm"
                >
                  Inspect Details
                </button>

              </div>

              {/* WhatsApp */}

              <button
                type="button"
                onClick={() =>
                  onOpenWhatsAppForProduct(product)
                }
                className="mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#20ba59] sm:mt-3 sm:gap-2 sm:rounded-xl sm:py-3 sm:text-sm"
              >

                <MessageCircle className="h-3.5 w-3.5 fill-white sm:h-4 sm:w-4" />

                <span>
                  <span className="sm:hidden">
                    Enquire on WhatsApp
                  </span>

                  <span className="hidden sm:inline">
                    Enquire About This Product
                  </span>
                </span>

              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};