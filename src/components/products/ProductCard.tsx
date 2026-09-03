import React, { useMemo, useState } from 'react';
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Eye,
  Sparkles,
} from 'lucide-react';

import { Product } from '../../types';
import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToSelection: (product: Product, selectedSize?: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onOpenWhatsApp: (product: Product, selectedSize?: string) => void;

  /**
   * Kept for backward compatibility.
   * If this value is "?", the component will ignore it
   * and derive the correct symbol from currencyCode.
   */
  currencySymbol?: string;

  /**
   * Currency code is the source of truth.
   * Example: GBP, USD, EUR
   */
  currencyCode?: string;
};

/**
 * Get a valid currency symbol from the currency code.
 */
const getCurrencySymbol = (
  currencyCode?: string,
  fallbackSymbol?: string
): string => {
  const code = currencyCode?.trim().toUpperCase() || 'GBP';

  try {
    const parts = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);

    const symbolPart = parts.find((part) => part.type === 'currency');

    if (symbolPart?.value && symbolPart.value !== '?') {
      return symbolPart.value;
    }
  } catch {
    // Invalid currency code - continue to fallback.
  }

  const cleanedFallback = fallbackSymbol?.trim();

  if (
    cleanedFallback &&
    cleanedFallback !== '?' &&
    cleanedFallback !== '�'
  ) {
    return cleanedFallback;
  }

  return '£';
};

/**
 * Format currency consistently.
 */
