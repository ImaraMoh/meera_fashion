import React, { useMemo } from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, BrandSettings } from '../../types';
import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveWishlist: (productId: string) => void;
  onMoveToSelection: (product: Product) => void;
  onQuickView: (product: Product) => void;
  settings?: BrandSettings;
}

/**
 * Get a safe currency symbol from the currency code.
 * Avoids displaying "?" or "�" when the stored currencySymbol is invalid.
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

    const currencyPart = parts.find(
      (part) => part.type === 'currency'
    );

    if (
      currencyPart?.value &&
      currencyPart.value !== '?' &&
      currencyPart.value !== '�'
    ) {
      return currencyPart.value;
    }
  } catch {
    // Ignore invalid currency codes and use fallback
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
 * Format product price consistently.
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = getCurrencySymbol(currencyCode, fallbackSymbol);

    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveWishlist,
  onMoveToSelection,
  onQuickView,
  settings,
}) => {
  const currencyCode = useMemo(() => {
    return settings?.currencyCode?.trim().toUpperCase() || 'GBP';
  }, [settings?.currencyCode]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(
      currencyCode,
      settings?.currencySymbol
    );
  }, [currencyCode, settings?.currencySymbol]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-rose-100">

        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FFF5F8] to-[#FFF0F5] border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#9E315A] fill-[#9E315A]" />

            <h3 className="font-serif font-bold text-lg text-[#241B20]">
              My Saved Wishlist ({wishlistProducts.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#3E2F37] hover:text-[#9E315A] hover:bg-white rounded-full transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-rose-200 mx-auto mb-3" />

              <h4 className="font-serif font-bold text-base text-[#241B20] mb-1">
                No items saved yet
              </h4>

              <p className="text-xs text-[#5A4550]">
                Tap the heart icon on any saree or jewellery piece to save
                it for later.
              </p>
            </div>
          ) : (
            wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-2xl bg-[#FFF8FA] border border-rose-100 flex items-center gap-3 shadow-2xs"
              >
                {/* Product Image */}
                <img
                  src={getOptimizedImageUrl(product.images.main, {
                    width: 140,
                    quality: 60,
                    fallbackType:
                      product.category === 'jewellery'
                        ? 'jewellery'
                        : product.category === 'performance'
                        ? 'performance'
                        : 'saree',
                  })}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) =>
                    handleImageError(
                      e,
                      product.category === 'jewellery'
                        ? 'jewellery'
                        : product.category === 'performance'
                        ? 'performance'
                        : 'saree'
                    )
                  }
                  className="w-16 h-20 rounded-xl object-cover border border-rose-200 shrink-0 cursor-pointer"
                  onClick={() => onQuickView(product)}
                />

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => onQuickView(product)}
                    className="font-serif font-bold text-sm text-[#241B20] truncate cursor-pointer hover:text-[#9E315A]"
                  >
                    {product.name}
                  </h4>

                  {/* Price */}
                  <p className="text-xs font-bold text-[#9E315A] mt-0.5">
                    {formatCurrency(
                      Number(product.price) || 0,
                      currencyCode,
                      currencySymbol
                    )}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onMoveToSelection(product)}
                      className="text-xs flex items-center gap-1 bg-[#9E315A] text-white px-2.5 py-1 rounded-lg font-semibold shadow-2xs hover:bg-[#88284C] transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Select</span>
                    </button>

                    <button
                      onClick={() => onRemoveWishlist(product.id)}
                      className="text-xs text-rose-400 hover:text-rose-700 p-1 transition-colors"
                      title="Remove"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};