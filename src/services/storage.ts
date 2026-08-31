import { Product, BrandSettings, SelectionItem, EnquiryOrder, Invoice } from '../types';
import { initialProducts, initialBrandSettings, initialEnquiries, initialInvoices } from '../data/initialData';
import { getOptimizedImageUrl } from '../utils/imageFallback';

const STORAGE_KEYS = {
  PRODUCTS: 'meera_products_v4',
  SETTINGS: 'meera_settings_v4',
  SELECTION: 'meera_selection_v4',
  WISHLIST: 'meera_wishlist_v4',
  ENQUIRIES: 'meera_enquiries_v4',
  INVOICES: 'meera_invoices_v4',
};

const optimizeProductImages = (p: Product): Product => {
  return {
    ...p,
    images: {
      main: getOptimizedImageUrl(p.images?.main, { width: 600, quality: 70 }),
      front: p.images?.front ? getOptimizedImageUrl(p.images.front, { width: 600, quality: 70 }) : undefined,
      back: p.images?.back ? getOptimizedImageUrl(p.images.back, { width: 600, quality: 70 }) : undefined,
      detail: p.images?.detail ? getOptimizedImageUrl(p.images.detail, { width: 600, quality: 70 }) : undefined,
      wearing: p.images?.wearing ? getOptimizedImageUrl(p.images.wearing, { width: 600, quality: 70 }) : undefined,
    },
  };
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      const optimizedInitial = initialProducts.map(optimizeProductImages);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(optimizedInitial));
      return optimizedInitial;
    }
    const parsed: Product[] = JSON.parse(raw);
    // Ensure all default initial products exist and have authoritative category mappings & compressed images
    const initialMap = new Map(initialProducts.map(p => [p.id, p]));
    const updated = parsed.map(item => {
      const canonical = initialMap.get(item.id);
      if (canonical) {
        return optimizeProductImages({
          ...item,
          category: canonical.category,
          subcategory: canonical.subcategory,
          isDancePerformance: canonical.isDancePerformance,
          isOffer: canonical.isOffer,
        });
      }
      return optimizeProductImages(item);
    });

    const existingIds = new Set(updated.map(p => p.id));
    const missing = initialProducts.filter(p => !existingIds.has(p.id)).map(optimizeProductImages);
    const merged = [...updated, ...missing];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed to load products from storage', e);
    return initialProducts.map(optimizeProductImages);
  }
};

export const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products', e);
  }
};

export const getStoredSettings = (): BrandSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return initialBrandSettings;
    return { ...initialBrandSettings, ...JSON.parse(raw) };
  } catch (e) {
    return initialBrandSettings;
  }
};

export const saveStoredSettings = (settings: BrandSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const getStoredSelection = (): SelectionItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTION);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveStoredSelection = (items: SelectionItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTION, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save selection', e);
  }
};

export const getStoredWishlist = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveStoredWishlist = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save wishlist', e);
  }
};

export const getStoredEnquiries = (): EnquiryOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    if (!raw) return initialEnquiries;
    return JSON.parse(raw);
  } catch (e) {
    return initialEnquiries;
  }
};

export const saveStoredEnquiries = (enquiries: EnquiryOrder[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
  } catch (e) {
    console.error('Failed to save enquiries', e);
  }
};

export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) return initialInvoices;
    return JSON.parse(raw);
  } catch (e) {
    return initialInvoices;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices', e);
  }
};

// Aliases for convenience
export const loadProducts = getStoredProducts;
export const saveProducts = saveStoredProducts;
export const loadSettings = getStoredSettings;
export const saveSettings = saveStoredSettings;
export const loadSelection = getStoredSelection;
export const saveSelection = saveStoredSelection;
export const loadWishlist = getStoredWishlist;
export const saveWishlist = saveStoredWishlist;
export const loadEnquiries = getStoredEnquiries;
export const saveEnquiries = saveStoredEnquiries;
export const loadInvoices = getStoredInvoices;
export const saveInvoices = saveStoredInvoices;
