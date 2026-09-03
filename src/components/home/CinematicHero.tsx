import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Gem,
} from 'lucide-react';

import type { BrandSettings, Product } from '../../types';
import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface CinematicHeroProps {
  onExplore: (category?: string) => void;
  onOpenWhatsApp: () => void;
  settings: BrandSettings;
  products?: Product[];
}

interface EditorialProduct {
  product: Product;
  image: string;
  categoryKey: string;
  categoryLabel: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  heroCategory: string;
  heroHeadline: string;
  heroSubheadline: string;
  tag: string;
  curatorNote: string;
}

const normalizeCategory = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const formatCategory = (value?: string) => {
  if (!value) return 'Collection';

  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getProductImage = (product: Product): string => {
  const images = product.images as
    | {
        main?: string;
        thumbnail?: string;
        url?: string;
        image?: string;
        cover?: string;
      }
    | undefined;

  return (
    images?.main ||
    images?.thumbnail ||
    images?.url ||
    images?.image ||
    images?.cover ||
    ''
  );
};

const getProductPrice = (product: Product): number => {
  const price = Number(product.price);

  return Number.isFinite(price) ? price : 0;
};

const getOriginalPrice = (
  product: Product
): number | undefined => {
  const possiblePrice = Number(
    (product as Product & {
      originalPrice?: number | string;
    }).originalPrice
  );

  return Number.isFinite(possiblePrice) && possiblePrice > 0
    ? possiblePrice
    : undefined;
};

const createSubtitle = (product: Product): string => {
  const description = String(product.description || '').trim();

  if (description) {
    return description;
  }

  const category = formatCategory(product.category);

  return `Discover this ${category.toLowerCase()} from our latest collection.`;
};

const createCuratorNote = (product: Product): string => {
  const description = String(product.description || '').trim();

  if (description) {
    return description;
  }

  return `A carefully selected piece from our ${formatCategory(
    product.category
  ).toLowerCase()} collection.`;
};

const createHeadline = (product: Product): string => {
  const words = String(product.name || '')
    .trim()
    .split(/\s+/);

  if (words.length <= 2) {
    return product.name || 'Meera';
  }

  return words.slice(0, 2).join(' ');
};

const createSubheadline = (product: Product): string => {
  const category = normalizeCategory(product.category);

  switch (category) {
    case 'saree':
    case 'sarees':
      return 'The Saree Collection';

    case 'jewellery':
    case 'jewelry':
      return 'The Jewellery Collection';

    case 'lehenga':
    case 'lehengas':
      return 'The Lehenga Collection';

    case 'shalwar':
    case 'shalwars':
      return 'The Shalwar Collection';

    case 'performance':
    case 'performances':
      return 'The Performance Collection';

    default:
      return `${formatCategory(product.category)} Collection`;
  }
};

const createEditorialProduct = (
  product: Product,
  index: number,
  settings: BrandSettings
): EditorialProduct | null => {
  const image = getProductImage(product);

  if (!image || !product.name) {
    return null;
  }

  const categoryKey = String(
    product.category || ''
  ).trim();

  if (!categoryKey) {
    return null;
  }

  const price = getProductPrice(product);
  const originalPrice = getOriginalPrice(product);

  let discount: number | undefined;

  if (
    originalPrice &&
    originalPrice > price &&
    price >= 0
  ) {
    discount = Math.round(
      ((originalPrice - price) / originalPrice) * 100
    );
  }

  const currencyCode =
    settings.currencyCode || 'LKR';

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  });

  const formattedPrice = formatter.format(price);

  const formattedOriginalPrice =
    originalPrice !== undefined
      ? formatter.format(originalPrice)
      : undefined;

  const categoryLabel = formatCategory(product.category);

  return {
    product,
    image,
    categoryKey,
    categoryLabel,
    title: product.name,
    subtitle: createSubtitle(product),
    price: formattedPrice,
    originalPrice: formattedOriginalPrice,
    discount,
    heroCategory: categoryLabel,
    heroHeadline: createHeadline(product),
    heroSubheadline: createSubheadline(product),
    tag: categoryLabel,
    curatorNote: createCuratorNote(product),
  };
};

export const CinematicHero: React.FC<
  CinematicHeroProps
