import React from 'react';
import { Sparkles, MessageCircle, ShoppingBag, CheckCircle2, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';

interface PerformanceShowcaseProps {
  performanceProduct: Product;
  onQuickView: (product: Product) => void;
  onAddToSelection: (product: Product) => void;
  onOpenWhatsAppForProduct: (product: Product) => void;
}

export const PerformanceShowcase: React.FC<PerformanceShowcaseProps> = ({
  performanceProduct,
  onQuickView,
  onAddToSelection,
  onOpenWhatsAppForProduct,
}) => {
  const highlights = [
    'Pre-pleated high-mobility drape tailored for classical stage movements',
    '7-piece matching antique matte temple gold jewellery set included',
    'Custom bangle sizing from 2.2 to 3.0 with secure locking mechanisms',
    'Lightweight non-slip temple brass with authentic ruby & emerald cabochons',
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#FFF5F8] via-[#FFF0F5] to-[#F8DDE7]/40 relative overflow-hidden">
      {/* Subtle background flourishes */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#C94F7C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#B76E79]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-rose-200/70">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#9E315A] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C94F7C]" />
              <span>Special Collection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#241B20]">
              The Meera Performance Edit
            </h2>
            <p className="text-sm sm:text-base text-[#5A4550] mt-1 max-w-xl">
              Specially styled combinations of traditional performance sarees and heirloom temple jewellery sets for dancers and cultural events.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8C5D6C] bg-white/80 border border-rose-200 px-3 py-1.5 rounded-full shadow-xs">
              Saree + Temple Jewellery Set
            </span>
          </div>
        </div>

        {/* Hero Performance Showcase Box */}
        <div className="bg-white rounded-3xl border border-rose-200/80 shadow-luxury-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Visual Photography Gallery */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] bg-[#FFF0F5] flex items-center justify-center p-6 sm:p-8">
            <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center">
              
              {/* Main Performance Photo */}
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden shadow-luxury border-2 border-white">
                <img
                  src={getOptimizedImageUrl(performanceProduct?.images?.main || "/src/assets/images/meera_performance_set_1788152305062.jpg", { width: 750, quality: 75, fallbackType: 'performance' })}
                  alt="Meera Performance Dance Set"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'performance')}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 glass-dark text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                  Curated Dance Bundle
                </div>

                <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
                  Save £71 on Bundle
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Set Composition & Direct Actions */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-white to-[#FFF9FB]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-widest text-[#C94F7C] uppercase">
                  Complete Stage Ensemble
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                  ✓ In Stock Ready to Ship
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#241B20] mb-3 leading-tight">
                {performanceProduct?.name || "The Royal Meera Performance Dance Set"}
              </h3>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-serif font-bold text-[#9E315A]">
                  £{performanceProduct?.price || 249}
                </span>
                {performanceProduct?.originalPrice && (
                  <span className="text-lg text-[#8C5D6C] line-through font-light">
                    £{performanceProduct.originalPrice}
                  </span>
                )}
                <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                  22% OFF
                </span>
              </div>

              <p className="text-sm text-[#5A4550] leading-relaxed mb-6">
                {performanceProduct?.description ||
                  'Curated specifically for classical Bharatanatyam, Kuchipudi, and festive stage performances. Includes pre-pleated shimmer silk saree and 7-piece antique temple jewellery set.'}
              </p>

              {/* Set Highlights Checklist */}
              <div className="space-y-2.5 mb-8">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3E2F37]">
                    <CheckCircle2 className="w-4 h-4 text-[#C94F7C] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-rose-100 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onAddToSelection(performanceProduct)}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:brightness-110 text-white py-3.5 px-5 rounded-xl font-semibold text-sm shadow-luxury transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Set to Selection</span>
                </button>

                <button
                  onClick={() => onQuickView(performanceProduct)}
                  className="w-full sm:w-auto px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-[#9E315A] border border-rose-200 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Inspect Set Details
                </button>
              </div>

              <button
                onClick={() => onOpenWhatsAppForProduct(performanceProduct)}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enquire Sizing &amp; Dance Set on WhatsApp</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
