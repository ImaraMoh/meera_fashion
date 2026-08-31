import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Check,
  Tag,
  Layers,
  ShoppingBag,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import { Product, ProductCategory, BrandSettings } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onQuickView: (product: Product) => void;
  onAddToSelection: (product: Product, size?: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
  onOpenWhatsApp: (product: Product, size?: string) => void;
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'discount'>('featured');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'pre-order'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under-50' | '50-150' | '150-250' | 'above-250'>('all');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Auto-reset subcategory and page when category changes from outside
  useEffect(() => {
    setSelectedSubcategory('all');
    setCurrentPage(1);
  }, [currentCategory]);

  // Reset page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubcategory, sortBy, stockFilter, priceRange, searchQuery, itemsPerPage]);

  const categoryDefinitions = [
    {
      id: 'all',
      label: 'All Collections',
      count: products.length,
      desc: 'Browse our entire curated London boutique of handcrafted sarees, heirloom jewellery, and couture ensembles.'
    },
    {
      id: 'sarees',
      label: 'Sarees',
      count: products.filter(p => p.category === 'sarees').length,
      desc: 'Pure Kanjivaram silks, Banarasi organza, and Mysore crepe sarees woven with rose-tinted gold zari.'
    },
    {
      id: 'jewellery',
      label: 'Jewellery',
      count: products.filter(p => p.category === 'jewellery').length,
      desc: 'Handcrafted Kundan bangles, 24K matte antique temple harams, jhumkas, and Padmavati bridal choker sets.'
    },
    {
      id: 'shalwar',
      label: 'Shalwar & Suits',
      count: products.filter(p => p.category === 'shalwar').length,
      desc: 'Velvet Anarkali suits, tiered sharara sets, and hand-embroidered Lucknowi Chikankari ensembles.'
    },
    {
      id: 'lehengas',
      label: 'Lehengas',
      count: products.filter(p => p.category === 'lehengas').length,
      desc: 'Opulent bridal raw silk and micro-velvet lehengas embellished with 3D Zardozi and foil mirror embroidery.'
    },
    {
      id: 'performance',
      label: 'Dance Edit',
      count: products.filter(p => p.category === 'performance' || p.isDancePerformance).length,
      desc: 'Stage-ready classical dance sarees, stitched costume sets, brass ghungroos, and temple dance jewellery.'
    },
    {
      id: 'offers',
      label: 'Exclusive Offers',
      count: products.filter(p => p.isOffer).length,
      desc: 'Special seasonal promotional pricing and bridal bundle savings on selected heirloom pieces.'
    },
  ];

  // Current active category meta
  const activeCategoryMeta = categoryDefinitions.find(c => c.id === currentCategory) || categoryDefinitions[0];

  // Derive available subcategories strictly based on the current category
  const subcategories = useMemo(() => {
    let relevant: Product[];
    if (currentCategory === 'all') {
      relevant = products;
    } else if (currentCategory === 'offers') {
      relevant = products.filter(p => p.isOffer);
    } else if (currentCategory === 'performance') {
      relevant = products.filter(p => p.category === 'performance' || p.isDancePerformance);
    } else {
      // Strict category check: e.g. sarees only includes category === 'sarees'
      relevant = products.filter(p => p.category === currentCategory);
    }

    const set = new Set<string>();
    relevant.forEach(p => {
      if (p.subcategory && p.subcategory.trim()) {
        set.add(p.subcategory.trim());
      }
    });
    return Array.from(set).sort();
  }, [products, currentCategory]);

  // Filtered & Sorted products with strict accuracy
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Strict Category filter
    if (currentCategory !== 'all') {
      if (currentCategory === 'offers') {
        list = list.filter(p => p.isOffer);
      } else if (currentCategory === 'performance') {
        list = list.filter(p => p.category === 'performance' || p.isDancePerformance);
      } else {
        list = list.filter(p => p.category === currentCategory);
      }
    }

    // 2. Subcategory filter
    if (selectedSubcategory !== 'all') {
      list = list.filter(p => p.subcategory === selectedSubcategory);
    }

    // 3. Search filter
    const trimmedQuery = (searchQuery || '').trim();
    if (trimmedQuery) {
      const q = trimmedQuery.toLowerCase();
      list = list.filter(
        p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.subcategory || '').toLowerCase().includes(q) ||
          (p.material || '').toLowerCase().includes(q) ||
          (p.color || '').toLowerCase().includes(q)
      );
    }

    // 4. Stock / Availability filter
    if (stockFilter === 'in-stock') {
      list = list.filter(p => p.stockStatus === 'In Stock' || p.stockStatus === 'Low Stock');
    } else if (stockFilter === 'pre-order') {
      list = list.filter(p => p.isPreOrder);
    }

    // 5. Price Range filter
    if (priceRange === 'under-50') {
      list = list.filter(p => p.price < 50);
    } else if (priceRange === '50-150') {
      list = list.filter(p => p.price >= 50 && p.price <= 150);
    } else if (priceRange === '150-250') {
      list = list.filter(p => p.price > 150 && p.price <= 250);
    } else if (priceRange === 'above-250') {
      list = list.filter(p => p.price > 250);
    }

    // 6. Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }

    return list;
  }, [products, currentCategory, selectedSubcategory, stockFilter, priceRange, sortBy, searchQuery]);

  // Sliced products based on active pagination page
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    if (itemsPerPage >= 999) return filteredProducts;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeFiltersCount =
    (selectedSubcategory !== 'all' ? 1 : 0) +
    (stockFilter !== 'all' ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0) +
    ((searchQuery || '').trim() !== '' ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedSubcategory('all');
    setStockFilter('all');
    setPriceRange('all');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const startItemNumber = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItemNumber = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <section ref={gridTopRef} className="py-8 sm:py-12 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 scroll-mt-20" id="boutique-catalog">
      
      {/* Category Header & Editorial Overview */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#C94F7C20]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#9E315A]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-semibold text-[#9E315A]">
                Meera London Curations
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B20] tracking-tight">
              {activeCategoryMeta.label}
            </h2>
            <p className="text-xs sm:text-sm text-[#6C5662] max-w-2xl mt-1 leading-relaxed">
              {activeCategoryMeta.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 bg-[#FFF5F8] text-[#9E315A] border border-rose-200/70 rounded-full shadow-2xs">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'} Total
            </span>
            {totalPages > 1 && (
              <span className="text-xs font-mono text-rose-800 bg-rose-100/70 px-2.5 py-1 rounded-full">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Primary Luxury Category Tabs */}
        <div className="mt-4 relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryDefinitions.map((cat) => {
              const isActive = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-tab-${cat.id}`}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setSelectedSubcategory('all');
                  }}
                  className={`px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#9E315A] via-[#B83E6C] to-[#C94F7C] text-white shadow-md shadow-rose-900/15'
                      : 'bg-white text-[#3E2F37] border border-rose-200/80 hover:border-[#C94F7C] hover:text-[#9E315A] hover:bg-[#FFF5F8]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100/80 text-[#9E315A]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ELEVATED REFINED FILTER CONTROLS BAR (Clean & Organized UI/UX) */}
      <div className="bg-white border border-rose-200/90 rounded-2xl p-3 sm:p-4 mb-7 shadow-xs">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Quick Selectors Group */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-[280px]">
            
            {/* 1. Subcategory / Department Selector */}
            {subcategories.length > 0 && (
              <div className="relative">
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="bg-[#FFF9FA] hover:bg-[#FFF2F6] border border-rose-200 text-xs font-semibold text-[#241B20] pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-1 focus:ring-[#9E315A] cursor-pointer appearance-none transition-all shadow-2xs"
                >
                  <option value="all">
                    Department: All ({currentCategory === 'all' ? products.length : activeCategoryMeta.count})
                  </option>
                  {subcategories.map((sub) => {
                    const count = products.filter(p => {
                      if (currentCategory === 'all') return p.subcategory === sub;
                      if (currentCategory === 'offers') return p.isOffer && p.subcategory === sub;
                      if (currentCategory === 'performance') return (p.category === 'performance' || p.isDancePerformance) && p.subcategory === sub;
                      return p.category === currentCategory && p.subcategory === sub;
                    }).length;
                    return (
                      <option key={sub} value={sub}>
                        {sub} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9E315A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* 2. Price Range Selector */}
            <div className="relative">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="bg-[#FFF9FA] hover:bg-[#FFF2F6] border border-rose-200 text-xs font-semibold text-[#241B20] pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-1 focus:ring-[#9E315A] cursor-pointer appearance-none transition-all shadow-2xs"
              >
                <option value="all">Price: All</option>
                <option value="under-50">Under £50</option>
                <option value="50-150">£50 – £150</option>
                <option value="150-250">£150 – £250</option>
                <option value="above-250">£250+</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#9E315A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 3. Availability Selector */}
            <div className="relative">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="bg-[#FFF9FA] hover:bg-[#FFF2F6] border border-rose-200 text-xs font-semibold text-[#241B20] pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-1 focus:ring-[#9E315A] cursor-pointer appearance-none transition-all shadow-2xs"
              >
                <option value="all">Availability: All</option>
                <option value="in-stock">Ready to Dispatch (In Stock)</option>
                <option value="pre-order">Made-to-Order (Pre-Order)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#9E315A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>

          {/* Right: Sorting Selector & Reset Action */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-rose-200 text-xs font-bold text-[#9E315A] pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-1 focus:ring-[#9E315A] cursor-pointer appearance-none shadow-2xs"
              >
                <option value="featured">✨ Featured Selection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
                <option value="discount">Highest Discount</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters (Only when active) */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#9E315A] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

          </div>
        </div>

        {/* Applied Filter Tags Badges Bar */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#8C5D6C] uppercase tracking-wider mr-1">
                Active:
              </span>

              {selectedSubcategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#FFF0F4] border border-rose-200 text-[#9E315A] px-2.5 py-0.5 rounded-lg text-xs font-medium">
                  {selectedSubcategory}
                  <button onClick={() => setSelectedSubcategory('all')} className="hover:text-rose-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#FFF0F4] border border-rose-200 text-[#9E315A] px-2.5 py-0.5 rounded-lg text-xs font-medium">
                  {priceRange === 'under-50' ? '< £50' : priceRange === '50-150' ? '£50 - £150' : priceRange === '150-250' ? '£150 - £250' : '> £250'}
                  <button onClick={() => setPriceRange('all')} className="hover:text-rose-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {stockFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#FFF0F4] border border-rose-200 text-[#9E315A] px-2.5 py-0.5 rounded-lg text-xs font-medium">
                  {stockFilter === 'in-stock' ? 'In Stock' : 'Pre-Order'}
                  <button onClick={() => setStockFilter('all')} className="hover:text-rose-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(searchQuery || '').trim() && (
                <span className="inline-flex items-center gap-1 bg-[#FFF0F4] border border-rose-200 text-[#9E315A] px-2.5 py-0.5 rounded-lg text-xs font-medium">
                  Search: "{searchQuery}"
                </span>
              )}
            </div>

            <button
              onClick={resetAllFilters}
              className="text-[#9E315A] hover:text-[#7A1F40] text-xs font-semibold underline underline-offset-2 cursor-pointer"
            >
              Clear All ({activeFiltersCount})
            </button>
          </div>
        )}

      </div>

      {/* Product Gallery Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFBFD] rounded-3xl border border-rose-200/80 p-8 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-[#9E315A] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <p className="text-lg font-serif font-bold text-[#241B20] mb-1">
            No pieces found matching this filter
          </p>
          <p className="text-xs sm:text-sm text-[#6C5662] max-w-md mx-auto mb-6">
            We could not find any items matching your selected criteria in {activeCategoryMeta.label}. Reset your filters or message our London boutique on WhatsApp for bespoke requests.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetAllFilters}
              className="text-xs bg-[#9E315A] hover:bg-[#852549] text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={() => {
                onSelectCategory('all');
                resetAllFilters();
              }}
              className="text-xs bg-white text-[#241B20] border border-rose-200 px-5 py-2.5 rounded-full font-semibold hover:bg-rose-50 cursor-pointer"
            >
              View All Collections
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                onAddToSelection={onAddToSelection}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(product.id)}
                onOpenWhatsApp={onOpenWhatsApp}
                currencySymbol={settings?.currencySymbol}
              />
            ))}
          </div>

          {/* Luxury Pagination & Set Navigator */}
          <div className="mt-8 pt-6 border-t border-rose-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-xs">
            
            {/* Left: Showing items text */}
            <div className="text-xs text-[#6C5662] font-medium text-center sm:text-left">
              Showing <span className="font-bold text-[#241B20]">{startItemNumber}–{endItemNumber}</span> of{' '}
              <span className="font-bold text-[#241B20]">{filteredProducts.length}</span> curated pieces
            </div>

            {/* Middle: Pagination Navigation with Next & Prev Arrows */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Previous Set Arrow Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-white hover:bg-rose-50 text-[#9E315A] border border-rose-200 hover:border-rose-300 shadow-2xs'
                  }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-xs'
                            : 'bg-white hover:bg-rose-50 text-[#5A4550] border border-rose-200/70 hover:border-rose-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Set Arrow Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:from-[#88284C] hover:to-[#B33E6B] text-white shadow-xs'
                  }`}
                  aria-label="Next Page"
                >
                  <span>Next Set</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Right: Items Per Page Quick Selection */}
            <div className="flex items-center gap-2 text-xs text-[#6C5662]">
              <span className="hidden md:inline">View per page:</span>
              <div className="inline-flex rounded-lg border border-rose-200 bg-white p-0.5 shadow-2xs">
                {[8, 16, 24, 32, 999].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      itemsPerPage === size
                        ? 'bg-[#9E315A] text-white'
                        : 'text-[#6C5662] hover:text-[#241B20]'
                    }`}
                  >
                    {size === 999 ? 'All' : size}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
