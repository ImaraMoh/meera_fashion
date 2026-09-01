import type { Product, SelectionItem, EnquiryOrder, Invoice, BrandSettings } from '../types';
import { initialBrandSettings } from '../data/initialData';
import { getDeviceId } from './deviceId';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': getDeviceId(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed for ${path}: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function loadRemoteProducts(): Promise<Product[]> {
  const response = await request<Product[]>('/api/products');
  return Array.isArray(response) ? response : [];
}

export async function saveRemoteProducts(products: Product[]): Promise<void> {
  await request('/api/products', {
    method: 'POST',
    body: JSON.stringify(products),
  });
}

export async function loadRemoteSelection(): Promise<SelectionItem[]> {
  const response = await request<SelectionItem[]>('/api/selection');
  return Array.isArray(response) ? response : [];
}

export async function saveRemoteSelection(items: SelectionItem[]): Promise<void> {
  await request('/api/selection', {
    method: 'POST',
    body: JSON.stringify(items),
  });
}

export async function loadRemoteWishlist(): Promise<string[]> {
  const response = await request<string[]>('/api/wishlist');
  return Array.isArray(response) ? response : [];
}

export async function saveRemoteWishlist(ids: string[]): Promise<void> {
  await request('/api/wishlist', {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}

export async function loadRemoteEnquiries(): Promise<EnquiryOrder[]> {
  const response = await request<EnquiryOrder[]>('/api/enquiries');
  return Array.isArray(response) ? response : [];
}

export async function saveRemoteEnquiries(enquiries: EnquiryOrder[]): Promise<void> {
  await request('/api/enquiries', {
    method: 'POST',
    body: JSON.stringify(enquiries),
  });
}

export async function loadRemoteInvoices(): Promise<Invoice[]> {
  const response = await request<Invoice[]>('/api/invoices');
  return Array.isArray(response) ? response : [];
}

export async function saveRemoteInvoices(invoices: Invoice[]): Promise<void> {
  await request('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(invoices),
  });
}

export async function loadRemoteSettings(): Promise<BrandSettings> {
  const response = await request<BrandSettings | null>('/api/settings');
  return response && typeof response === 'object' ? { ...initialBrandSettings, ...response } : { ...initialBrandSettings };
}

export async function saveRemoteSettings(settings: BrandSettings): Promise<void> {
  await request('/api/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}
