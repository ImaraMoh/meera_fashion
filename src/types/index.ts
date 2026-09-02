export type ProductCategory = 'sarees' | 'jewellery' | 'shalwar' | 'lehengas' | 'performance' | 'collections';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Unavailable' | 'Pre-Order' | 'Coming Soon';

export type BangleSize = '2.2' | '2.4' | '2.6' | '2.8' | '3.0' | 'Free Size' | 'Standard';

export type ImageBackgroundMode = 'original' | 'white' | 'blush' | 'pink' | 'transparent' | 'dark';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Bangle Size", "Blouse Size", "Color"
  options: string[]; // e.g. ["2.2", "2.4", "2.6", "2.8", "3.0"]
  selectedOption?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: {
    main: string;
    front?: string;
    back?: string;
    detail?: string;
    wearing?: string;
  };
  backgroundMode?: ImageBackgroundMode;
  description: string;
  shortDescription: string;
  material: string;
  color: string;
  stockStatus: StockStatus;
  unavailabilityReason?: string;
  stockQuantity: number;
  isPreOrder: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOffer: boolean;
  isDancePerformance: boolean;
  bangleSizes?: BangleSize[];
  variants?: ProductVariant[];
  matchingProductIds?: string[]; // Saree + Jewellery bundle recommendation
  
  // Future Rental Capability
  saleEnabled: boolean;
  rentalEnabled: boolean;
  rentalPricePerDay?: number;
  rentalDeposit?: number;
  rentalMinDays?: number;

  createdAt: string;
  updatedAt: string;
}

export interface SelectionItem {
  id: string; // unique item entry id
  productId: string;
  product: Product;
  selectedSize?: string;
  selectedVariant?: { [key: string]: string };
  quantity: number;
  unitPrice: number;
  notes?: string;
  isRental?: boolean;
  addedAt?: string;
}

export interface EnquiryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryCity?: string;

  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    size?: string;
    image?: string;
  }[];

  subtotal: number;
  discount: number;
  total: number;

  status:
    | 'New'
    | 'Contacted'
    | 'Confirmed'
    | 'Paid'
    | 'Preparing'
    | 'Delivered'
    | 'Cancelled';

  cancelReason?: string;
  cancelledAt?: string;
  notes?: string;

  createdAt: string;

  // NEW
  statusUpdatedAt?: string;

  source: 'WhatsApp' | 'Web' | 'Direct';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  enquiryId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    variant?: string;
  }[];
  subtotal: number;
  discount: number;
  notes?: string;
  shipping: number;
  total: number;
  status: 'Paid' | 'Draft' | 'Sent' | 'Delivered';
  issueDate: string;
  dueDate: string;
  paymentMethod?: string;
  createdAt?: string;
}

export interface BrandSettings {
  brandName: string;
  tagline: string;
  phone: string;
  formattedPhone: string;
  whatsappNumber: string; // e.g. "447463151533"
  email: string;
  address?: string;
  customLogoUrl?: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  facebookUrl?: string;
  announcementText: string;
  showAnnouncement: boolean;
  enableRentalMode: boolean; // toggle for future rental preview
  currencySymbol: string;
  currencyCode: string;
}
