import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { ProductCategory } from '../../types';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';

interface CategoryBoutiqueProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const CategoryBoutique: React.FC<CategoryBoutiqueProps> = ({
  onSelectCategory,
}) => {
  const categories = [
    {
      id: 'sarees' as ProductCategory,
      title: 'Kanjivaram & Silk Sarees',
      subtitle: 'Pure Mulberry Silk, Zari Borders & Bridal Drapes',
      tag: 'Signature Edit',
      count: '8+ Designs',
      image: '/src/assets/images/meera_hero_model_1788152289614.jpg',
      span: 'col-span-1 md:col-span-2 lg:col-span-7',
    },
    {
      id: 'jewellery' as ProductCategory,
      title: 'Temple & Kundan Jewellery',
      subtitle: 'Bangle Stacks (2.2 - 3.0), Jhumkas & Chokers',
      tag: 'Size Customization',
      count: '15+ Pieces',
      image: '/src/assets/images/meera_jewellery_bangles_1788152322855.jpg',
      span: 'col-span-1 md:col-span-1 lg:col-span-5',
    },
    {
      id: 'performance' as ProductCategory,
      title: 'The Dance Performance Edit',
      subtitle: 'Coordinated Saree + Antique Temple Jewellery Sets',
      tag: 'Classical & Stage',
      count: 'Curated Combos',
      image: '/src/assets/images/meera_performance_set_1788152305062.jpg',
      span: 'col-span-1 md:col-span-1 lg:col-span-5',
      featured: true,
    },
    {
      id: 'lehengas' as ProductCategory,
      title: 'Bridal & Festive Lehengas',
      subtitle: '16-Kali Raw Silk, Resham Embroidery & Double Dupatta',
      tag: 'Heirloom Craft',
      count: 'Custom Tailored',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=650&q=70',
      span: 'col-span-1 md:col-span-1 lg:col-span-4',
    },
    {
      id: 'shalwar' as ProductCategory,
      title: 'Designer Shalwar Suits',
      subtitle: 'Floor-Length Anarkalis & Embellished Georgette',
      tag: 'Ready to Wear',
      count: 'UK 8 - 16',
      image: 'https://images.unsplash.com/photo-1583391733975-042c7b578f86?auto=format&fit=crop&w=500&q=70',
      span: 'col-span-1 md:col-span-1 lg:col-span-3',
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-b border-rose-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-[0.25em] text-[#9E315A] uppercase font-display">
            Curated Boutiques
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#241B20] mt-2 mb-3">
            Explore Our Signature Categories
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#C94F7C] to-transparent mx-auto mb-3" />
          <p className="text-sm sm:text-base text-[#5A4550]">
            From heirloom silk sarees and temple dance sets to handcrafted jewellery bangles tailored to your exact fit.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative overflow-hidden rounded-3xl bg-[#FFF0F5] border border-rose-100 shadow-luxury hover:shadow-luxury-lg transition-all duration-500 cursor-pointer min-h-[280px] sm:min-h-[320px] flex flex-col justify-end p-6 ${cat.span}`}
            >
              {/* Background Image with Zoom on Hover */}
              <div className="absolute inset-0 z-0">
                <img
                  src={getOptimizedImageUrl(cat.image, { width: 650, quality: 70 })}
                  alt={cat.title}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) =>
                    handleImageError(
                      e,
                      cat.id === 'jewellery'
                        ? 'jewellery'
                        : cat.id === 'performance'
                        ? 'performance'
                        : 'saree'
                    )
                  }
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                />
                {/* Luxury Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#241B20]/90 via-[#241B20]/40 to-transparent group-hover:via-[#241B20]/30 transition-colors duration-300" />
              </div>

              {/* Top pill badge */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span className="glass-dark text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-white/20 shadow-xs">
                  {cat.tag}
                </span>
                {cat.featured && (
                  <span className="bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E8CFAF]" />
                    <span>Popular</span>
                  </span>
                )}
              </div>

              {/* Top Right Action Circle */}
              <div className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-[#C94F7C] group-hover:text-white transition-all duration-300 transform group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              {/* Bottom Details Content */}
              <div className="relative z-10 text-white transform transition-transform duration-300 group-hover:-translate-y-1">
                <span className="text-xs font-semibold text-[#F8DDE7] tracking-widest uppercase">
                  {cat.count}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1 mb-1 group-hover:text-[#F8DDE7] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm text-rose-100/90 font-light line-clamp-2">
                  {cat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
