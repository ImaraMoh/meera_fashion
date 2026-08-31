import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  CheckCircle2,
  Gem
} from 'lucide-react';
import { BrandSettings } from '../../types';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';

interface CinematicHeroProps {
  onExplore: (category?: string) => void;
  onOpenWhatsApp: () => void;
  settings: BrandSettings;
}

interface EditorialLook {
  id: string;
  categoryKey: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  heroImage: string;
  heroCategory: string;
  accessoryTitle: string;
  accessorySubtitle: string;
  accessorySizes: string;
  accessoryPrice: string;
  accessoryImage: string;
  tag: string;
  heroHeadline: string;
  heroSubheadline: string;
  curatorNote: string;
}

const EDITORIAL_LOOKS: EditorialLook[] = [
  {
    id: '01',
    categoryKey: 'sarees',
    title: 'Royal Rose Silk Kanjivaram',
    subtitle: 'Pure Mulberry Silk with Woven 24K Rose Zari Border',
    price: '£149',
    originalPrice: '£199',
    heroImage: '/src/assets/images/meera_hero_model_1788152289614.jpg',
    heroCategory: 'Haute Bridal Silk',
    accessoryTitle: 'Rose Gold Bridal Bangle Stack',
    accessorySubtitle: 'Hand-set CZ stones with matte gold micro-plating',
    accessorySizes: '2.2, 2.4, 2.6, 2.8, 3.0',
    accessoryPrice: '£45',
    accessoryImage: '/src/assets/images/meera_jewellery_bangles_1788152322855.jpg',
    tag: 'Bridal Kanjivaram',
    heroHeadline: 'Meera',
    heroSubheadline: 'The Royal Rose Silk Collection',
    curatorNote: 'Paired with our bespoke Rose Gold Bangle Suite. Each silk fold is hand-tested for fluid drape.',
  },
  {
    id: '02',
    categoryKey: 'jewellery',
    title: 'Antique Temple Heritage Haram',
    subtitle: '7-Piece South Indian Bridal Haram with Lakshmi Motif',
    price: '£78',
    originalPrice: '£110',
    heroImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=750&q=70',
    heroCategory: 'Heirloom Temple Jewellery',
    accessoryTitle: 'Padmavati Kundan Bangle Suite',
    accessorySubtitle: 'Emerald & Ruby studded openable kada bangles',
    accessorySizes: '2.4, 2.6, 2.8',
    accessoryPrice: '£42',
    accessoryImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=65',
    tag: 'Temple Heritage',
    heroHeadline: 'Parampara',
    heroSubheadline: 'Handcrafted Antique Temple Gold',
    curatorNote: 'Finished in 24K matte antique gold polish with heirloom Kundan stones and adjustable dori.',
  },
  {
    id: '03',
    categoryKey: 'performance',
    title: 'Mayil Peethambari Stage Ensemble',
    subtitle: 'Bharatanatyam Costume with Coordinated Zari Pleats',
    price: '£135',
    originalPrice: '£175',
    heroImage: '/src/assets/images/meera_performance_set_1788152305062.jpg',
    heroCategory: 'Classical Dance Edit',
    accessoryTitle: 'Authentic Stage Brass Ghungroos & Belt',
    accessorySubtitle: '3-Line leather bound bells & antique copper waist oddiyanam',
    accessorySizes: 'Custom Fitted',
    accessoryPrice: '£38',
    accessoryImage: 'https://images.unsplash.com/photo-1611591475152-473523daec6e?auto=format&fit=crop&w=400&q=65',
    tag: 'Dance Performance',
    heroHeadline: 'Nritya',
    heroSubheadline: 'Classical Stage Performance Archives',
    curatorNote: 'Stage-tested acoustic clarity with authentic padded leather straps and traditional temple jewellery.',
  },
  {
    id: '04',
    categoryKey: 'lehengas',
    title: 'Gulabi Rani Zardozi Bridal Lehenga',
    subtitle: 'Raw Silk 16-Kali Silhouette with Wire Embroidery & Dual Dupatta',
    price: '£260',
    originalPrice: '£340',
    heroImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=750&q=70',
    heroCategory: 'Couture Lehengas',
    accessoryTitle: 'Handcrafted Zardozi Potli & Matha Patti',
    accessorySubtitle: 'Matching raw silk evening purse & pearl matha patti',
    accessorySizes: 'One Size & Adjustable',
    accessoryPrice: '£55',
    accessoryImage: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&q=65',
    tag: 'Bridal Couture',
    heroHeadline: 'Rani',
    heroSubheadline: 'Handcrafted Heritage Lehengas',
    curatorNote: 'Embellished with over 80 hours of hand-embroidery. Available for bespoke London bridal consultations.',
  },
  {
    id: '05',
    categoryKey: 'sarees',
    title: 'Peacock Teal Banarasi Tissue Saree',
    subtitle: 'Lightweight Katan Silk with Kadwa Floral Jaal & Gold Pallu',
    price: '£165',
    originalPrice: '£215',
    heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=750&q=70',
    heroCategory: 'Banarasi Weaves',
    accessoryTitle: 'Meenakari Chandbali & Ring Set',
    accessorySubtitle: 'Hand-painted enamel floral drop earrings with pearl clusters',
    accessorySizes: 'Universal Fit',
    accessoryPrice: '£48',
    accessoryImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=65',
    tag: 'Banarasi Silks',
    heroHeadline: 'Varanasi',
    heroSubheadline: 'Imperial Handloom Heritage',
    curatorNote: 'Woven with featherlight gold tissue silk, giving radiant luminescence under natural or stage lighting.',
  },
];

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  onExplore,
  onOpenWhatsApp,
  settings,
}) => {
  const [activeLookIndex, setActiveLookIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeLook = EDITORIAL_LOOKS[activeLookIndex];

  // 5-Second Automatic Image Animation & Transition Loop
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % EDITORIAL_LOOKS.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeLookIndex]);

  const handleNextLook = () => {
    setActiveLookIndex((prev) => (prev + 1) % EDITORIAL_LOOKS.length);
  };

  const handlePrevLook = () => {
    setActiveLookIndex((prev) => (prev - 1 + EDITORIAL_LOOKS.length) % EDITORIAL_LOOKS.length);
  };

  return (
    <section
      className="relative overflow-hidden bg-[#FFF4F7] text-[#241B20] border-b border-[#C94F7C15]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Subtle Watermark Text */}
      <div className="hidden 2xl:block absolute top-1/2 right-4 -translate-y-1/2 rotate-90 whitespace-nowrap text-[120px] font-serif text-[#C94F7C08] pointer-events-none select-none uppercase font-bold tracking-tighter z-0">
        {settings.brandName ? settings.brandName.toUpperCase() : 'MEERA FASHION'}
      </div>

      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] xl:min-h-[680px]">
          
          {/* ========================================================
              COLUMN 1: Left Editorial Narrative & Edition Navigator
             ======================================================== */}
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#C94F7C15] flex flex-col p-6 sm:p-8 xl:p-10 justify-between relative bg-white/40 backdrop-blur-xs z-10">
            <div>
              {/* Issue Metadata & 5s Autoplay Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C94F7C] animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#9E315A] font-bold">
                    Editorial Edit 2026
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-rose-500/80 bg-rose-100/60 px-2 py-0.5 rounded-full font-medium">
                  {isPaused ? <Pause className="w-3 h-3 text-[#9E315A]" /> : <Play className="w-3 h-3 text-[#9E315A]" />}
                  <span>{isPaused ? 'Paused' : '5s Auto'}</span>
                </div>
              </div>

              {/* Display Italic Headline */}
              <h2 className="text-3xl sm:text-4xl font-serif italic text-[#241B20] leading-tight mb-4 tracking-tight">
                Elegance Draped in Every Detail
              </h2>

              <p className="text-xs sm:text-sm leading-relaxed text-[#241B20]/75 font-light mb-6">
                Discover our {settings.address || 'London boutique'} of pure woven silk sarees, handcrafted temple jewellery, and royal bridal silhouettes.
              </p>

              {/* Main Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 mb-6">
                <button
                  onClick={() => onExplore(activeLook.categoryKey)}
                  className="flex items-center justify-between bg-[#9E315A] hover:bg-[#C94F7C] text-white px-5 py-3 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-sm group cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onOpenWhatsApp}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-[#241B20] border border-[#C94F7C30] px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                  <span>WhatsApp Stylist</span>
                </button>
              </div>
            </div>

            {/* Interactive Editorial Chapters & Slide Progress Bars */}
            <div className="space-y-3.5 my-4 py-4 border-y border-[#C94F7C10]">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-widest text-[#9E315A]/80 font-bold">
                  Curated Chapters
                </p>
                <span className="text-[10px] font-mono text-[#9E315A] font-bold">
                  0{activeLookIndex + 1} / 0{EDITORIAL_LOOKS.length}
                </span>
              </div>

              <div className="space-y-2">
                {EDITORIAL_LOOKS.map((look, idx) => {
                  const isActive = idx === activeLookIndex;
                  return (
                    <button
                      key={look.id}
                      onClick={() => setActiveLookIndex(idx)}
                      className={`w-full flex items-center justify-between text-left transition-all duration-300 group cursor-pointer p-1.5 rounded-lg ${
                        isActive ? 'bg-[#FFF0F5] text-[#9E315A] font-bold' : 'text-[#241B20]/60 hover:text-[#9E315A] hover:bg-rose-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            isActive ? 'w-5 bg-[#C94F7C]' : 'w-1.5 bg-rose-200 group-hover:w-3'
                          }`}
                        />
                        <span className="text-[11px] tracking-wide truncate">
                          {look.tag}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono opacity-60 shrink-0">
                        {look.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social & Boutique City Tag */}
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest pt-2 text-[#241B20]/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{settings.address || 'London Boutique'}</span>
              </div>
              <span className="text-rose-400 font-serif italic lowercase text-xs">
                ready for dispatch
              </span>
            </div>
          </aside>


          {/* ========================================================
              COLUMN 2: Center Dramatic Arch Showcase (Animated every 5s)
             ======================================================== */}
          <section className="lg:col-span-6 relative overflow-hidden bg-[#E8CFAF15] flex items-center justify-center p-3 sm:p-6 xl:p-10">
            <div className="relative w-full h-[460px] sm:h-[530px] xl:h-[580px] rounded-[36px] sm:rounded-[60px] xl:rounded-[72px] overflow-hidden shadow-2xl group border-2 border-white/80">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLook.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Visual High-Resolution Image */}
                  <img
                    src={getOptimizedImageUrl(activeLook.heroImage, { width: 850, quality: 75, fallbackType: 'saree' })}
                    alt={activeLook.title}
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, 'saree')}
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />

                  {/* Luxury Scrim Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241B20]/90 via-[#241B20]/30 to-transparent z-10" />

                  {/* Editorial Top Badge */}
                  <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between text-white text-xs">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold">
                      {activeLook.heroCategory}
                    </span>
                    <div className="flex items-center gap-1.5 bg-[#241B20]/50 backdrop-blur-md px-3 py-1 rounded-full text-[11px] border border-white/20">
                      <Sparkles className="w-3 h-3 text-[#E8CFAF]" />
                      <span>Pure Zari &amp; Silk</span>
                    </div>
                  </div>

                  {/* Editorial Big Display Typography (Overlay at Bottom) */}
                  <div className="absolute bottom-6 sm:bottom-10 left-5 sm:left-8 right-5 sm:right-8 z-20 text-white">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-light text-[#E8CFAF] mb-1">
                      {activeLook.heroSubheadline}
                    </p>
                    <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif mb-2 leading-none tracking-tight">
                      {activeLook.heroHeadline}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/20">
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-white/95 block">
                          {activeLook.title}
                        </span>
                        <span className="text-[11px] text-rose-200 font-mono">
                          {activeLook.price} • {activeLook.subtitle}
                        </span>
                      </div>

                      <button
                        onClick={() => onExplore(activeLook.categoryKey)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#E8CFAF] hover:text-white font-bold transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer"
                      >
                        <span>View Piece</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Floating Navigation Arrows */}
              <button
                onClick={handlePrevLook}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100"
                aria-label="Previous Look"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextLook}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100"
                aria-label="Next Look"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Bottom 5s Auto-play Animated Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
                <motion.div
                  key={activeLookIndex}
                  initial={{ width: '0%' }}
                  animate={{ width: isPaused ? '0%' : '100%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-[#E8CFAF] to-[#C94F7C]"
                />
              </div>

            </div>
          </section>


          {/* ========================================================
              COLUMN 3: Right Column: Distinct Accessory Pairing & Concierge
             ======================================================== */}
          <aside className="lg:col-span-3 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-[#C94F7C15] justify-between">
            <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
              
              {/* Header with Look Index & Verified Badge */}
              <div className="flex justify-between items-center border-b border-[#C94F7C15] pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#9E315A] block">
                    Curated Pairing
                  </span>
                  <span className="text-xs text-[#5A4550] font-medium">Distinct Matching Accessory</span>
                </div>
                <div className="flex items-center gap-1 text-[#9E315A] bg-rose-50 px-2 py-0.5 rounded-full text-xs font-bold font-serif italic">
                  <span>Look 0{activeLookIndex + 1}</span>
                </div>
              </div>

              {/* Dedicated Complementary Jewellery / Accessory Card (NEVER same photo as center) */}
              <div
                onClick={() => onExplore('jewellery')}
                className="group cursor-pointer bg-[#FFF4F7]/70 hover:bg-[#FFF0F4] p-3.5 rounded-2xl border border-[#C94F7C20] transition-all duration-300 shadow-2xs hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gem className="w-3.5 h-3.5 text-[#9E315A]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#9E315A]">
                    Recommended Match
                  </span>
                </div>

                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F8DDE7] mb-3 relative border border-rose-200/80">
                  <img
                    src={getOptimizedImageUrl(activeLook.accessoryImage, { width: 380, quality: 65, fallbackType: 'jewellery' })}
                    alt={activeLook.accessoryTitle}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, 'jewellery')}
                    className="w-full h-full object-cover group-hover:scale-108 transition-all duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[#9E315A] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                    {activeLook.accessoryPrice}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-serif font-bold text-[#241B20] group-hover:text-[#9E315A] transition-colors line-clamp-1">
                    {activeLook.accessoryTitle}
                  </h4>
                  <p className="text-[11px] text-[#5A4550] line-clamp-1 mt-0.5">
                    {activeLook.accessorySubtitle}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-200/50 text-[10px]">
                    <span className="text-[#8C5D6C] font-medium">Sizes: {activeLook.accessorySizes}</span>
                    <span className="text-[#9E315A] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Stylist Curator Note */}
              <div className="p-3 rounded-2xl bg-[#FFF9FA] border border-rose-200/60 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#9E315A] font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>London Stylist Curation</span>
                </div>
                <p className="text-[11px] text-[#6C5662] leading-relaxed italic">
                  "{activeLook.curatorNote}"
                </p>
              </div>

            </div>

            {/* Bottom Instant Checkout & WhatsApp Concierge Bar */}
            <div
              onClick={onOpenWhatsApp}
              className="p-5 bg-gradient-to-r from-[#C94F7C] to-[#9E315A] text-white flex items-center justify-between cursor-pointer hover:from-[#9E315A] hover:to-[#88284C] transition-all duration-300 shadow-md group"
            >
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] mb-0.5 font-bold text-rose-100">
                  Instant Styling &amp; Advice
                </span>
                <span className="text-sm font-serif italic text-white flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span>Enquire on WhatsApp</span>
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
};