> = ({
  onExplore,
  onOpenWhatsApp,
  settings,
  products = [],
}) => {
  const [activeLookIndex, setActiveLookIndex] =
    useState<number>(0);

  const [isPaused, setIsPaused] =
    useState<boolean>(false);

  const timerRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);

  /*
   * ============================================================
   * REAL PRODUCTS
   * ============================================================
   */
  const editorialProducts = useMemo(() => {
    return products
      .filter(Boolean)
      .slice(0, 5)
      .map((product, index) =>
        createEditorialProduct(
          product,
          index,
          settings
        )
      )
      .filter(
        (
          item
        ): item is EditorialProduct =>
          Boolean(item)
      );
  }, [products, settings]);

  /*
   * Keep active index valid.
   */
  useEffect(() => {
    if (editorialProducts.length === 0) {
      setActiveLookIndex(0);
      return;
    }

    if (
      activeLookIndex >=
      editorialProducts.length
    ) {
      setActiveLookIndex(0);
    }
  }, [
    editorialProducts.length,
    activeLookIndex,
  ]);

  const activeLook =
    editorialProducts[activeLookIndex];

  /*
   * ============================================================
   * REAL ACCESSORY PRODUCT
   * ============================================================
   */
  const accessoryProduct = useMemo(() => {
    if (!activeLook) return null;

    const jewelleryProduct =
      editorialProducts.find((item) => {
        const category = normalizeCategory(
          item.product.category
        );

        return (
          category === 'jewellery' ||
          category === 'jewelry'
        );
      });

    if (
      jewelleryProduct &&
      jewelleryProduct.product.id !==
        activeLook.product.id
    ) {
      return jewelleryProduct;
    }

    const differentProduct =
      editorialProducts.find(
        (item) =>
          item.product.id !==
          activeLook.product.id
      );

    return differentProduct || null;
  }, [
    editorialProducts,
    activeLook,
  ]);

  /*
   * ============================================================
   * AUTOMATIC SLIDER
   * ============================================================
   */
  useEffect(() => {
    if (
      isPaused ||
      editorialProducts.length <= 1
    ) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      return;
    }

    timerRef.current = setInterval(() => {
      setActiveLookIndex(
        (prev) =>
          (prev + 1) %
          editorialProducts.length
      );
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isPaused,
    editorialProducts.length,
  ]);

  const handleNextLook = () => {
    if (editorialProducts.length <= 1) return;

    setActiveLookIndex(
      (prev) =>
        (prev + 1) %
        editorialProducts.length
    );
  };

  const handlePrevLook = () => {
    if (editorialProducts.length <= 1) return;

    setActiveLookIndex(
      (prev) =>
        (prev - 1 +
          editorialProducts.length) %
        editorialProducts.length
    );
  };

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */
  if (editorialProducts.length === 0) {
    return (
      <section className="relative overflow-hidden bg-[#FFF4F7] text-[#241B20] border-b border-[#C94F7C15]">
        <div className="min-h-[460px] sm:min-h-[520px] flex items-center justify-center px-5 sm:px-6">
          <div className="max-w-xl text-center">
            <div className="mx-auto mb-4 sm:mb-5 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-[#C94F7C20] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#9E315A]" />
            </div>

            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#9E315A] font-bold mb-2 sm:mb-3">
              {settings.brandName || 'Meera Fashion'}
            </p>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic leading-tight mb-3 sm:mb-4">
              New pieces are arriving soon
            </h2>

            <p className="text-xs sm:text-sm text-[#241B20]/65 leading-relaxed mb-5 sm:mb-6">
              Our latest collection will appear here
              once products are available.
            </p>

            <button
              onClick={() => onExplore()}
              className="inline-flex items-center gap-2 bg-[#9E315A] hover:bg-[#C94F7C] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Explore Collection
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden bg-[#FFF4F7] text-[#241B20] border-b border-[#C94F7C15]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Watermark */}
      <div className="hidden 2xl:block absolute top-1/2 right-4 -translate-y-1/2 rotate-90 whitespace-nowrap text-[120px] font-serif text-[#C94F7C08] pointer-events-none select-none uppercase font-bold tracking-tighter z-0">
        {settings.brandName
          ? settings.brandName.toUpperCase()
          : 'MEERA FASHION'}
      </div>

      <div className="w-full mx-auto">

        {/* ======================================================
            MOBILE / TABLET / DESKTOP MAIN GRID
           ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[640px] xl:min-h-[680px]">

          {/* ======================================================
              COLUMN 1 — EDITORIAL NAVIGATION
             ====================================================== */}
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#C94F7C15] flex flex-col p-4 sm:p-6 xl:p-10 justify-between relative bg-white/40 backdrop-blur-xs z-10">

            {/* Mobile Compact Header */}
            <div>

              <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">

                <div className="inline-flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C94F7C] animate-pulse shrink-0" />

                  <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#9E315A] font-bold truncate">
                    Latest Collection
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-rose-500/80 bg-rose-100/60 px-2 py-0.5 rounded-full font-medium shrink-0">

                  {isPaused ? (
                    <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#9E315A]" />
                  ) : (
                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#9E315A]" />
                  )}

                  <span>
                    {editorialProducts.length > 1
                      ? isPaused
                        ? 'Paused'
                        : '5s Auto'
                      : 'Featured'}
                  </span>
                </div>

              </div>

              {/* Main Heading */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-[#241B20] leading-tight mb-2.5 sm:mb-4 tracking-tight">
                Elegance Draped in Every Detail
              </h2>

              <p className="text-[10px] sm:text-xs md:text-sm leading-relaxed text-[#241B20]/75 font-light mb-4 sm:mb-6 max-w-2xl">
                Discover the latest pieces from{' '}
                {settings.brandName ||
                  'Meera Fashion'}
                . Explore our newest products,
                carefully selected for your collection.
              </p>

              {/* Buttons */}
              <div className="flex flex-row sm:flex-row lg:flex-col gap-2 mb-4 sm:mb-6">

                <button
                  onClick={() =>
                    onExplore(
                      activeLook?.categoryKey
                    )
                  }
                  className="flex-1 lg:flex-none flex items-center justify-between bg-[#9E315A] hover:bg-[#C94F7C] text-white px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-xs font-semibold tracking-wider uppercase transition-all shadow-sm group cursor-pointer"
                >
                  <span>
                    Explore Collection
                  </span>

                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onOpenWhatsApp}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-white hover:bg-rose-50 text-[#241B20] border border-[#C94F7C30] px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-xs font-semibold tracking-wider transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#25D366] fill-[#25D366]" />

                  <span>
                    WhatsApp Stylist
                  </span>
                </button>

              </div>
            </div>

            {/* ==================================================
                PRODUCT NAVIGATION
               ================================================== */}
            <div className="space-y-2 sm:space-y-3.5 my-2 sm:my-4 py-2.5 sm:py-4 border-y border-[#C94F7C10]">

              <div className="flex items-center justify-between">

                <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#9E315A]/80 font-bold">
                  Latest Pieces
                </p>

                <span className="text-[9px] sm:text-[10px] font-mono text-[#9E315A] font-bold">
                  0{activeLookIndex + 1} / 0
                  {editorialProducts.length}
                </span>

              </div>

              {/* Mobile: horizontal product navigation */}
              <div className="flex lg:flex-col gap-1.5 sm:gap-2 overflow-x-auto lg:overflow-visible scrollbar-none pb-0.5">

                {editorialProducts.map(
                  (look, idx) => {
                    const isActive =
                      idx === activeLookIndex;

                    return (
                      <button
                        key={
                          look.product.id ||
                          `${look.product.name}-${idx}`
                        }
                        onClick={() =>
                          setActiveLookIndex(
                            idx
                          )
                        }
                        className={`shrink-0 lg:w-full flex items-center justify-between text-left transition-all duration-300 group cursor-pointer p-1.5 sm:p-2 lg:p-1.5 rounded-lg ${
                          isActive
                            ? 'bg-[#FFF0F5] text-[#9E315A] font-bold'
                            : 'text-[#241B20]/60 hover:text-[#9E315A] hover:bg-rose-50/50'
                        }`}
                      >

                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-none">

                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 shrink-0 ${
                              isActive
                                ? 'w-4 sm:w-5 bg-[#C94F7C]'
                                : 'w-1.5 bg-rose-200 group-hover:w-3'
                            }`}
                          />

                          <span className="text-[9px] sm:text-[11px] tracking-wide truncate">
                            {look.title}
                          </span>

                        </div>

                        <span className="text-[8px] sm:text-[10px] font-mono opacity-60 shrink-0 ml-1.5">
                          {look.price}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>
            </div>

            {/* Location / Status */}
            <div className="flex items-center justify-between text-[8px] sm:text-[10px] uppercase tracking-widest pt-1 sm:pt-2 text-[#241B20]/60">

              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />

                <span className="truncate">
                  {settings.address ||
                    'Online Boutique'}
                </span>
              </div>

              <span className="text-rose-400 font-serif italic lowercase text-[9px] sm:text-xs shrink-0 ml-2">
                ready for you
              </span>

            </div>

          </aside>

          {/* ======================================================
              COLUMN 2 — REAL PRODUCT HERO
             ====================================================== */}
          <section className="lg:col-span-6 relative overflow-hidden bg-[#E8CFAF15] flex items-center justify-center p-2.5 sm:p-4 md:p-6 xl:p-10">

            <div className="relative w-full h-[390px] sm:h-[500px] md:h-[560px] xl:h-[580px] rounded-[28px] sm:rounded-[45px] xl:rounded-[72px] overflow-hidden shadow-2xl group border-2 border-white/80">

              <AnimatePresence mode="wait">

                {activeLook && (
                  <motion.div
                    key={
                      activeLook.product.id ||
                      activeLook.title
                    }
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.03,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: 'easeOut',
                    }}
                    className="absolute inset-0 w-full h-full"
                  >

                    {/* Product Image */}
                    <img
                      src={getOptimizedImageUrl(
                        activeLook.image,
                        {
                          width: 850,
                          quality: 75,
                          fallbackType: 'saree',
                        }
                      )}
                      alt={activeLook.title}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) =>
                        handleImageError(
                          e,
                          'saree'
                        )
                      }
                      className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241B20]/90 via-[#241B20]/30 to-transparent z-10" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 z-20 flex items-center justify-between text-white text-xs gap-2">

                      <span className="bg-white/20 backdrop-blur-md border border-white/30 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold truncate max-w-[55%]">
                        {activeLook.heroCategory}
                      </span>

                      <div className="flex items-center gap-1 sm:gap-1.5 bg-[#241B20]/50 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[11px] border border-white/20 shrink-0">

                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E8CFAF]" />

                        <span>
                          Featured
                        </span>

                      </div>

                    </div>

                    {/* Bottom Product Details */}
                    <div className="absolute bottom-4 sm:bottom-7 md:bottom-10 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8 z-20 text-white">

                      <p className="text-[8px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-light text-[#E8CFAF] mb-1">
                        {activeLook.heroSubheadline}
                      </p>

                      <h1 className="text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-serif mb-1.5 sm:mb-2 leading-none tracking-tight line-clamp-2">
                        {activeLook.heroHeadline}
                      </h1>

                      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-white/20">

                        <div className="min-w-0">

                          <span className="text-[9px] sm:text-xs md:text-sm font-semibold text-white/95 block line-clamp-1">
                            {activeLook.title}
                          </span>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[11px] font-mono mt-0.5">

                            <span className="text-rose-200">
                              {activeLook.price}
                            </span>

                            {activeLook.originalPrice && (
                              <span className="text-white/50 line-through">
                                {activeLook.originalPrice}
                              </span>
                            )}

                            {activeLook.discount && (
                              <span className="text-emerald-300 font-semibold">
                                {activeLook.discount}% OFF
                              </span>
                            )}

                          </div>
                        </div>

                        <button
                          onClick={() =>
                            onExplore(
                              activeLook.categoryKey
                            )
                          }
                          className="inline-flex items-center gap-1 text-[9px] sm:text-xs text-[#E8CFAF] hover:text-white font-bold transition-colors bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer shrink-0"
                        >
                          <span>
                            View Piece
                          </span>

                          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>

                      </div>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

              {/* Previous */}
              {editorialProducts.length > 1 && (
                <button
                  onClick={handlePrevLook}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer opacity-80 md:opacity-70 group-hover:opacity-100"
                  aria-label="Previous Product"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Next */}
              {editorialProducts.length > 1 && (
                <button
                  onClick={handleNextLook}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer opacity-80 md:opacity-70 group-hover:opacity-100"
                  aria-label="Next Product"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Progress Bar */}
              {editorialProducts.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/20 z-30 overflow-hidden">

                  <motion.div
                    key={activeLookIndex}
                    initial={{
                      width: '0%',
                    }}
                    animate={{
                      width: isPaused
                        ? '0%'
                        : '100%',
                    }}
                    transition={{
                      duration: 5,
                      ease: 'linear',
                    }}
                    className="h-full bg-gradient-to-r from-[#E8CFAF] to-[#C94F7C]"
                  />

                </div>
              )}

            </div>
          </section>

          {/* ======================================================
              COLUMN 3 — REAL PRODUCT PAIRING
             ====================================================== */}
          <aside className="lg:col-span-3 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-[#C94F7C15] justify-between">

            <div className="p-4 sm:p-5 md:p-7 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">

              {/* Header */}
              <div className="flex justify-between items-center border-b border-[#C94F7C15] pb-2.5 sm:pb-3">

                <div>
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-[#9E315A] block">
                    Curated Pairing
                  </span>

                  <span className="text-[10px] sm:text-xs text-[#5A4550] font-medium">
                    From our collection
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[#9E315A] bg-rose-50 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-serif italic">
                  <span>
                    Look 0
                    {activeLookIndex + 1}
                  </span>
                </div>

              </div>

              {/* Real Accessory/Product */}
              {accessoryProduct ? (
                <div
                  onClick={() =>
                    onExplore(
                      accessoryProduct.categoryKey
                    )
                  }
                  className="group cursor-pointer bg-[#FFF4F7]/70 hover:bg-[#FFF0F4] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#C94F7C20] transition-all duration-300 shadow-2xs hover:shadow-md"
                >

                  <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">

                    <Gem className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#9E315A]" />

                    <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-[#9E315A]">
                      Recommended Match
                    </span>

                  </div>

                  <div className="aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#F8DDE7] mb-2 sm:mb-3 relative border border-rose-200/80">

                    <img
                      src={getOptimizedImageUrl(
                        accessoryProduct.image,
                        {
                          width: 380,
                          quality: 65,
                          fallbackType: 'jewellery',
                        }
                      )}
                      alt={accessoryProduct.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img =
                          e.currentTarget;

                        if (
                          !img.dataset
                            .fallbackApplied
                        ) {
                          img.dataset.fallbackApplied =
                            'true';

                          handleImageError(
                            e,
                            'jewellery'
                          );
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />

                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white/90 backdrop-blur-xs text-[#9E315A] text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                      {
                        accessoryProduct.price
                      }
                    </div>

                  </div>

                  <div>

                    <h4 className="text-[10px] sm:text-xs font-serif font-bold text-[#241B20] group-hover:text-[#9E315A] transition-colors line-clamp-1">
                      {
                        accessoryProduct.title
                      }
                    </h4>

                    <p className="text-[9px] sm:text-[11px] text-[#5A4550] line-clamp-2 mt-0.5">
                      {
                        accessoryProduct.subtitle
                      }
                    </p>

                    <div className="flex items-center justify-between mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-rose-200/50 text-[8px] sm:text-[10px]">

                      <span className="text-[#8C5D6C] font-medium">
                        {
                          accessoryProduct.categoryLabel
                        }
                      </span>

                      <span className="text-[#9E315A] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Explore

                        <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </span>

                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FFF9FA] border border-rose-200/60 text-center">

                  <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-[#9E315A] mx-auto mb-2 sm:mb-3" />

                  <p className="text-[10px] sm:text-xs font-serif font-bold text-[#241B20]">
                    More pieces coming soon
                  </p>

                  <p className="text-[9px] sm:text-[11px] text-[#6C5662] mt-1">
                    Explore our collection for more
                    matching pieces.
                  </p>

                </div>
              )}

              {/* Product Note */}
              {activeLook && (
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FFF9FA] border border-rose-200/60 text-xs space-y-1">

                  <div className="flex items-center gap-1.5 text-[#9E315A] font-semibold text-[9px] sm:text-[11px]">

                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />

                    <span>
                      Featured Product
                    </span>

                  </div>

                  <p className="text-[9px] sm:text-[11px] text-[#6C5662] leading-relaxed italic line-clamp-3 sm:line-clamp-4">
                    "{activeLook.curatorNote}"
                  </p>

                </div>
              )}

            </div>

            {/* WhatsApp */}
            <div
              onClick={onOpenWhatsApp}
              className="p-3.5 sm:p-5 bg-gradient-to-r from-[#C94F7C] to-[#9E315A] text-white flex items-center justify-between cursor-pointer hover:from-[#9E315A] hover:to-[#88284C] transition-all duration-300 shadow-md group"
            >

              <div className="flex flex-col min-w-0">

                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 font-bold text-rose-100">
                  Instant Styling &amp; Advice
                </span>

                <span className="text-xs sm:text-sm font-serif italic text-white flex items-center gap-1.5">

                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />

                  <span className="truncate">
                    Enquire on WhatsApp
                  </span>

                </span>

              </div>

              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>

            </div>

          </aside>

        </div>
      </div>
    </section>
  );
};

export default CinematicHero;
