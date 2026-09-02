import React, { useMemo } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import type { Product, ProductCategory } from '../../types';
import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface CategoryBoutiqueProps {
  products?: Product[];
  onSelectCategory: (category: ProductCategory) => void;
}

interface CategoryConfig {
  id: ProductCategory;
  title: string;
  subtitle: string;
  tag: string;
  span: string;
  featured?: boolean;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'sarees' as ProductCategory,
    title: 'Kanjivaram & Silk Sarees',
    subtitle: 'Pure silk sarees, zari borders & elegant bridal drapes',
    tag: 'Signature Edit',
    span: 'col-span-1 md:col-span-2 lg:col-span-7',
  },
  {
    id: 'jewellery' as ProductCategory,
    title: 'Temple & Kundan Jewellery',
    subtitle: 'Traditional jewellery, jhumkas, chokers & elegant pieces',
    tag: 'Timeless Elegance',
    span: 'col-span-1 md:col-span-1 lg:col-span-5',
  },
  {
    id: 'performance' as ProductCategory,
    title: 'The Dance Performance Edit',
    subtitle: 'Coordinated sarees & traditional jewellery sets',
    tag: 'Classical Collection',
    span: 'col-span-1 md:col-span-1 lg:col-span-5',
    featured: true,
  },
  {
    id: 'lehengas' as ProductCategory,
    title: 'Bridal & Festive Lehengas',
    subtitle: 'Elegant bridal silhouettes & festive statement pieces',
    tag: 'Heirloom Craft',
    span: 'col-span-1 md:col-span-1 lg:col-span-4',
  },
  {
    id: 'shalwar' as ProductCategory,
    title: 'Designer Shalwar Suits',
    subtitle: 'Elegant anarkalis & beautifully embellished designs',
    tag: 'Ready to Wear',
    span: 'col-span-1 md:col-span-1 lg:col-span-3',
  },
];

/**
 * Normalize category values coming from the database.
 *
 * Examples:
 * "sarees"       -> "sarees"
 * "Sarees"       -> "sarees"
 * "saree"        -> "saree"
 * "sarees "      -> "sarees"
 * "SAREES"       -> "sarees"
 * "silk-sarees"  -> "silksarees"
 */
const normalizeCategory = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
};

/**
 * Match database category with our UI category.
 */
const categoryMatches = (
  productCategory: unknown,
  expectedCategory: ProductCategory,
): boolean => {
  const actual = normalizeCategory(productCategory);
  const expected = normalizeCategory(expectedCategory);

  if (!actual || !expected) {
    return false;
  }

  // Exact match
  if (actual === expected) {
    return true;
  }

  // Common singular/plural variations
  const aliases: Record<string, string[]> = {
    sarees: ['saree', 'sarees'],
    jewellery: ['jewellery', 'jewelry', 'jewelleries', 'jewelry'],
    performance: [
      'performance',
      'performances',
      'dance',
      'danceset',
      'dancesets',
      'performanceset',
      'performancesets',
    ],
    lehengas: ['lehenga', 'lehengas'],
    shalwar: ['shalwar', 'shalwars'],
  };

  const possibleValues = aliases[expected];

  if (!possibleValues) {
    return false;
  }

  return possibleValues.some(
    (value) => normalizeCategory(value) === actual,
  );
};

export const CategoryBoutique: React.FC<CategoryBoutiqueProps> = ({
  products = [],
  onSelectCategory,
}) => {
  /**
   * Build categories from REAL database products.
   *
   * Only categories that actually contain products are displayed.
   * Maximum 5 categories.
   */
  const categories = useMemo(() => {
    // Make sure we always work with an array
    const safeProducts = Array.isArray(products) ? products : [];

    console.log(
      '[CategoryBoutique] Products received:',
      safeProducts,
    );

    console.log(
      '[CategoryBoutique] Database categories:',
      safeProducts.map((product) => ({
        name: product.name,
        category: product.category,
      })),
    );

    const generatedCategories = CATEGORY_CONFIGS
      .map((config) => {
        const categoryProducts = safeProducts.filter((product) =>
          categoryMatches(product?.category, config.id),
        );

        console.log(
          `[CategoryBoutique] ${config.id}:`,
          categoryProducts.length,
          categoryProducts,
        );

        if (categoryProducts.length === 0) {
          return null;
        }

        /**
         * Find the first product with a usable image.
         */
        const productWithImage = categoryProducts.find((product) => {
          const mainImage = product?.images?.main;

          return (
            typeof mainImage === 'string' &&
            mainImage.trim().length > 0
          );
        });

        /**
         * Use the actual product image.
         *
         * No Unsplash fallback here.
         */
        const image = productWithImage?.images?.main || '';

        return {
          ...config,
          image,
          productCount: categoryProducts.length,
          products: categoryProducts,
        };
      })
      .filter(
        (
          category,
        ): category is CategoryConfig & {
          image: string;
          productCount: number;
          products: Product[];
        } => category !== null,
      )
      .slice(0, 5);

    console.log(
      '[CategoryBoutique] Final categories:',
      generatedCategories,
    );

    return generatedCategories;
  }, [products]);

  /**
   * If there are no products yet, don't show a false
   * "No categories" state while the database is loading.
   */
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="w-full bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />

              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
                Signature Collections
              </span>

              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>

            <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-4xl">
              Curated for Every Occasion
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Discover our carefully selected collection of timeless
              fashion and traditional elegance.
            </p>
          </div>

          <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-400">
              Our collections are coming soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Products exist, but none of them match our configured
   * signature categories.
   */
  if (categories.length === 0) {
    return (
      <section className="w-full bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />

              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
                Signature Collections
              </span>

              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>

            <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-4xl">
              Curated for Every Occasion
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Discover our carefully selected collection of timeless
              fashion and traditional elegance.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 text-center">
            <p className="text-sm text-slate-500">
              Products are available, but their categories have not
              been added to the signature collections yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 text-center md:mb-12">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Signature Collections
            </span>

            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>

          <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-4xl lg:text-5xl">
            Curated for Every Occasion
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Explore our signature collections, thoughtfully curated
            from the latest pieces in our boutique.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {categories.map((category) => (
            <button
              key={String(category.id)}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`group relative overflow-hidden rounded-2xl text-left ${category.span}`}
            >
              {/* Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 md:aspect-[5/4] lg:aspect-auto lg:min-h-[380px]">
                {category.image ? (
                  <img
                    src={getOptimizedImageUrl(category.image)}
                    alt={category.title}
                    loading="lazy"
                    onError={handleImageError}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <Sparkles className="h-10 w-10 text-slate-300" />
                  </div>
                )}

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Top Badge */}
                <div className="absolute left-4 top-4 md:left-5 md:top-5">
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-md">
                    {category.tag}
                  </span>
                </div>

                {/* Product Count */}
                <div className="absolute right-4 top-4 md:right-5 md:top-5">
                  <span className="rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                    {category.productCount}{' '}
                    {category.productCount === 1
                      ? 'Product'
                      : 'Products'}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-7">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-serif text-2xl font-medium leading-tight text-white md:text-3xl">
                        {category.title}
                      </h3>

                      <p className="mt-2 max-w-xl text-xs leading-5 text-white/80 md:text-sm">
                        {category.subtitle}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                        Explore Collection
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden shrink-0 rounded-full border border-white/30 bg-white/10 p-3 backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-slate-900 md:block">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBoutique;