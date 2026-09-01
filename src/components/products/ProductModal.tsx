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

import {
  Product,
  ImageBackgroundMode,
} from '../../types';

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
  /*
   * Important:
   * Hooks must always run before conditional returns.
   */

  const [activeImage, setActiveImage] = useState('');
  const [selectedBangleSize, setSelectedBangleSize] =
    useState('2.6');

  const [selectedVariant, setSelectedVariant] =
    useState<Record<string, string>>({});

  const [quantity, setQuantity] = useState(1);

  const [copiedNotification, setCopiedNotification] =
    useState(false);

  const [mainImageLoaded, setMainImageLoaded] =
    useState(false);

  /*
   * Reset modal state whenever the product changes.
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
    setQuantity(1);
    setCopiedNotification(false);
  }, [product?.id]);

  /*
   * Lock background scrolling while modal is open.
   */
  useEffect(() => {
    if (!product) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  /*
   * ESC key closes modal.
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
   * Gallery list.
   *
   * useMemo prevents rebuilding the gallery on every render.
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
    ].filter(
      Boolean
    ) as {
      label: string;
      url: string;
    }[];
  }, [product]);

  /*
   * Matching products.
   *
   * Memoized so filtering doesn't happen on every render.
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
   * Main image optimization.
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
   * Preload the main image.
   *
   * This starts downloading it as soon as the modal opens.
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
   * Preload the next gallery image AFTER
   * the main image has loaded.
   *
   * This avoids downloading all images at once.
   */
  useEffect(() => {
    if (
      !mainImageLoaded ||
      !activeImage ||
      galleryList.length <= 1
    ) {
      return;
    }

    const currentIndex =
      galleryList.findIndex(
        (item) => item.url === activeImage
      );

    const nextItem =
      galleryList[currentIndex + 1];

    if (!nextItem) return;

    const nextImage = new Image();

    nextImage.src = getOptimizedImageUrl(
      nextItem.url,
      {
        width: 750,
        quality: 68,
      }
    );
  }, [
    mainImageLoaded,
    activeImage,
    galleryList,
  ]);

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

  /*
   * Don't render anything when no product is selected.
   *
   * Hooks are already declared above.
   */
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
        fixed inset-0 z-50
        overflow-y-auto
        bg-black/60
        backdrop-blur-sm
        flex items-center justify-center
        p-2 sm:p-4 lg:p-6
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
          max-w-5xl
          bg-white
          rounded-3xl
          shadow-luxury-lg
          overflow-hidden
          border border-rose-100
          max-h-[92vh]
          flex flex-col
        "
      >
        {/* Header */}
        <div
          className="
            sticky top-0 z-20
            flex items-center justify-between
            px-6 py-3.5
            bg-white/95
            backdrop-blur-md
            border-b border-rose-100
          "
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9E315A] truncate">
              {product.category}
            </span>

            <span className="text-rose-300">
              •
            </span>

            <span className="text-xs text-[#5A4550] truncate">
              {product.subcategory}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="
                p-2
                text-[#3E2F37]
                hover:text-[#9E315A]
                hover:bg-rose-50
                rounded-full
                transition-colors
                relative
              "
              title="Copy Link"
              aria-label="Copy product link"
            >
              <Share2 className="w-4 h-4" />

              {copiedNotification && (
                <span
                  className="
                    absolute
                    -bottom-7
                    right-0
                    text-[10px]
                    bg-[#241B20]
                    text-white
                    px-2
                    py-0.5
                    rounded
                    shadow-sm
                    whitespace-nowrap
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
                p-2
                rounded-full
                transition-colors
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
                  w-4 h-4
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
                p-2
                text-[#3E2F37]
                hover:text-[#9E315A]
                hover:bg-rose-50
                rounded-full
                transition-colors
                ml-2
              "
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className="
            overflow-y-auto
            p-6 lg:p-8
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-8
          "
        >
          {/* =========================
              LEFT — IMAGE GALLERY
          ========================== */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image */}
            <div
              className="
                relative
                aspect-[3/4]
                sm:aspect-[4/5]
                rounded-2xl
                overflow-hidden
                border border-rose-200/80
                bg-[#FFF5F8]
              "
            >
              {/* Loading placeholder */}
              {!mainImageLoaded && (
                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-gradient-to-br
                    from-[#FFF5F8]
                    via-white
                    to-[#FFF8FA]
                  "
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="
                        w-8 h-8
                        rounded-full
                        border-2
                        border-rose-200
                        border-t-[#9E315A]
                        animate-spin
                      "
                    />

                    <span className="text-[10px] text-[#8C5D6C]">
                      Loading image...
                    </span>
                  </div>
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

                    handleImageError(
                      e,
                      fallbackType
                    );
                  }}
                  className={`
                    w-full
                    h-full
                    object-cover
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
                  top-4
                  left-4
                  flex
                  flex-col
                  gap-1.5
                  z-10
                "
              >
                {product.isPreOrder && (
                  <span
                    className="
                      bg-[#241B20]
                      text-[#E8CFAF]
                      text-xs
                      font-bold
                      px-3 py-1
                      rounded-full
                      uppercase
                      tracking-wider
                      shadow-sm
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
                      text-xs
                      font-bold
                      px-2.5 py-1
                      rounded-full
                      shadow-sm
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
                  pb-2
                  scrollbar-thin
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
                          if (
                            activeImage ===
                            item.url
                          ) {
                            return;
                          }

                          setMainImageLoaded(false);
                          setActiveImage(
                            item.url
                          );
                        }}
                        className={`
                          w-16 h-20
                          rounded-xl
                          overflow-hidden
                          border-2
                          shrink-0
                          transition-all
                          ${
                            isActive
                              ? 'border-[#9E315A] shadow-md scale-105'
                              : 'border-rose-200/70 opacity-70 hover:opacity-100'
                          }
                        `}
                        aria-label={`View ${item.label} image`}
                      >
                        <img
                          src={getOptimizedImageUrl(
                            item.url,
                            {
                              width: 160,
                              quality: 58,
                            }
                          )}
                          alt={`${product.name} ${item.label}`}
                          width={160}
                          height={200}
                          loading={
                            idx === 0
                              ? 'eager'
                              : 'lazy'
                          }
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) =>
                            handleImageError(
                              e,
                              fallbackType
                            )
                          }
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* =========================
              RIGHT — PRODUCT DETAILS
          ========================== */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Availability */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span
                  className={`
                    text-xs
                    font-semibold
                    px-2.5 py-0.5
                    rounded-full
                    ${
                      product.stockStatus ===
                      'In Stock'
                        ? 'bg-emerald-100 text-emerald-800'
                        : product.stockStatus ===
                          'Pre-Order'
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : product.stockStatus ===
                          'Out of Stock'
                        ? 'bg-gray-800 text-white font-bold'
                        : product.stockStatus ===
                          'Unavailable'
                        ? 'bg-rose-900 text-rose-100 font-bold'
                        : 'bg-amber-100 text-amber-800'
                    }
                  `}
                >
                  {product.stockStatus ===
                  'Pre-Order'
                    ? '⚡ Custom Pre-Order Available'
                    : product.stockStatus ===
                      'Out of Stock'
                    ? '✕ Out of Stock'
                    : product.stockStatus ===
                      'Unavailable'
                    ? '✕ Currently Unavailable'
                    : `✓ ${product.stockStatus} (${product.stockQuantity} ready)`}
                </span>

                <span className="text-xs text-[#8C5D6C] font-mono truncate">
                  Ref: {product.id}
                </span>
              </div>

              {/* Unavailability */}
              {product.unavailabilityReason && (
                <div
                  className="
                    mb-3
                    p-2.5
                    rounded-xl
                    bg-amber-50
                    border border-amber-200
                    text-xs
                    text-amber-900
                    font-medium
                  "
                >
                  <strong>
                    Status Notice:
                  </strong>{' '}
                  {product.unavailabilityReason}
                </div>
              )}

              {/* Title */}
              <h2
                className="
                  text-2xl
                  sm:text-3xl
                  font-serif
                  font-bold
                  text-[#241B20]
                  mb-2
                  leading-snug
                "
              >
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4 flex-wrap">
                <span className="text-3xl font-serif font-bold text-[#9E315A]">
                  £{product.price}
                </span>

                {product.originalPrice ? (
                  <span className="text-lg text-[#8C5D6C] line-through font-light">
                    £{product.originalPrice}
                  </span>
                ) : null}

                {product.discountPercentage ? (
                  <span
                    className="
                      text-xs
                      font-bold
                      text-[#9E315A]
                      bg-rose-50
                      border border-rose-200
                      px-2 py-0.5
                      rounded
                    "
                  >
                    Save £
                    {(
                      product.originalPrice! -
                      product.price
                    ).toFixed(2)}{' '}
                    (
                    {
                      product.discountPercentage
                    }
                    %)
                  </span>
                ) : null}
              </div>

              {/* Description */}
              <p className="text-sm text-[#5A4550] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Material / Specs */}
              <div
                className="
                  bg-[#FFF8FA]
                  p-3.5
                  rounded-2xl
                  border border-rose-100
                  text-xs
                  space-y-2
                  mb-6
                "
              >
                <div className="flex justify-between gap-4">
                  <span className="text-[#8C5D6C] font-medium">
                    Fabric / Material:
                  </span>

                  <span className="font-semibold text-[#241B20] text-right">
                    {product.material ||
                      'Not specified'}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#8C5D6C] font-medium">
                    Primary Colour:
                  </span>

                  <span className="font-semibold text-[#241B20]">
                    {product.color ||
                      'Not specified'}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#8C5D6C] font-medium">
                    Collection:
                  </span>

                  <span className="font-semibold text-[#9E315A]">
                    {product.subcategory ||
                      'General'}
                  </span>
                </div>
              </div>

              {/* Bangle Size */}
              {product.bangleSizes &&
                product.bangleSizes.length > 0 && (
                  <div
                    className="
                      mb-6
                      p-4
                      rounded-2xl
                      bg-gradient-to-r
                      from-rose-50/80
                      to-pink-50/50
                      border border-rose-200/80
                    "
                  >
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <span
                        className="
                          text-xs
                          font-bold
                          text-[#9E315A]
                          uppercase
                          tracking-wider
                          flex
                          items-center
                          gap-1.5
                        "
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        Select Bangle Size:
                      </span>

                      <span
                        className="
                          text-xs
                          font-bold
                          text-[#241B20]
                          bg-white
                          px-2
                          py-0.5
                          rounded
                          shadow-2xs
                        "
                      >
                        Selected:{' '}
                        {selectedBangleSize}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {product.bangleSizes.map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              setSelectedBangleSize(
                                size
                              )
                            }
                            className={`
                              py-2
                              rounded-xl
                              text-xs
                              font-bold
                              border
                              transition-all
                              ${
                                selectedBangleSize ===
                                size
                                  ? 'bg-[#9E315A] text-white border-[#9E315A] shadow-sm'
                                  : 'bg-white text-[#3E2F37] border-rose-200 hover:border-rose-300'
                              }
                            `}
                          >
                            {size}
                          </button>
                        )
                      )}
                    </div>

                    <p className="text-[11px] text-[#8C5D6C] mt-2 font-light">
                      *Standard Indian bangle
                      diameter. Included in
                      WhatsApp enquiry message.
                    </p>
                  </div>
                )}

              {/* Custom Variants */}
              {product.variants?.map(
                (variant) => (
                  <div
                    key={variant.id}
                    className="mb-4"
                  >
                    <label
                      className="
                        text-xs
                        font-bold
                        text-[#9E315A]
                        uppercase
                        tracking-wider
                        block
                        mb-1.5
                      "
                    >
                      {variant.name}
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {variant.options.map(
                        (option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setSelectedVariant(
                                (previous) => ({
                                  ...previous,
                                  [variant.name]:
                                    option,
                                })
                              )
                            }
                            className={`
                              px-3
                              py-1.5
                              rounded-xl
                              text-xs
                              font-semibold
                              border
                              transition-all
                              ${
                                selectedVariant[
                                  variant.name
                                ] === option
                                  ? 'bg-[#9E315A] text-white border-[#9E315A]'
                                  : 'bg-white text-[#3E2F37] border-rose-200'
                              }
                            `}
                          >
                            {option}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Matching Products */}
              {matchingProducts.length > 0 && (
                <div className="mb-6 pt-4 border-t border-rose-100">
                  <span
                    className="
                      text-xs
                      font-bold
                      text-[#9E315A]
                      uppercase
                      tracking-wider
                      flex
                      items-center
                      gap-1.5
                      mb-2.5
                    "
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C94F7C]" />
                    Complete the Look:
                  </span>

                  <div className="space-y-2">
                    {matchingProducts.map(
                      (match) => (
                        <div
                          key={match.id}
                          className="
                            flex
                            items-center
                            justify-between
                            p-2.5
                            rounded-xl
                            bg-white
                            border border-rose-100
                            shadow-2xs
                            hover:border-rose-300
                            transition-colors
                          "
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getOptimizedImageUrl(
                                match.images?.main,
                                {
                                  width: 120,
                                  quality: 55,
                                  fallbackType:
                                    match.category ===
                                    'jewellery'
                                      ? 'jewellery'
                                      : 'saree',
                                }
                              )}
                              alt={match.name}
                              width={40}
                              height={40}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) =>
                                handleImageError(
                                  e,
                                  match.category ===
                                    'jewellery'
                                    ? 'jewellery'
                                    : 'saree'
                                )
                              }
                              className="
                                w-10
                                h-10
                                rounded-lg
                                object-cover
                                shrink-0
                              "
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#241B20] line-clamp-1">
                                {match.name}
                              </p>

                              <p className="text-[11px] font-semibold text-[#9E315A]">
                                £{match.price}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onAddToSelection(
                                match
                              )
                            }
                            className="
                              text-xs
                              flex
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
                              border border-rose-200
                              transition-colors
                              shrink-0
                              ml-2
                            "
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Match</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className="
                pt-6
                border-t
                border-rose-200/80
                space-y-3
              "
            >
              <div className="flex items-center gap-3">
                {/* Add Selection */}
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
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3.5
                    rounded-xl
                    font-semibold
                    text-sm
                    transition-all
                    ${
                      isUnavailable
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:brightness-110 text-white shadow-luxury cursor-pointer'
                    }
                  `}
                >
                  <ShoppingBag className="w-4 h-4" />

                  <span>
                    {isUnavailable
                      ? 'Currently Unavailable'
                      : 'Add to My Selection'}
                  </span>
                </button>

                {/* WhatsApp */}
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
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-[#25D366]
                    hover:bg-[#20ba59]
                    text-white
                    py-3.5
                    rounded-xl
                    font-bold
                    text-sm
                    shadow-sm
                    transition-all
                    cursor-pointer
                  "
                >
                  <MessageCircle className="w-4 h-4 fill-white" />

                  <span>
                    {isUnavailable
                      ? 'Enquire Restock on WhatsApp'
                      : product.isPreOrder
                      ? 'Pre-Order on WhatsApp'
                      : 'Enquire on WhatsApp'}
                  </span>
                </button>
              </div>

              {/* Trust */}
              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  text-[11px]
                  text-[#5A4550]
                  pt-2
                "
              >
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C94F7C]" />

                  <span>
                    UK Royal Mail Tracked
                    Dispatch
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#C94F7C]" />

                  <span>
                    100% Quality & Fit
                    Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};