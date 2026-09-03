import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  X,
  Heart,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Truck,
  Shield,
  Ruler,
  Share2,
  Plus,
} from 'lucide-react';

import { Product } from '../../types';

import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface ProductModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onAddToSelection: (
    product: Product,
    selectedSize?: string
  ) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onOpenWhatsApp: (
    product: Product,
    selectedSize?: string
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  allProducts,
  onClose,
  onAddToSelection,
  onToggleWishlist,
  isWishlisted,
  onOpenWhatsApp,
}) => {
  const [activeImage, setActiveImage] = useState('');
  const [selectedBangleSize, setSelectedBangleSize] =
    useState('2.6');

  const [selectedVariant, setSelectedVariant] =
    useState<Record<string, string>>({});

  const [copiedNotification, setCopiedNotification] =
    useState(false);

  const [mainImageLoaded, setMainImageLoaded] =
    useState(false);

  /*
   * Reset modal state whenever product changes.
   */
  useEffect(() => {
    if (!product) return;

    setActiveImage(product.images?.main || '');
    setMainImageLoaded(false);

    setSelectedBangleSize(
      product.bangleSizes?.[1] ||
        product.bangleSizes?.[0] ||
        '2.6'
    );

    setSelectedVariant({});
    setCopiedNotification(false);
  }, [product?.id]);

  /*
   * Lock page scrolling while modal is open.
   */
  useEffect(() => {
    if (!product) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [product]);

  /*
   * ESC closes modal.
   */
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [product, onClose]);

  /*
   * Product gallery.
   */
  const galleryList = useMemo(() => {
    if (!product) return [];

    const images = product.images || {};

    return [
      images.main
        ? {
            label: 'Main',
            url: images.main,
          }
        : null,

      images.front
        ? {
            label: 'Front',
            url: images.front,
          }
        : null,

      images.back
        ? {
            label: 'Back',
            url: images.back,
          }
        : null,

      images.detail
        ? {
            label: 'Detail',
            url: images.detail,
          }
        : null,

      images.wearing
        ? {
            label: 'Model',
            url: images.wearing,
          }
        : null,
    ].filter(Boolean) as {
      label: string;
      url: string;
    }[];
  }, [product]);

  /*
   * Matching products.
   */
  const matchingProducts = useMemo(() => {
    if (!product?.matchingProductIds?.length) {
      return [];
    }

    const matchingIds = new Set(
      product.matchingProductIds
    );

    return allProducts.filter(
      (item) =>
        item.id !== product.id &&
        matchingIds.has(item.id)
    );
  }, [
    allProducts,
    product?.id,
    product?.matchingProductIds,
  ]);

  /*
   * Optimized main image.
   */
  const optimizedMainImage = useMemo(() => {
    if (!activeImage || !product) {
      return '';
    }

    return getOptimizedImageUrl(activeImage, {
      width: 750,
      quality: 72,
      fallbackType:
        product.category === 'jewellery'
          ? 'jewellery'
          : product.category === 'performance'
          ? 'performance'
          : 'saree',
    });
  }, [
    activeImage,
    product?.category,
  ]);

  /*
   * Preload main image.
   */
  useEffect(() => {
    if (!optimizedMainImage) return;

    const image = new Image();

    image.src = optimizedMainImage;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [optimizedMainImage]);

  /*
   * Share product link.
   */
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopiedNotification(true);

      setTimeout(() => {
        setCopiedNotification(false);
      }, 2500);
    } catch {
      console.warn(
        'Unable to copy product link'
      );
    }
  };

  if (!product) {
    return null;
  }

  const isUnavailable =
    product.stockStatus === 'Unavailable' ||
    product.stockStatus === 'Out of Stock';

  const fallbackType =
    product.category === 'jewellery'
      ? 'jewellery'
      : product.category === 'performance'
      ? 'performance'
      : 'saree';

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        overflow-y-auto
        bg-black/70
        backdrop-blur-xs
        flex
        items-center
        justify-center
        p-2
        sm:p-4
        animate-fadeIn
      "
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} details`}
    >
      <div
        className="
          relative
          w-full
          max-w-4xl
          bg-white
          rounded-2xl
          sm:rounded-3xl
          shadow-2xl
          overflow-hidden
          border
          border-rose-100
          max-h-[92vh]
          flex
          flex-col
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div
          className="
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            gap-2
            px-4
            py-2.5
            sm:px-6
            sm:py-3
            bg-white/95
            backdrop-blur-md
            border-b
            border-rose-100
            shrink-0
          "
        >
          {/* Category */}
          <div
            className="
              flex
              items-center
              gap-1.5
              min-w-0
              flex-1
              pr-2
            "
          >
            <span
              className="
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-widest
                text-[#9E315A]
                truncate
              "
            >
              {product.category}
            </span>

            <span className="text-rose-300 shrink-0">
              •
            </span>

            <span
              className="
                text-[10px]
                sm:text-xs
                text-[#5A4550]
                truncate
              "
            >
              {product.subcategory}
            </span>
          </div>

          {/* Header Actions */}
          <div
            className="
              flex
              items-center
              gap-1
              shrink-0
            "
          >
            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="
                p-1.5
                sm:p-2
                text-[#3E2F37]
                hover:text-[#9E315A]
                hover:bg-rose-50
                rounded-full
                transition-colors
                relative
                cursor-pointer
              "
              title="Copy Link"
              aria-label="Copy product link"
            >
              <Share2 className="w-4 h-4" />

              {copiedNotification && (
                <span
                  className="
                    absolute
                    right-0
                    -bottom-7
                    text-[10px]
                    bg-[#241B20]
                    text-white
                    px-2
                    py-0.5
                    rounded
                    shadow-sm
                    whitespace-nowrap
                    z-50
                  "
                >
                  Link copied!
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() =>
                onToggleWishlist(product.id)
              }
              className={`
                p-1.5
                sm:p-2
                rounded-full
                transition-colors
                cursor-pointer
                ${
                  isWishlisted
                    ? 'text-[#9E315A] bg-rose-50'
                    : 'text-[#3E2F37] hover:text-[#9E315A] hover:bg-rose-50'
                }
              `}
              title={
                isWishlisted
                  ? 'Saved in Wishlist'
                  : 'Add to Wishlist'
              }
              aria-label={
                isWishlisted
                  ? 'Remove from wishlist'
                  : 'Add to wishlist'
              }
            >
              <Heart
                className={`
                  w-4
                  h-4
                  ${
                    isWishlisted
                      ? 'fill-[#9E315A]'
                      : ''
                  }
                `}
              />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="
                p-1.5
                sm:p-2
                text-[#3E2F37]
                hover:text-[#9E315A]
                hover:bg-rose-50
                rounded-full
                transition-colors
                ml-1
                cursor-pointer
              "
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =====================================================
            BODY
        ====================================================== */}
        <div
          className="
            overflow-y-auto
            overscroll-contain
            p-4
            sm:p-6
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-6
            items-start
          "
        >
          {/* ===================================================
              LEFT — PRODUCT IMAGE & GALLERY
          ==================================================== */}
          <div
            className="
              lg:col-span-5
              min-w-0
              flex
              flex-col
              gap-3
              lg:sticky
              lg:top-2
            "
          >
            {/* Main Image */}
            <div
              className="
                relative
                w-full
                h-[260px]
                sm:h-[320px]
                lg:h-[360px]
                rounded-2xl
                overflow-hidden
                border
                border-rose-200/80
                bg-[#FFF5F8]
              "
            >
              {!mainImageLoaded && (
                <div
                  className="
                    absolute
                    inset-0
                    z-10
                    flex
                    items-center
                    justify-center
                    bg-white/80
                  "
                >
                  <div className="w-6 h-6 rounded-full border-2 border-rose-200 border-t-[#9E315A] animate-spin" />
                </div>
              )}

              {optimizedMainImage && (
                <img
                  src={optimizedMainImage}
                  alt={product.name}
                  width={750}
                  height={1000}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onLoad={() =>
                    setMainImageLoaded(true)
                  }
                  onError={(e) => {
                    setMainImageLoaded(true);
                    handleImageError(e, fallbackType);
                  }}
                  className={`
                    block
                    w-full
                    h-full
                    object-contain
                    object-center
                    transition-opacity
                    duration-300
                    ${
                      mainImageLoaded
                        ? 'opacity-100'
                        : 'opacity-0'
                    }
                  `}
                />
              )}

              {/* Badges */}
              <div
                className="
                  absolute
                  top-3
                  left-3
                  flex
                  flex-col
                  gap-1.5
                  z-20
                "
              >
                {product.isPreOrder && (
                  <span
                    className="
                      bg-[#241B20]
                      text-[#E8CFAF]
                      text-[10px]
                      font-bold
                      px-2.5
                      py-1
                      rounded-full
                      uppercase
                      tracking-wider
                      shadow-xs
                    "
                  >
                    Pre-Order
                  </span>
                )}

                {product.discountPercentage ? (
                  <span
                    className="
                      bg-[#9E315A]
                      text-white
                      text-[10px]
                      font-bold
                      px-2.5
                      py-1
                      rounded-full
                      shadow-xs
                    "
                  >
                    {product.discountPercentage}% OFF
                  </span>
                ) : null}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {galleryList.length > 0 && (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  overflow-x-auto
                  pb-1
                  no-scrollbar
                "
              >
                {galleryList.map(
                  (item, idx) => {
                    const isActive =
                      activeImage === item.url;

                    return (
                      <button
                        key={`${item.url}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (activeImage === item.url) return;
                          setMainImageLoaded(false);
                          setActiveImage(item.url);
                        }}
                        className={`
                          w-14
                          h-16
                          rounded-xl
                          overflow-hidden
                          border-2
                          shrink-0
                          transition-all
                          cursor-pointer
                          ${
                            isActive
                              ? 'border-[#9E315A] shadow-sm scale-105'
                              : 'border-rose-200/70 opacity-70 hover:opacity-100'
                          }
                        `}
                        aria-label={`View ${item.label} image`}
                      >
                        <img
                          src={getOptimizedImageUrl(
                            item.url,
                            {
                              width: 140,
                              quality: 55,
                            }
                          )}
                          alt={`${product.name} ${item.label}`}
                          width={140}
                          height={160}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) =>
                            handleImageError(
                              e,
                              fallbackType
                            )
                          }
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* ===================================================
              RIGHT — PRODUCT DETAILS & ACTIONS
          ==================================================== */}
          <div
            className="
              lg:col-span-7
              min-w-0
              flex
              flex-col
            "
          >
            {/* Availability & Ref */}
            <div
              className="
                flex
                items-center
                justify-between
                gap-2
                mb-2
              "
            >
              <span
                className={`
                  text-[10px]
                  sm:text-xs
                  font-semibold
                  px-2.5
                  py-0.5
                  rounded-full
                  ${
                    product.stockStatus === 'In Stock'
                      ? 'bg-emerald-100 text-emerald-800'
                      : product.stockStatus === 'Pre-Order'
                      ? 'bg-purple-100 text-purple-900 font-bold'
                      : 'bg-amber-100 text-amber-800'
                  }
                `}
              >
                {product.stockStatus === 'Pre-Order'
                  ? '⚡ Custom Pre-Order Available'
                  : product.stockStatus === 'Out of Stock'
                  ? '✕ Out of Stock'
                  : `✓ ${product.stockStatus} (${product.stockQuantity} ready)`}
              </span>

              <span className="text-[10px] text-rose-300 font-mono">
                Ref: {product.id}
              </span>
            </div>

            {/* Title */}
            <h1
              className="
                text-xl
                sm:text-2xl
                font-serif
                font-bold
                text-[#241B20]
                mb-1.5
                leading-tight
              "
            >
              {product.name}
            </h1>

            {/* Price */}
            <div
              className="
                flex
                items-center
                gap-2.5
                mb-3
                flex-wrap
              "
            >
              <span
                className="
                  text-2xl
                  sm:text-3xl
                  font-serif
                  font-bold
                  text-[#9E315A]
                "
              >
                £{product.price}
              </span>

              {product.originalPrice ? (
                <span
                  className="
                    text-base
                    text-rose-300
                    line-through
                    font-light
                  "
                >
                  £{product.originalPrice}
                </span>
              ) : null}

              {product.discountPercentage ? (
                <span
                  className="
                    text-[10px]
                    font-bold
                    text-[#9E315A]
                    bg-rose-50
                    border
                    border-rose-200
                    px-2
                    py-0.5
                    rounded
                  "
                >
                  Save £
                  {(
                    product.originalPrice! -
                    product.price
                  ).toFixed(2)}{' '}
                  ({product.discountPercentage}%)
                </span>
              ) : null}
            </div>

            {/* Description */}
            <p
              className="
                text-xs
                sm:text-sm
                text-[#5A4550]
                leading-relaxed
                mb-3.5
              "
            >
              {product.description}
            </p>

            {/* Material & Specs */}
            <div
              className="
                bg-[#FFF8FA]
                p-3
                rounded-xl
                border
                border-rose-100
                text-xs
                space-y-1.5
                mb-3.5
              "
            >
              <div className="flex justify-between">
                <span className="text-[#8C5D6C] font-medium">Fabric / Material:</span>
                <span className="font-semibold text-[#241B20] text-right">
                  {product.material || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C5D6C] font-medium">Primary Colour:</span>
                <span className="font-semibold text-[#241B20] text-right">
                  {product.color || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Bangle Size selector */}
            {product.bangleSizes &&
              product.bangleSizes.length > 0 && (
                <div
                  className="
                    mb-3.5
                    p-3
                    rounded-xl
                    bg-rose-50/70
                    border
                    border-rose-200/80
                  "
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" />
                      Select Bangle Size:
                    </span>
                    <span className="text-xs font-bold text-[#241B20] bg-white px-2 py-0.5 rounded shadow-xs">
                      {selectedBangleSize}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {product.bangleSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedBangleSize(size)}
                        className={`
                          py-1.5
                          rounded-lg
                          text-xs
                          font-bold
                          border
                          transition-all
                          cursor-pointer
                          ${
                            selectedBangleSize === size
                              ? 'bg-[#9E315A] text-white border-[#9E315A] shadow-xs'
                              : 'bg-white text-[#3E2F37] border-rose-200 hover:border-rose-300'
                          }
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Custom Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.id} className="mb-3.5">
                <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1.5">
                  {variant.name}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setSelectedVariant((prev) => ({
                          ...prev,
                          [variant.name]: option,
                        }))
                      }
                      className={`
                        px-3
                        py-1.5
                        rounded-lg
                        text-xs
                        font-semibold
                        border
                        transition-all
                        cursor-pointer
                        ${
                          selectedVariant[variant.name] === option
                            ? 'bg-[#9E315A] text-white border-[#9E315A]'
                            : 'bg-white text-[#3E2F37] border-rose-200 hover:border-rose-300'
                        }
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Complete the Look (Matching products) */}
            {matchingProducts.length > 0 && (
              <div className="mb-3.5 pt-3 border-t border-rose-100">
                <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C94F7C]" />
                  Complete the Look:
                </span>
                <div className="space-y-1.5">
                  {matchingProducts.map((match) => (
                    <div
                      key={match.id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                        p-2
                        rounded-xl
                        bg-white
                        border
                        border-rose-100
                        shadow-2xs
                      "
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <img
                          src={getOptimizedImageUrl(
                            match.images?.main,
                            {
                              width: 100,
                              quality: 50,
                              fallbackType:
                                match.category === 'jewellery'
                                  ? 'jewellery'
                                  : 'saree',
                            }
                          )}
                          alt={match.name}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#241B20] truncate">
                            {match.name}
                          </p>
                          <p className="text-[11px] font-semibold text-[#9E315A]">
                            £{match.price}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddToSelection(match)}
                        className="
                          inline-flex
                          items-center
                          gap-1
                          bg-rose-50
                          hover:bg-[#9E315A]
                          text-[#9E315A]
                          hover:text-white
                          px-2.5
                          py-1.5
                          rounded-lg
                          font-semibold
                          text-xs
                          border
                          border-rose-200
                          transition-colors
                          cursor-pointer
                          shrink-0
                        "
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className="
                mt-2
                pt-3
                border-t
                border-rose-200/80
                space-y-2.5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-2.5
                "
              >
                {/* Add to Selection */}
                <button
                  type="button"
                  onClick={() =>
                    onAddToSelection(
                      product,
                      selectedBangleSize
                    )
                  }
                  disabled={isUnavailable}
                  className={`
                    flex-1
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-3
                    rounded-xl
                    font-semibold
                    text-xs
                    sm:text-sm
                    transition-all
                    ${
                      isUnavailable
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:brightness-110 text-white shadow-md cursor-pointer'
                    }
                  `}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>
                    {isUnavailable
                      ? 'Currently Unavailable'
                      : 'Add to My Selection'}
                  </span>
                </button>

                {/* WhatsApp Enquiry */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenWhatsApp(
                      product,
                      selectedBangleSize
                    )
                  }
                  className="
                    flex-1
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-3
                    rounded-xl
                    font-bold
                    text-xs
                    sm:text-sm
                    bg-[#25D366]
                    hover:bg-[#20BA59]
                    text-white
                    shadow-md
                    transition-all
                    cursor-pointer
                  "
                >
                  <MessageCircle className="w-4 h-4 shrink-0 fill-white" />
                  <span>
                    {isUnavailable
                      ? 'Enquire Restock'
                      : 'Enquire on WhatsApp'}
                  </span>
                </button>
              </div>

              {/* Trust Information */}
              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  text-[11px]
                  text-[#5A4550]
                  pt-1
                "
              >
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C94F7C] shrink-0" />
                  <span>UK Royal Mail Tracked Dispatch</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#C94F7C] shrink-0" />
                  <span>100% Quality & Fit Guarantee</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};