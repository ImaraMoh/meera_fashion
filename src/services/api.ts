import type {
  Product,
  SelectionItem,
  EnquiryOrder,
  Invoice,
  BrandSettings,
} from '../types';

import { initialBrandSettings } from '../data/initialData';

import { getDeviceId } from './deviceId';

// =============================================================
// API CONFIGURATION
// =============================================================

// Vite environment variable:
// VITE_API_BASE_URL=http://localhost:4004
//
// If it is not provided, the frontend will use the same origin.
//
// IMPORTANT:
// Do NOT include /api here.
// The individual API paths below already include /api.
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');


// =============================================================
// GENERIC API REQUEST
// =============================================================

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,

    headers: {
      'Content-Type': 'application/json',

      // Device identification used by the backend
      'X-Device-Id': getDeviceId(),

      ...(options.headers || {}),
    },
  });

  // -----------------------------------------------------------
  // ERROR HANDLING
  // -----------------------------------------------------------

  if (!response.ok) {

    const text = await response
      .text()
      .catch(() => '');

    console.error(
      `API Request Failed: ${response.status}`,
      {
        path,
        url,
        status: response.status,
        response: text,
      }
    );

    throw new Error(
      `Request failed for ${path}: ${response.status} ${text}`
    );
  }

  // -----------------------------------------------------------
  // NO CONTENT
  // -----------------------------------------------------------

  if (response.status === 204) {
    return undefined as T;
  }

  // -----------------------------------------------------------
  // JSON RESPONSE
  // -----------------------------------------------------------

  return (await response.json()) as T;
}

// =============================================================
// PRODUCTS
// =============================================================

export async function loadRemoteProducts(): Promise<Product[]> {

  const response =
    await request<Product[]>(
      '/api/products'
    );

  return Array.isArray(response)
    ? response
    : [];
}

// =============================================================
// SELECTION
// =============================================================

export async function loadRemoteSelection(): Promise<
  SelectionItem[]
> {

  const response =
    await request<SelectionItem[]>(
      '/api/selection'
    );

  return Array.isArray(response)
    ? response
    : [];
}

export async function saveRemoteSelection(
  items: SelectionItem[]
): Promise<void> {

  await request<void>(
    '/api/selection',
    {
      method: 'POST',
      body: JSON.stringify(items),
    }
  );
}

// =============================================================
// WISHLIST
// =============================================================

export async function loadRemoteWishlist(): Promise<
  string[]
> {

  const response =
    await request<string[]>(
      '/api/wishlist'
    );

  return Array.isArray(response)
    ? response
    : [];
}

export async function saveRemoteWishlist(
  ids: string[]
): Promise<void> {

  await request<void>(
    '/api/wishlist',
    {
      method: 'POST',
      body: JSON.stringify(ids),
    }
  );
}

// =============================================================
// ENQUIRIES
// =============================================================

export async function loadRemoteEnquiries(): Promise<
  EnquiryOrder[]
> {

  const response =
    await request<EnquiryOrder[]>(
      '/api/enquiries'
    );

  return Array.isArray(response)
    ? response
    : [];
}

export async function saveRemoteEnquiries(
  enquiries: EnquiryOrder[]
): Promise<void> {

  await request<void>(
    '/api/enquiries',
    {
      method: 'POST',
      body: JSON.stringify(enquiries),
    }
  );
}

// =============================================================
// INVOICES
// =============================================================

export async function loadRemoteInvoices(): Promise<
  Invoice[]
> {

  const response =
    await request<Invoice[]>(
      '/api/invoices'
    );

  return Array.isArray(response)
    ? response
    : [];
}

export async function saveRemoteInvoices(
  invoices: Invoice[]
): Promise<void> {

  await request<void>(
    '/api/invoices',
    {
      method: 'POST',
      body: JSON.stringify(invoices),
    }
  );
}

// =============================================================
// SETTINGS
// =============================================================

export async function loadRemoteSettings(): Promise<
  BrandSettings
> {

  const response =
    await request<
      BrandSettings | null
    >('/api/settings');

  if (
    response &&
    typeof response === 'object'
  ) {

    return {
      ...initialBrandSettings,
      ...response,
    };
  }

  return {
    ...initialBrandSettings,
  };
}

export async function saveRemoteSettings(
  settings: BrandSettings
): Promise<void> {

  await request<void>(
    '/api/settings',
    {
      method: 'POST',
      body: JSON.stringify(settings),
    }
  );
}

// =============================================================
// ANALYTICS TYPES
// =============================================================

export interface AnalyticsSummary {

  totalRevenue: number;

  totalOrders: number;

  paidOrders: number;

  pendingOrders: number;

  totalEnquiries: number;

  conversionRate: number;

  productCount: number;
}

export interface RevenueCategory {

  category: string;

  revenue: number;

  percentage: number;
}

export interface TopProduct {

  productId: string;

  name: string;

  quantity: number;

  revenue: number;
}

export interface AnalyticsData {

  success: boolean;

  period: string;

  summary: AnalyticsSummary;

  revenueByCategory: RevenueCategory[];

  topProducts: TopProduct[];
}

// =============================================================
// LOAD ANALYTICS
// =============================================================

export const loadAnalytics = async ( range: string = '30' ): Promise<AnalyticsData> => { return request<AnalyticsData>( `/api/analytics?range=${encodeURIComponent(range)}` ); };

export async function saveRemoteProducts(
  products: Product[]
): Promise<void> {

  await request<void>(
    '/api/products',
    {
      method: 'POST',
      body: JSON.stringify(products),
    }
  );
}

export const deleteEnquiry = async (
  enquiryId: string
) => {
  if (!enquiryId) {
    throw new Error('Enquiry ID is required.');
  }

  const response = await fetch(
    `${API_BASE}/api/enquiries/${encodeURIComponent(enquiryId)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Failed to delete enquiry (${response.status})`
    );
  }

  if (!data?.ok) {
    throw new Error(
      data?.message ||
      'Failed to delete enquiry.'
    );
  }

  return data;
};