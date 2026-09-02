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
//
// LOCAL:
// VITE_API_BASE_URL=http://localhost:4004
//
// VERCEL:
// Leave VITE_API_BASE_URL empty/unset.
//
// API paths below already contain /api.
// =============================================================

const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || ''
  )
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');


// =============================================================
// BUILD API URL
// =============================================================

function buildApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${API_BASE}${normalizedPath}`;
}


// =============================================================
// GENERIC API REQUEST
// =============================================================

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const url = buildApiUrl(path);

  const response = await fetch(url, {
    ...options,

    headers: {
      'Content-Type': 'application/json',

      'X-Device-Id': getDeviceId(),

      ...(options.headers || {}),
    },
  });


  // ===========================================================
  // NO CONTENT
  // ===========================================================

  if (response.status === 204) {
    return undefined as T;
  }


  // ===========================================================
  // READ RESPONSE SAFELY
  // ===========================================================

  const contentType =
    response.headers.get('content-type') || '';

  const isJson =
    contentType.includes('application/json');

  const responseText =
    await response.text().catch(() => '');


  // ===========================================================
  // HTTP ERROR
  // ===========================================================

  if (!response.ok) {

    console.error(
      `API Request Failed: ${response.status}`,
      {
        path,
        url,
        status: response.status,
        contentType,
        response: responseText,
      }
    );

    let message = responseText;

    if (isJson && responseText) {
      try {
        const errorData = JSON.parse(responseText);

        message =
          errorData?.message ||
          errorData?.error ||
          responseText;
      } catch {
        // Keep raw response text
      }
    }

    throw new Error(
      `Request failed for ${path}: ${response.status} ${message}`
    );
  }


  // ===========================================================
  // UNEXPECTED HTML RESPONSE
  // ===========================================================

  if (!isJson) {

    console.error(
      'API returned a non-JSON response.',
      {
        path,
        url,
        status: response.status,
        contentType,
        responsePreview:
          responseText.slice(0, 300),
      }
    );

    throw new Error(
      `API endpoint returned non-JSON response for ${path}. ` +
      `Received ${contentType || 'unknown content type'}.`
    );
  }


  // ===========================================================
  // PARSE JSON
  // ===========================================================

  try {
    return JSON.parse(responseText) as T;
  } catch (error) {

    console.error(
      'Failed to parse API JSON response.',
      {
        path,
        url,
        status: response.status,
        responsePreview:
          responseText.slice(0, 300),
        error,
      }
    );

    throw new Error(
      `Invalid JSON response received from ${path}.`
    );
  }
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
// DELETE ENQUIRY
// =============================================================

export async function deleteEnquiry(
  enquiryId: string
) {

  if (!enquiryId) {
    throw new Error(
      'Enquiry ID is required.'
    );
  }

  const response = await request<{
    ok: boolean;
    message?: string;
  }>(
    `/api/enquiries/${encodeURIComponent(enquiryId)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response?.ok) {
    throw new Error(
      response?.message ||
      'Failed to delete enquiry.'
    );
  }

  return response;
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

export const loadAnalytics = async (
  range: string = '30'
): Promise<AnalyticsData> => {

  return request<AnalyticsData>(
    `/api/analytics?range=${encodeURIComponent(range)}`
  );
};