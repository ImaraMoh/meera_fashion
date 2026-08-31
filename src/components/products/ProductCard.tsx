import React, { useState } from 'react';
import { Heart, ShoppingBag, MessageCircle, Eye, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToSelection: (product: Product, selectedSize?: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onOpenWhatsApp: (product: Product, selectedSize?: string) => void;
  currencySymbol?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToSelection,
  onToggleWishlist,
  isWishlisted,
  onOpenWhatsApp,
  currencySymbol = '£',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.bangleSizes ? product.bangleSizes[1] || product.bangleSizes[0] : undefined
  );

  const fallbackType =
    product.category === 'jewellery'
      ? 'jewellery'
      : product.category === 'performance'
      ? 'performance'
      : 'saree';

  const secondaryImage = product.images.front || product.images.detail || product.images.main;
  const rawImage = isHovered && secondaryImage ? secondaryImage : product.images.main;
  const optimizedImageUrl = getOptimizedImageUrl(rawImage, {
    width: 480,
    quality: 65,
    fallbackType,
  });

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl border border-rose-100/80 shadow-luxury hover:shadow-luxury-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFF5F8]">
        {/* Skeleton Shimmer while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-100/40 via-rose-50/80 to-rose-100/40 animate-pulse z-0" />
        )}

        {/* Main Image */}
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
          className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Badges Container Top-Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercentage && product.discountPercentage > 0 && product.stockStatus !== 'Out of Stock' && product.stockStatus !== 'Unavailable' && (
            <span className="bg-[#9E315A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs tracking-wider">
              {product.discountPercentage}% OFF
            </span>
          )}

          {product.isPreOrder && (
            <span className="bg-[#241B20] text-[#E8CFAF] border border-[#E8CFAF]/40 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
              Pre-Order
            </span>
          )}

          {product.stockStatus === 'Low Stock' && (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Only {product.stockQuantity} Left
            </span>
          )}

          {product.stockStatus === 'Out of Stock' && (
            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Out of Stock
            </span>
          )}

          {product.stockStatus === 'Unavailable' && (
            <span className="bg-rose-900 text-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Unavailable
            </span>
          )}

          {product.isDancePerformance && (
            <span className="bg-gradient-to-r from-[#C94F7C] to-[#B76E79] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Dance Edit</span>
            </span>
          )}
        </div>

        {/* Wishlist Button Top-Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWishlisted
              ? 'bg-[#9E315A] text-white shadow-md'
              : 'bg-white/80 text-[#3E2F37] hover:bg-white hover:text-[#9E315A] shadow-xs'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
          <button
            onClick={() => onQuickView(product)}
            className="flex-1 bg-white/95 hover:bg-white text-[#241B20] py-2 px-3 rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all border border-rose-100"
          >
            <Eye className="w-3.5 h-3.5 text-[#9E315A]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content / Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Subcategory / Material */}
          <div className="flex items-center justify-between text-[11px] font-medium text-[#8C5D6C] mb-1">
            <span className="uppercase tracking-wider">{product.subcategory}</span>
            <span className="text-[10px] text-[#241B20]/60">{product.color}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif font-bold text-sm sm:text-base text-[#241B20] group-hover:text-[#9E315A] transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#5A4550] line-clamp-1 mt-0.5 font-light">
            {product.shortDescription}
          </p>

          {/* Jewellery Bangle Size selector if applicable */}
          {product.bangleSizes && product.bangleSizes.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-rose-100/80">
              <div className="flex items-center justify-between text-[10px] text-[#8C5D6C] font-semibold mb-1">
                <span>Bangle Size (India/UK):</span>
                <span className="text-[#9E315A] font-bold">{selectedSize || 'Choose'}</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {product.bangleSizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                      selectedSize === size
                        ? 'bg-[#9E315A] text-white border-[#9E315A] shadow-2xs'
                        : 'bg-rose-50 text-[#3E2F37] border-rose-200 hover:border-rose-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing and Action Bottom Bar */}
        <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-base sm:text-lg text-[#9E315A]">
                {currencySymbol}{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#8C5D6C] line-through">
                  {currencySymbol}{product.originalPrice}
                </span>
              )}
            </div>
            {product.unavailabilityReason ? (
              <span className="text-[10px] text-amber-700 font-medium truncate max-w-[130px]" title={product.unavailabilityReason}>
                {product.unavailabilityReason}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 font-medium">
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

          {/* Quick Actions (Add to Selection / WhatsApp Direct) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddToSelection(product, selectedSize)}
              disabled={product.stockStatus === 'Unavailable' || product.stockStatus === 'Out of Stock'}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                product.stockStatus === 'Unavailable' || product.stockStatus === 'Out of Stock'
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                  : 'bg-rose-50 hover:bg-[#9E315A] text-[#9E315A] hover:text-white border-rose-200'
              }`}
              title={
                product.stockStatus === 'Unavailable' || product.stockStatus === 'Out of Stock'
                  ? 'Item Currently Unavailable'
                  : 'Add to Selection'
              }
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenWhatsApp(product, selectedSize)}
              className="p-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-all duration-200"
              title="Enquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
