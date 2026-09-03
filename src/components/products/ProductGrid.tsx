import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  ArrowUpDown,
  RotateCcw,
  ShoppingBag,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  Product,
  BrandSettings,
} from '../../types';

import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onQuickView: (product: Product) => void;
  onAddToSelection: (
    product: Product,
    size?: string
  ) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
  onOpenWhatsApp: (
    product: Product,
    size?: string
  ) => void;
  searchQuery?: string;
  settings?: BrandSettings;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currentCategory,
  onSelectCategory,
  onQuickView,
  onAddToSelection,
  onToggleWishlist,
  wishlistIds,
  onOpenWhatsApp,
  searchQuery = '',
  settings,
}) => {
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string>('all');

  const [sortBy, setSortBy] = useState<
    | 'featured'
    | 'price-asc'
    | 'price-desc'
    | 'newest'
    | 'discount'
  >('featured');

  const [stockFilter, setStockFilter] = useState<
    'all' | 'in-stock' | 'pre-order'
  >('all');

  const [priceRange, setPriceRange] = useState<
    | 'all'
    | 'under-50'
    | '50-150'
    | '150-250'
    | 'above-250'
  >('all');

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const [itemsPerPage, setItemsPerPage] =
    useState<number>(8);

  const gridTopRef =
    useRef<HTMLDivElement>(null);

  /**
   * ============================================================
   * RESET WHEN CATEGORY CHANGES
   * ============================================================
   */

  useEffect(() => {
    setSelectedSubcategory('all');
    setCurrentPage(1);
  }, [currentCategory]);

  /**
   * ============================================================
   * RESET PAGE WHEN FILTERS CHANGE
   * ============================================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSubcategory,
    sortBy,
    stockFilter,
    priceRange,
    searchQuery,
    itemsPerPage,
  ]);

  /**
   * ============================================================
   * CATEGORY DEFINITIONS
   * ============================================================
   */

  const categoryDefinitions = [
    {
      id: 'all',
      label: 'All Collections',
      count: products.length,
      desc:
        'Browse our entire curated London boutique of handcrafted sarees, heirloom jewellery, and couture ensembles.',
    },
    {
      id: 'sarees',
      label: 'Sarees',
      count: products.filter(
        (p) => p.category === 'sarees'
      ).length,
      desc:
        'Pure Kanjivaram silks, Banarasi organza, and Mysore crepe sarees woven with rose-tinted gold zari.',
    },
    {
      id: 'jewellery',
      label: 'Jewellery',
      count: products.filter(
        (p) => p.category === 'jewellery'
      ).length,
      desc:
        'Handcrafted Kundan bangles, 24K matte antique temple harams, jhumkas, and Padmavati bridal choker sets.',
    },
    {
      id: 'shalwar',
      label: 'Shalwar & Suits',
      count: products.filter(
        (p) => p.category === 'shalwar'
      ).length,
      desc:
        'Velvet Anarkali suits, tiered sharara sets, and hand-embroidered Lucknowi Chikankari ensembles.',
    },
    {
      id: 'lehengas',
      label: 'Lehengas',
      count: products.filter(
        (p) => p.category === 'lehengas'
      ).length,
      desc:
        'Opulent bridal raw silk and micro-velvet lehengas embellished with 3D Zardozi and foil mirror embroidery.',
    },
    {
      id: 'performance',
      label: 'Dance Edit',
      count: products.filter(
        (p) =>
          p.category === 'performance' ||
          p.isDancePerformance
      ).length,
      desc:
        'Stage-ready classical dance sarees, stitched costume sets, brass ghungroos, and temple dance jewellery.',
    },
    {
      id: 'offers',
      label: 'Exclusive Offers',
      count: products.filter(
        (p) => p.isOffer
      ).length,
      desc:
        'Special seasonal promotional pricing and bridal bundle savings on selected heirloom pieces.',
    },
  ];

  /**
   * ============================================================
   * ACTIVE CATEGORY
   * ============================================================
   */

  const activeCategoryMeta =
    categoryDefinitions.find(
      (c) => c.id === currentCategory
    ) ||
    categoryDefinitions[0];

  /**
   * ============================================================
   * SUBCATEGORIES
   * ============================================================
   */

  const subcategories = useMemo(() => {
    let relevant: Product[];

    if (currentCategory === 'all') {
      relevant = products;
    } else if (currentCategory === 'offers') {
      relevant = products.filter(
        (p) => p.isOffer
      );
    } else if (currentCategory === 'performance') {
      relevant = products.filter(
        (p) =>
          p.category === 'performance' ||
          p.isDancePerformance
      );
    } else {
      relevant = products.filter(
        (p) =>
          p.category === currentCategory
      );
    }

    const set = new Set<string>();

    relevant.forEach((p) => {
      if (
        p.subcategory &&
        p.subcategory.trim()
      ) {
        set.add(p.subcategory.trim());
      }
    });

    return Array.from(set).sort();
  }, [
    products,
    currentCategory,
  ]);

  /**
   * ============================================================
   * FILTER + SORT
   * ============================================================
   */

  const filteredProducts = useMemo(() => {
    let list = [...products];

    /**
     * Category
     */

    if (currentCategory !== 'all') {
      if (currentCategory === 'offers') {
        list = list.filter(
          (p) => p.isOffer
        );
      } else if (
        currentCategory === 'performance'
      ) {
        list = list.filter(
          (p) =>
            p.category === 'performance' ||
            p.isDancePerformance
        );
      } else {
        list = list.filter(
          (p) =>
            p.category === currentCategory
        );
      }
    }

    /**
     * Subcategory
     */

    if (
      selectedSubcategory !== 'all'
    ) {
      list = list.filter(
        (p) =>
          p.subcategory ===
          selectedSubcategory
      );
    }

    /**
     * Search
     */

    const trimmedQuery =
      (searchQuery || '').trim();

    if (trimmedQuery) {
      const q =
        trimmedQuery.toLowerCase();

      list = list.filter(
        (p) =>
          (p.name || '')
            .toLowerCase()
            .includes(q) ||
          (p.description || '')
            .toLowerCase()
            .includes(q) ||
          (p.subcategory || '')
            .toLowerCase()
            .includes(q) ||
          (p.material || '')
            .toLowerCase()
            .includes(q) ||
          (p.color || '')
            .toLowerCase()
            .includes(q)
      );
    }

    /**
     * Stock
     */

    if (
      stockFilter === 'in-stock'
    ) {
      list = list.filter(
        (p) =>
          p.stockStatus ===
            'In Stock' ||
          p.stockStatus ===
            'Low Stock'
      );
    } else if (
      stockFilter === 'pre-order'
    ) {
      list = list.filter(
        (p) => p.isPreOrder
      );
    }

    /**
     * Price
     */

    if (
      priceRange === 'under-50'
    ) {
      list = list.filter(
        (p) => p.price < 50
      );
    } else if (
      priceRange === '50-150'
    ) {
      list = list.filter(
        (p) =>
          p.price >= 50 &&
          p.price <= 150
      );
    } else if (
      priceRange === '150-250'
    ) {
      list = list.filter(
        (p) =>
          p.price > 150 &&
          p.price <= 250
      );
    } else if (
      priceRange === 'above-250'
    ) {
      list = list.filter(
        (p) => p.price > 250
      );
    }

    /**
     * Sorting
     */

    if (sortBy === 'price-asc') {
      list.sort(
        (a, b) =>
          a.price - b.price
      );
    } else if (
      sortBy === 'price-desc'
    ) {
      list.sort(
        (a, b) =>
          b.price - a.price
      );
    } else if (
      sortBy === 'newest'
    ) {
      list.sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
    } else if (
      sortBy === 'discount'
    ) {
      list.sort(
        (a, b) =>
          (b.discountPercentage || 0) -
          (a.discountPercentage || 0)
      );
    }

    return list;
  }, [
    products,
    currentCategory,
    selectedSubcategory,
    stockFilter,
    priceRange,
    sortBy,
    searchQuery,
  ]);

  /**
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        itemsPerPage
    )
  );

  const paginatedProducts =
    useMemo(() => {
      if (itemsPerPage >= 999) {
        return filteredProducts;
      }

      const start =
        (currentPage - 1) *
        itemsPerPage;

      return filteredProducts.slice(
        start,
        start + itemsPerPage
      );
    }, [
      filteredProducts,
      currentPage,
      itemsPerPage,
    ]);

  /**
   * ============================================================
   * PAGE CHANGE
   * ============================================================
   */

  const handlePageChange = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    requestAnimationFrame(() => {
      gridTopRef.current?.scrollIntoView(
        {
          behavior: 'smooth',
          block: 'start',
        }
      );
    });
  };

  /**
   * ============================================================
   * FILTER COUNT
   * ============================================================
   */

  const activeFiltersCount =
    (selectedSubcategory !== 'all'
      ? 1
      : 0) +
    (stockFilter !== 'all'
      ? 1
      : 0) +
    (priceRange !== 'all'
      ? 1
      : 0) +
    (sortBy !== 'featured'
      ? 1
      : 0) +
    ((searchQuery || '').trim() !== ''
      ? 1
      : 0);

  /**
   * ============================================================
   * RESET
   * ============================================================
   */

  const resetAllFilters = () => {
    setSelectedSubcategory('all');
    setStockFilter('all');
    setPriceRange('all');
    setSortBy('featured');
    setCurrentPage(1);
  };

  /**
   * ============================================================
   * ITEM COUNTS
   * ============================================================
   */

  const startItemNumber =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endItemNumber =
    Math.min(
      currentPage * itemsPerPage,
      filteredProducts.length
    );

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <section
      ref={gridTopRef}
      id="boutique-catalog"
      className="mx-auto max-w-7xl scroll-mt-20 px-3 py-7 sm:px-6 sm:py-12 lg:px-8"
    >

      {/* ======================================================
          CATEGORY HEADER
      ====================================================== */}

      <div className="mb-5 sm:mb-8">

        <div className="flex flex-col gap-3 border-b border-[#C94F7C20] pb-4 sm:flex-row sm:items-end sm:justify-between">

          <div className="min-w-0">

            <div className="mb-1 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#9E315A] sm:h-2 sm:w-2" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9E315A] sm:text-[11px] sm:tracking-[0.22em]">
                Meera London Curations
              </span>

            </div>

            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#241B20] sm:text-3xl">
              {activeCategoryMeta.label}
            </h2>

            <p className="mt-1 line-clamp-2 max-w-2xl text-[11px] leading-relaxed text-[#6C5662] sm:text-sm">
              {activeCategoryMeta.desc}
            </p>

          </div>

          <div className="flex items-center gap-1.5">

            <span className="rounded-full border border-rose-200/70 bg-[#FFF5F8] px-2.5 py-1 text-[10px] font-semibold text-[#9E315A] sm:px-3 sm:text-xs">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1
                ? 'Piece'
                : 'Pieces'}
            </span>

            {totalPages > 1 && (
              <span className="rounded-full bg-rose-100/70 px-2 py-1 font-mono text-[9px] text-rose-800 sm:px-2.5 sm:text-xs">
                {currentPage}/{totalPages}
              </span>
            )}

          </div>

        </div>

        {/* ====================================================
            CATEGORY TABS
        ==================================================== */}

        <div className="relative mt-3 sm:mt-4">

          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:gap-2 sm:pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >

            {categoryDefinitions.map(
              (cat) => {
                const isActive =
                  currentCategory ===
                  cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`cat-tab-${cat.id}`}
                    onClick={() => {
                      onSelectCategory(
                        cat.id
                      );
                      setSelectedSubcategory(
                        'all'
                      );
                    }}
                    className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition-all duration-200 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-[#9E315A] via-[#B83E6C] to-[#C94F7C] text-white shadow-md shadow-rose-900/15'
                        : 'border border-rose-200/80 bg-white text-[#3E2F37] hover:border-[#C94F7C] hover:bg-[#FFF5F8] hover:text-[#9E315A]'
                    }`}
                  >

                    <span>
                      {cat.label}
                    </span>

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold sm:text-[10px] ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-100/80 text-[#9E315A]'
                      }`}
                    >
                      {cat.count}
                    </span>

                  </button>
                );
              }
            )}

          </div>

        </div>

      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <div className="mb-5 rounded-xl border border-rose-200/90 bg-white p-2.5 shadow-xs sm:mb-7 sm:rounded-2xl sm:p-4">

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">

          {/* Filters */}

          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:gap-2.5">

            {/* Subcategory */}

            {subcategories.length > 0 && (
              <div className="relative shrink-0">

                <select
                  value={
                    selectedSubcategory
                  }
                  onChange={(e) =>
                    setSelectedSubcategory(
                      e.target.value
                    )
                  }
                  className="appearance-none rounded-lg border border-rose-200 bg-[#FFF9FA] py-2 pl-2.5 pr-7 text-[10px] font-semibold text-[#241B20] outline-none transition-all focus:ring-1 focus:ring-[#9E315A] sm:rounded-xl sm:pl-3 sm:pr-8 sm:text-xs"
                >
                  <option value="all">
                    Department: All
                  </option>

                  {subcategories.map(
                    (sub) => {
                      const count =
                        products.filter(
                          (p) => {
                            if (
                              currentCategory ===
                              'all'
                            ) {
                              return (
                                p.subcategory ===
                                sub
                              );
                            }

                            if (
                              currentCategory ===
                              'offers'
                            ) {
                              return (
                                p.isOffer &&
                                p.subcategory ===
                                  sub
                              );
                            }

                            if (
                              currentCategory ===
                              'performance'
                            ) {
                              return (
                                (p.category ===
                                  'performance' ||
                                  p.isDancePerformance) &&
                                p.subcategory ===
                                  sub
                              );
                            }

                            return (
                              p.category ===
                                currentCategory &&
                              p.subcategory ===
                                sub
                            );
                          }
                        ).length;

                      return (
                        <option
                          key={sub}
                          value={sub}
                        >
                          {sub} ({count})
                        </option>
                      );
                    }
                  )}

                </select>

                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9E315A]" />

              </div>
            )}

            {/* Price */}

            <div className="relative shrink-0">

              <select
                value={priceRange}
                onChange={(e) =>
                  setPriceRange(
                    e.target.value as any
                  )
                }
                className="appearance-none rounded-lg border border-rose-200 bg-[#FFF9FA] py-2 pl-2.5 pr-7 text-[10px] font-semibold text-[#241B20] outline-none focus:ring-1 focus:ring-[#9E315A] sm:rounded-xl sm:pl-3 sm:pr-8 sm:text-xs"
              >
                <option value="all">
                  Price: All
                </option>
                <option value="under-50">
                  Under £50
                </option>
                <option value="50-150">
                  £50 – £150
                </option>
                <option value="150-250">
                  £150 – £250
                </option>
                <option value="above-250">
                  £250+
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9E315A]" />

            </div>

            {/* Availability */}

            <div className="relative shrink-0">

              <select
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(
                    e.target.value as any
                  )
                }
                className="appearance-none rounded-lg border border-rose-200 bg-[#FFF9FA] py-2 pl-2.5 pr-7 text-[10px] font-semibold text-[#241B20] outline-none focus:ring-1 focus:ring-[#9E315A] sm:rounded-xl sm:pl-3 sm:pr-8 sm:text-xs"
              >
                <option value="all">
                  Availability: All
                </option>
                <option value="in-stock">
                  In Stock
                </option>
                <option value="pre-order">
                  Pre-Order
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9E315A]" />

            </div>

          </div>

          {/* Sort + Reset */}

          <div className="flex items-center gap-1.5 sm:gap-2">

            <div className="relative min-w-0 flex-1 sm:flex-none">

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as any
                  )
                }
                className="w-full appearance-none rounded-lg border border-rose-200 bg-white py-2 pl-2.5 pr-7 text-[10px] font-bold text-[#9E315A] outline-none focus:ring-1 focus:ring-[#9E315A] sm:w-auto sm:rounded-xl sm:pl-3 sm:pr-8 sm:text-xs"
              >
                <option value="featured">
                  ✨ Featured
                </option>

                <option value="price-asc">
                  Price: Low to High
                </option>

                <option value="price-desc">
                  Price: High to Low
                </option>

                <option value="newest">
                  New Arrivals
                </option>

                <option value="discount">
                  Highest Discount
                </option>
              </select>

              <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-rose-400" />

            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-rose-50 p-2 text-[10px] font-semibold text-[#9E315A] shadow-2xs transition-all hover:bg-rose-100 sm:rounded-xl sm:px-2.5"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />

                <span className="hidden sm:inline">
                  Reset
                </span>
              </button>
            )}

          </div>

        </div>

        {/* Active filters */}

        {activeFiltersCount > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-rose-100 pt-2.5 sm:mt-3 sm:pt-3">

            <span className="mr-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8C5D6C] sm:text-[11px]">
              Active:
            </span>

            {selectedSubcategory !==
              'all' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-[#FFF0F4] px-2 py-1 text-[9px] font-medium text-[#9E315A] sm:rounded-lg sm:text-xs">
                {selectedSubcategory}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedSubcategory(
                      'all'
                    )
                  }
                  className="cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-[#FFF0F4] px-2 py-1 text-[9px] font-medium text-[#9E315A] sm:rounded-lg sm:text-xs">
                {priceRange ===
                'under-50'
                  ? '< £50'
                  : priceRange ===
                      '50-150'
                    ? '£50 - £150'
                    : priceRange ===
                        '150-250'
                      ? '£150 - £250'
                      : '> £250'}

                <button
                  type="button"
                  onClick={() =>
                    setPriceRange(
                      'all'
                    )
                  }
                  className="cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {stockFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-[#FFF0F4] px-2 py-1 text-[9px] font-medium text-[#9E315A] sm:rounded-lg sm:text-xs">
                {stockFilter ===
                'in-stock'
                  ? 'In Stock'
                  : 'Pre-Order'}

                <button
                  type="button"
                  onClick={() =>
                    setStockFilter(
                      'all'
                    )
                  }
                  className="cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {(searchQuery || '').trim() && (
              <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md border border-rose-200 bg-[#FFF0F4] px-2 py-1 text-[9px] font-medium text-[#9E315A] sm:rounded-lg sm:text-xs">
                Search: "
                {searchQuery}"
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto shrink-0 text-[9px] font-semibold text-[#9E315A] underline underline-offset-2 sm:text-xs"
            >
              Clear All
            </button>

          </div>
        )}

      </div>

      {/* ======================================================
          PRODUCTS
      ====================================================== */}

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-rose-200/80 bg-[#FFFBFD] p-6 py-12 text-center shadow-xs sm:rounded-3xl sm:p-8 sm:py-16">

          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-[#9E315A] sm:mb-4 sm:h-14 sm:w-14">

            <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7" />

          </div>

          <p className="mb-1 font-serif text-lg font-bold text-[#241B20]">
            No pieces found
          </p>

          <p className="mx-auto mb-5 max-w-md text-xs leading-relaxed text-[#6C5662] sm:mb-6 sm:text-sm">
            We could not find any items
            matching your selected
            criteria in{' '}
            {activeCategoryMeta.label}.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">

            <button
              type="button"
              onClick={resetAllFilters}
              className="rounded-full bg-[#9E315A] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#852549]"
            >
              Reset Filters
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCategory(
                  'all'
                );
                resetAllFilters();
              }}
              className="rounded-full border border-rose-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#241B20] hover:bg-rose-50"
            >
              View All
            </button>

          </div>

        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">

          {/* ==================================================
              PRODUCT GRID

              IMPORTANT:
              min-w-0 + h-full + overflow-visible prevents
              narrow mobile cards from clipping their actions.
          ================================================== */}

          <div className="grid grid-cols-2 items-stretch gap-x-2.5 gap-y-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">

            {paginatedProducts.map(
              (product) => (
                <div
                  key={product.id}
                  className="min-w-0 h-full overflow-visible"
                >
                  <ProductCard
                    product={product}
                    onQuickView={
                      onQuickView
                    }
                    onAddToSelection={
                      onAddToSelection
                    }
                    onToggleWishlist={
                      onToggleWishlist
                    }
                    isWishlisted={wishlistIds.includes(
                      product.id
                    )}
                    onOpenWhatsApp={
                      onOpenWhatsApp
                    }
                    currencySymbol={
                      settings?.currencySymbol
                    }
                  />
                </div>
              )
            )}

          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          <div className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-white/80 p-3 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-2xl sm:p-5">

            {/* Showing */}

            <div className="text-center text-[10px] font-medium text-[#6C5662] sm:text-left sm:text-xs">

              Showing{' '}

              <span className="font-bold text-[#241B20]">
                {startItemNumber}–
                {endItemNumber}
              </span>{' '}

              of{' '}

              <span className="font-bold text-[#241B20]">
                {filteredProducts.length}
              </span>{' '}

              pieces

            </div>

            {/* Pagination */}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">

                {/* Previous */}

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      currentPage - 1
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-all sm:h-9 sm:w-auto sm:px-3 ${
                    currentPage === 1
                      ? 'cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400'
                      : 'border-rose-200 bg-white text-[#9E315A] hover:bg-rose-50'
                  }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />

                  <span className="hidden sm:inline">
                    Previous
                  </span>
                </button>

                {/* Page numbers */}

                <div className="flex items-center gap-1">

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, i) => i + 1
                  ).map(
                    (pageNum) => {
                      const isActive =
                        pageNum ===
                        currentPage;

                      return (
                        <button
                          type="button"
                          key={
                            pageNum
                          }
                          onClick={() =>
                            handlePageChange(
                              pageNum
                            )
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold transition-all sm:h-9 sm:w-9 sm:text-xs ${
                            isActive
                              ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-xs'
                              : 'border border-rose-200/70 bg-white text-[#5A4550] hover:bg-rose-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                </div>

                {/* Next */}

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      currentPage + 1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  className={`flex h-8 items-center justify-center rounded-lg px-2.5 text-[10px] font-semibold transition-all sm:h-9 sm:px-3 sm:text-xs ${
                    currentPage ===
                    totalPages
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white hover:brightness-110'
                  }`}
                  aria-label="Next Page"
                >
                  <span>
                    Next
                  </span>

                  <ChevronRight className="h-4 w-4" />

                </button>

              </div>
            )}

            {/* Items per page */}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6C5662] sm:text-xs">

              <span className="hidden md:inline">
                View per page:
              </span>

              <div className="inline-flex rounded-lg border border-rose-200 bg-white p-0.5">

                {[8, 16, 24, 32, 999].map(
                  (size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => {
                        setItemsPerPage(
                          size
                        );
                        setCurrentPage(
                          1
                        );
                      }}
                      className={`rounded-md px-1.5 py-1 text-[9px] font-semibold transition-colors sm:px-2 sm:text-[11px] ${
                        itemsPerPage ===
                        size
                          ? 'bg-[#9E315A] text-white'
                          : 'text-[#6C5662] hover:text-[#241B20]'
                      }`}
                    >
                      {size === 999
                        ? 'All'
                        : size}
                    </button>
                  )
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </section>
  );
};