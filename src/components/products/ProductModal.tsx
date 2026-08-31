import React, { useState } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  CheckCircle,
  Truck,
  Shield,
  Ruler,
  Share2,
  Plus
} from 'lucide-react';
import { Product, BangleSize, ImageBackgroundMode } from '../../types';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';

interface ProductModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onAddToSelection: (product: Product, selectedSize?: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onOpenWhatsApp: (product: Product, selectedSize?: string) => void;
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
  if (!product) return null;

  // Active gallery image
  const [activeImage, setActiveImage] = useState<string>(product.images.main);
  // Selected bangle size
  const [selectedBangleSize, setSelectedBangleSize] = useState<string>(
    product.bangleSizes ? product.bangleSizes[1] || product.bangleSizes[0] : '2.6'
  );
  const [selectedVariant, setSelectedVariant] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Gallery image list
  const galleryList = [
    { label: 'Main', url: product.images.main },
    ...(product.images.front ? [{ label: 'Front', url: product.images.front }] : []),
    ...(product.images.back ? [{ label: 'Back', url: product.images.back }] : []),
    ...(product.images.detail ? [{ label: 'Detail', url: product.images.detail }] : []),
    ...(product.images.wearing ? [{ label: 'Model', url: product.images.wearing }] : []),
  ];

  // Matching items
  const matchingProducts = allProducts.filter(
    p => product.matchingProductIds?.includes(p.id) && p.id !== product.id
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-luxury-lg overflow-hidden border border-rose-100 max-h-[92vh] flex flex-col">
        
        {/* Header Close & Share bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9E315A]">
              {product.category}
            </span>
            <span className="text-rose-300">•</span>
            <span className="text-xs text-[#5A4550]">{product.subcategory}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-[#3E2F37] hover:text-[#9E315A] hover:bg-rose-50 rounded-full transition-colors relative"
              title="Copy Link"
            >
              <Share2 className="w-4 h-4" />
              {copiedNotification && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-[#241B20] text-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-2 rounded-full transition-colors ${
                isWishlisted ? 'text-[#9E315A] bg-rose-50' : 'text-[#3E2F37] hover:text-[#9E315A] hover:bg-rose-50'
              }`}
              title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#9E315A]' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#3E2F37] hover:text-[#9E315A] hover:bg-rose-50 rounded-full transition-colors ml-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image Display Box */}
            <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden border border-rose-200/80 bg-[#FFF5F8]">
              <img
                src={getOptimizedImageUrl(activeImage, {
                  width: 750,
                  quality: 75,
                  fallbackType: product.category === 'jewellery' ? 'jewellery' : product.category === 'performance' ? 'performance' : 'saree',
                })}
                alt={product.name}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, product.category === 'jewellery' ? 'jewellery' : product.category === 'performance' ? 'performance' : 'saree')}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.isPreOrder && (
                  <span className="bg-[#241B20] text-[#E8CFAF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Pre-Order
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="bg-[#9E315A] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnail Strips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {galleryList.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(item.url)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === item.url
                      ? 'border-[#9E315A] shadow-md scale-105'
                      : 'border-rose-200/70 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(item.url, { width: 160, quality: 60 })}
                    alt={item.label}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, product.category === 'jewellery' ? 'jewellery' : 'general')}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Information, Variants & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Availability tag */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  product.stockStatus === 'In Stock'
                    ? 'bg-emerald-100 text-emerald-800'
                    : product.stockStatus === 'Pre-Order'
                    ? 'bg-purple-100 text-purple-900 font-bold'
                    : product.stockStatus === 'Out of Stock'
                    ? 'bg-gray-800 text-white font-bold'
                    : product.stockStatus === 'Unavailable'
                    ? 'bg-rose-900 text-rose-100 font-bold'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {product.stockStatus === 'Pre-Order'
                    ? '⚡ Custom Pre-Order Available'
                    : product.stockStatus === 'Out of Stock'
                    ? '✕ Out of Stock'
                    : product.stockStatus === 'Unavailable'
                    ? '✕ Currently Unavailable'
                    : `✓ ${product.stockStatus} (${product.stockQuantity} ready)`}
                </span>
                <span className="text-xs text-[#8C5D6C] font-mono">
                  Ref: {product.id}
                </span>
              </div>

              {product.unavailabilityReason && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                  <strong>Status Notice:</strong> {product.unavailabilityReason}
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#241B20] mb-2 leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-serif font-bold text-[#9E315A]">
                  £{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-[#8C5D6C] line-through font-light">
                    £{product.originalPrice}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="text-xs font-bold text-[#9E315A] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    Save £{product.originalPrice! - product.price} ({product.discountPercentage}%)
                  </span>
                )}
              </div>

              <p className="text-sm text-[#5A4550] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Material & Specs */}
              <div className="bg-[#FFF8FA] p-3.5 rounded-2xl border border-rose-100 text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#8C5D6C] font-medium">Fabric / Material:</span>
                  <span className="font-semibold text-[#241B20] text-right">{product.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C5D6C] font-medium">Primary Colour:</span>
                  <span className="font-semibold text-[#241B20]">{product.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C5D6C] font-medium">Collection:</span>
                  <span className="font-semibold text-[#9E315A]">{product.subcategory}</span>
                </div>
              </div>

              {/* Jewellery Bangle Size Selection (Fulfilling Requirement 9) */}
              {product.bangleSizes && product.bangleSizes.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 to-pink-50/50 border border-rose-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Select Bangle Size:</span>
                    </span>
                    <span className="text-xs font-bold text-[#241B20] bg-white px-2 py-0.5 rounded shadow-2xs">
                      Selected: {selectedBangleSize}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {product.bangleSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedBangleSize(size)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedBangleSize === size
                            ? 'bg-[#9E315A] text-white border-[#9E315A] shadow-sm'
                            : 'bg-white text-[#3E2F37] border-rose-200 hover:border-rose-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#8C5D6C] mt-2 font-light">
                    *Standard Indian bangle diameter. Included in WhatsApp enquiry message.
                  </p>
                </div>
              )}

              {/* Custom Variants if present */}
              {product.variants?.map((v) => (
                <div key={v.id} className="mb-4">
                  <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1.5">
                    {v.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariant({ ...selectedVariant, [v.name]: opt })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedVariant[v.name] === opt
                            ? 'bg-[#9E315A] text-white border-[#9E315A]'
                            : 'bg-white text-[#3E2F37] border-rose-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Matching Look Recommendation: Saree + Jewellery Bundle */}
              {matchingProducts.length > 0 && (
                <div className="mb-6 pt-4 border-t border-rose-100">
                  <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C94F7C]" />
                    <span>Complete the Look (Stylist Recommendation):</span>
                  </span>

                  <div className="space-y-2">
                    {matchingProducts.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-100 shadow-2xs hover:border-rose-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getOptimizedImageUrl(match.images?.main, { width: 140, quality: 60, fallbackType: match.category === 'jewellery' ? 'jewellery' : 'saree' })}
                            alt={match.name}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, match.category === 'jewellery' ? 'jewellery' : 'saree')}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#241B20] line-clamp-1">{match.name}</p>
                            <p className="text-[11px] font-semibold text-[#9E315A]">£{match.price}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => onAddToSelection(match)}
                          className="text-xs flex items-center gap-1 bg-rose-50 hover:bg-[#9E315A] text-[#9E315A] hover:text-white px-2.5 py-1.5 rounded-lg font-semibold border border-rose-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Match</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: WhatsApp Concierge + Add to Selection */}
            <div className="pt-6 border-t border-rose-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onAddToSelection(product, selectedBangleSize)}
                  disabled={product.stockStatus === 'Unavailable' || product.stockStatus === 'Out of Stock'}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    product.stockStatus === 'Unavailable' || product.stockStatus === 'Out of Stock'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:brightness-110 text-white shadow-luxury cursor-pointer'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {product.stockStatus === 'Unavailable' || product.stockStatus === 'Out of Stock'
                      ? 'Currently Unavailable'
                      : 'Add to My Selection'}
                  </span>
                </button>

                <button
                  onClick={() => onOpenWhatsApp(product, selectedBangleSize)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>
                    {product.stockStatus === 'Unavailable' || product.stockStatus === 'Out of Stock'
                      ? 'Enquire Restock on WhatsApp'
                      : product.isPreOrder
                      ? 'Pre-Order on WhatsApp'
                      : 'Enquire on WhatsApp'}
                  </span>
                </button>
              </div>

              {/* Trust assurances */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5A4550] pt-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C94F7C]" />
                  <span>UK Royal Mail Tracked Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#C94F7C]" />
                  <span>100% Quality &amp; Fit Guarantee</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
