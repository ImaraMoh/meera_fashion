import type { Product, BrandSettings, SelectionItem, EnquiryOrder, Invoice } from '../types';

const emptySettings: BrandSettings = {
  brandName: '',
  tagline: '',
  phone: '',
  formattedPhone: '',
  whatsappNumber: '',
  email: '',
  address: '',
  customLogoUrl: '',
  instagramHandle: '',
  instagramUrl: '',
  tiktokHandle: '',
  tiktokUrl: '',
  facebookUrl: '',
  announcementText: '',
  showAnnouncement: true,
  enableRentalMode: false,
  currencySymbol: '£',
  currencyCode: 'GBP',
};

export const getStoredProducts = (): Product[] => [];
export const saveStoredProducts = (_products: Product[]) => undefined;

export const getStoredSettings = (): BrandSettings => ({ ...emptySettings });
export const saveStoredSettings = (_settings: BrandSettings) => undefined;

export const getStoredSelection = (): SelectionItem[] => [];
export const saveStoredSelection = (_items: SelectionItem[]) => undefined;

export const getStoredWishlist = (): string[] => [];
export const saveStoredWishlist = (_ids: string[]) => undefined;

export const getStoredEnquiries = (): EnquiryOrder[] => [];
export const saveStoredEnquiries = (_enquiries: EnquiryOrder[]) => undefined;

export const getStoredInvoices = (): Invoice[] => [];
export const saveStoredInvoices = (_invoices: Invoice[]) => undefined;

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