const formatCurrency = (
  amount: number,
  currencyCode?: string,
  fallbackSymbol?: string
): string => {
  const code = currencyCode?.trim().toUpperCase() || 'GBP';

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = getCurrencySymbol(code, fallbackSymbol);

    return `${symbol}${Number(amount || 0).toFixed(2)}`;
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToSelection,
  onToggleWishlist,
  isWishlisted,
  onOpenWhatsApp,
  currencySymbol,
  currencyCode,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.bangleSizes
      ? product.bangleSizes[1] || product.bangleSizes[0]
      : undefined
  );

  /**
   * Resolve currency once instead of trusting a potentially broken
   * currencySymbol prop.
   */
  const resolvedCurrencyCode = useMemo(() => {
    const code = currencyCode?.trim().toUpperCase();

    return code || 'GBP';
  }, [currencyCode]);

  const resolvedCurrencySymbol = useMemo(() => {
    return getCurrencySymbol(
      resolvedCurrencyCode,
      currencySymbol
    );
  }, [resolvedCurrencyCode, currencySymbol]);

  const fallbackType =
    product.category === 'jewellery'
      ? 'jewellery'
      : product.category === 'performance'
      ? 'performance'
      : 'saree';

  const secondaryImage =
    product.images.front ||
    product.images.detail ||
    product.images.main;

  const rawImage =
    isHovered && secondaryImage
      ? secondaryImage
      : product.images.main;

  const optimizedImageUrl = getOptimizedImageUrl(rawImage, {
    width: 480,
    quality: 65,
    fallbackType,
  });

  const isUnavailable =
    product.stockStatus === 'Unavailable' ||
    product.stockStatus === 'Out of Stock';

  return (
    <div
      className="
        group relative flex h-full min-w-0 flex-col
        bg-white rounded-2xl
        border border-rose-100/80
        shadow-luxury
        hover:shadow-luxury-lg
        transition-all duration-300
        overflow-hidden
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* =========================================================
          IMAGE
      ========================================================== */}
      <div
        className="
          relative
          aspect-[3/4]
          w-full
          shrink-0
          overflow-hidden
          bg-[#FFF5F8]
        "
      >
        {/* Skeleton Shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-100/40 via-rose-50/80 to-rose-100/40 animate-pulse z-0" />
        )}

        {/* Product Image */}
        <img
          src={optimizedImageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true);
            handleImageError(e, fallbackType);
          }}
          className={`
            w-full
            h-full
            object-cover
            object-center
            transition-all
            duration-500
            group-hover:scale-105
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* =======================================================
            BADGES
        ======================================================== */}
        <div
          className="
            absolute
            top-2.5
            left-2.5
            sm:top-3
            sm:left-3
            flex
            flex-col
            items-start
            gap-1
            sm:gap-1.5
            z-10
            max-w-[70%]
          "
        >
          {product.discountPercentage &&
            product.discountPercentage > 0 &&
            product.stockStatus !== 'Out of Stock' &&
            product.stockStatus !== 'Unavailable' && (
              <span
                className="
                  bg-[#9E315A]
                  text-white
                  text-[8px]
                  sm:text-[10px]
                  font-bold
                  px-1.5
                  sm:px-2
                  py-0.5
                  rounded-full
                  shadow-xs
                  tracking-wider
                  whitespace-nowrap
                "
              >
                {product.discountPercentage}% OFF
              </span>
            )}

          {product.isPreOrder && (
            <span
              className="
                bg-[#241B20]
                text-[#E8CFAF]
                border
                border-[#E8CFAF]/40
                text-[8px]
                sm:text-[10px]
                font-bold
                px-1.5
                sm:px-2
                py-0.5
                rounded-full
                shadow-xs
                tracking-wider
                uppercase
                whitespace-nowrap
              "
            >
              Pre-Order
            </span>
          )}

          {product.stockStatus === 'Low Stock' && (
            <span
              className="
                bg-amber-600
                text-white
                text-[8px]
                sm:text-[10px]
                font-bold
                px-1.5
                sm:px-2
                py-0.5
                rounded-full
                shadow-xs
                whitespace-nowrap
              "
            >
              Only {product.stockQuantity} Left
            </span>
          )}

          {product.stockStatus === 'Out of Stock' && (
            <span
              className="
                bg-gray-800
                text-white
                text-[8px]
                sm:text-[10px]
                font-bold
                px-1.5
                sm:px-2
                py-0.5
                rounded-full
                shadow-xs
                whitespace-nowrap
              "
            >
              Out of Stock
            </span>
          )}

          {product.stockStatus === 'Unavailable' && (
            <span
              className="
                bg-rose-900
                text-rose-100
                text-[8px]
                sm:text-[10px]
                font-bold
                px-1.5
                sm:px-2
                py-0.5
                rounded-full
                shadow-xs
                whitespace-nowrap
              "
            >
              Unavailable
            </span>
          )}

          {product.isDancePerformance && (
            <span
              className="
                bg-gradient-to-r
                from-[#C94F7C]
                to-[#B76E79]
                text-white
                text-[8px]
                sm:text-[10px]
                font-bold
                px-1.5
                sm:px-2
                py-0.5
                rounded-full
                shadow-xs
                flex
                items-center
                gap-1
                whitespace-nowrap
              "
            >
              <Sparkles className="w-2.5 h-2.5 shrink-0" />
              <span>Dance Edit</span>
            </span>
          )}
        </div>

        {/* =======================================================
            WISHLIST
        ======================================================== */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`
            absolute
            top-2.5
            right-2.5
            sm:top-3
            sm:right-3
            w-8
            h-8
            sm:w-9
            sm:h-9
            flex
            items-center
            justify-center
            rounded-full
            backdrop-blur-md
            transition-all
            duration-200
            z-20
            shrink-0
            ${
              isWishlisted
                ? 'bg-[#9E315A] text-white shadow-md'
                : 'bg-white/85 text-[#3E2F37] hover:bg-white hover:text-[#9E315A] shadow-xs'
            }
          `}
          title={
            isWishlisted
              ? 'Remove from Wishlist'
              : 'Add to Wishlist'
          }
          aria-label={
            isWishlisted
              ? 'Remove from Wishlist'
              : 'Add to Wishlist'
          }
        >
          <Heart
            className={`
              w-4
              h-4
              sm:w-4.5
              sm:h-4.5
              ${
                isWishlisted
                  ? 'fill-white'
                  : ''
              }
            `}
          />
        </button>

        {/* =======================================================
            QUICK VIEW
            Desktop = hover
            Mobile = ALWAYS visible
        ======================================================== */}
        <div
          className="
            absolute
            inset-x-2
            sm:inset-x-3
            bottom-2
            sm:bottom-3
            z-20
            flex
            items-center
          "
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="
              w-full
              bg-white/95
              hover:bg-white
              active:scale-[0.98]
              text-[#241B20]
              py-1.5
              sm:py-2
              px-2
              sm:px-3
              rounded-lg
              sm:rounded-xl
              text-[10px]
              sm:text-xs
              font-semibold
              shadow-md
              flex
              items-center
              justify-center
              gap-1
              sm:gap-1.5
              transition-all
              border
              border-rose-100
              sm:opacity-0
              sm:group-hover:opacity-100
              opacity-100
            "
          >
            <Eye
              className="
                w-3
                h-3
                sm:w-3.5
                sm:h-3.5
                text-[#9E315A]
                shrink-0
              "
            />

            <span className="whitespace-nowrap">
              Quick View
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================
          PRODUCT CONTENT
      ========================================================== */}
      <div
        className="
          p-2.5
          sm:p-4
          flex
          flex-col
          flex-1
          min-w-0
        "
      >
        {/* =======================================================
            PRODUCT INFO
        ======================================================== */}
        <div className="min-w-0">
          {/* Subcategory + Color */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-2
              text-[9px]
              sm:text-[11px]
              font-medium
              text-[#8C5D6C]
              mb-1
              min-w-0
            "
          >
            <span
              className="
                uppercase
                tracking-wider
                truncate
                min-w-0
              "
              title={product.subcategory}
            >
              {product.subcategory}
            </span>

            {product.color && (
              <span
                className="
                  text-[8px]
                  sm:text-[10px]
                  text-[#241B20]/60
                  truncate
                  shrink-0
                  max-w-[45%]
                "
                title={product.color}
              >
                {product.color}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="
              font-serif
              font-bold
              text-[12px]
              sm:text-base
              leading-snug
              text-[#241B20]
              group-hover:text-[#9E315A]
              transition-colors
              line-clamp-2
              cursor-pointer
              min-h-[2.1em]
            "
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p
            className="
              text-[10px]
              sm:text-xs
              text-[#5A4550]
              line-clamp-1
              mt-0.5
              font-light
              leading-relaxed
            "
          >
            {product.shortDescription}
          </p>

          {/* =====================================================
              BANGLE SIZE SELECTOR
          ====================================================== */}
          {product.bangleSizes &&
            product.bangleSizes.length > 0 && (
              <div
                className="
                  mt-2
                  sm:mt-2.5
                  pt-2
                  border-t
                  border-rose-100/80
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-1
                    text-[9px]
                    sm:text-[10px]
                    text-[#8C5D6C]
                    font-semibold
                    mb-1
                  "
                >
                  <span className="truncate">
                    Bangle Size
                  </span>

                  <span className="text-[#9E315A] font-bold shrink-0">
                    {selectedSize || 'Choose'}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {product.bangleSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={`
                        min-w-[28px]
                        px-1.5
                        sm:px-2
                        py-0.5
                        rounded
                        text-[9px]
                        sm:text-[10px]
                        font-semibold
                        border
                        transition-all
                        ${
                          selectedSize === size
                            ? 'bg-[#9E315A] text-white border-[#9E315A] shadow-2xs'
                            : 'bg-rose-50 text-[#3E2F37] border-rose-200 hover:border-rose-300'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* =========================================================
            BOTTOM AREA
        ========================================================== */}
        <div
          className="
            mt-auto
            pt-2.5
            sm:pt-3
            mt-3
            border-t
            border-rose-100
            min-w-0
          "
        >
          {/* =====================================================
              PRICE
              Price and actions are now SEPARATED.
          ====================================================== */}
          <div
            className="
              flex
              flex-col
              gap-1.5
              min-w-0
            "
          >
            {/* Price Row */}
            <div
              className="
                flex
                items-center
                gap-1.5
                min-w-0
                flex-wrap
              "
            >
              {/* Current Price */}
              <span
                className="
                  font-serif
                  font-bold
                  text-[14px]
                  sm:text-lg
                  leading-tight
                  text-[#9E315A]
                  whitespace-nowrap
                  shrink-0
                "
              >
                {formatCurrency(
                  Number(product.price) || 0,
                  resolvedCurrencyCode,
                  resolvedCurrencySymbol
                )}
              </span>

              {/* Original Price */}
              {product.originalPrice && (
                <span
                  className="
                    text-[9px]
                    sm:text-xs
                    text-[#8C5D6C]
                    line-through
                    whitespace-nowrap
                    shrink-0
                  "
                >
                  {formatCurrency(
                    Number(product.originalPrice) || 0,
                    resolvedCurrencyCode,
                    resolvedCurrencySymbol
                  )}
                </span>
              )}
            </div>

            {/* Stock / Availability */}
            <div className="min-w-0">
              {product.unavailabilityReason ? (
                <span
                  className="
                    block
                    text-[9px]
                    sm:text-[10px]
                    text-amber-700
                    font-medium
                    truncate
                  "
                  title={product.unavailabilityReason}
                >
                  {product.unavailabilityReason}
                </span>
              ) : (
                <span
                  className="
                    block
                    text-[9px]
                    sm:text-[10px]
                    font-medium
                    truncate
                  "
                >
                  {product.stockStatus === 'Out of Stock'
                    ? 'Out of Stock'
                    : product.stockStatus === 'Unavailable'
                    ? 'Currently Unavailable'
                    : product.isPreOrder
                    ? 'Custom Pre-Order'
                    : 'In Stock UK'}
                </span>
              )}
            </div>
          </div>

          {/* =====================================================
              ACTION BUTTONS
              Two centered buttons on desktop.
          ====================================================== */}
          <div
            className="
              mt-2
              sm:mt-2.5
              flex
              items-center
              justify-center
              gap-1.5
              sm:gap-2
              w-full
            "
          >
            {/* Add To Selection */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToSelection(
                  product,
                  selectedSize
                );
              }}
              disabled={isUnavailable}
              className={`
                flex-1
                sm:flex-none
                sm:w-[120px]
                min-w-0
                h-9
                rounded-lg
                sm:rounded-xl
                border
                transition-all
                duration-200
                flex
                items-center
                justify-center
                gap-1
                ${
                  isUnavailable
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                    : 'bg-rose-50 hover:bg-[#9E315A] active:bg-[#8b294f] text-[#9E315A] hover:text-white border-rose-200'
                }
              `}
              title={
                isUnavailable
                  ? 'Item Currently Unavailable'
                  : 'Add to Selection'
              }
              aria-label={
                isUnavailable
                  ? 'Item Currently Unavailable'
                  : 'Add to Selection'
              }
            >
              <ShoppingBag
                className="
                  w-4
                  h-4
                  shrink-0
                "
              />

              <span
                className="
                  text-[9px]
                  sm:text-[10px]
                  font-semibold
                  truncate
                "
              >
                Select
              </span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWhatsApp(
                  product,
                  selectedSize
                );
              }}
              className="
                flex-1
                sm:flex-none
                sm:w-[120px]
                min-w-0
                h-9
                rounded-lg
                sm:rounded-xl
                bg-[#25D366]
                hover:bg-[#20ba59]
                active:bg-[#1daa51]
                text-white
                shadow-xs
                transition-all
                duration-200
                flex
                items-center
                justify-center
                gap-1
              "
              title="Enquire on WhatsApp"
              aria-label="Enquire on WhatsApp"
            >
              <MessageCircle
                className="
                  w-4
                  h-4
                  shrink-0
                  fill-white
                "
              />

              <span
                className="
                  text-[9px]
                  sm:text-[10px]
                  font-semibold
                  truncate
                "
              >
                WhatsApp
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};