import type { LucideIcon } from 'lucide-react';
import {
  FileCheck,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  TrendingUp,
} from 'lucide-react';

export type AdminTabId =
  | 'dashboard'
  | 'products'
  | 'enquiries'
  | 'sales_history'
  | 'invoices'
  | 'reports'
  | 'settings';

export interface AdminTabDefinition {
  id: AdminTabId;
  label: string;
  mobileLabel: string;
  title: string;
  icon: LucideIcon;
}

/**
 * The single source of truth for admin navigation. Both desktop and mobile
 * navigation, along with the workspace header, consume this configuration.
 */
export const ADMIN_TABS: readonly AdminTabDefinition[] = [
  { id: 'dashboard', label: 'Overview', mobileLabel: 'Overview', title: 'Executive Performance & Sales Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products & Stock', mobileLabel: 'Products', title: 'Inventory, Pricing & Stock Catalog', icon: Package },
  { id: 'enquiries', label: 'WhatsApp Leads', mobileLabel: 'Leads', title: 'WhatsApp Orders & Live Concierge Messages', icon: MessageCircle },
  { id: 'sales_history', label: 'Sales History', mobileLabel: 'Sales History', title: 'Sales History, Order Archive & PDF Invoices', icon: FileCheck },
  { id: 'invoices', label: 'Invoices (PDF)', mobileLabel: 'Invoices', title: 'Official Invoices & PDF Generator', icon: FileText },
  { id: 'reports', label: 'Sales Reports', mobileLabel: 'Reports', title: 'Sales Analytics & Category Breakdown', icon: TrendingUp },
  { id: 'settings', label: 'Boutique Settings', mobileLabel: 'Settings', title: 'Boutique Profile, Logo & Contact Info', icon: Settings },
];

export const getAdminTab = (id: AdminTabId): AdminTabDefinition => {
  const tab = ADMIN_TABS.find((item) => item.id === id);
  if (!tab) throw new Error(`Unknown admin tab: ${id}`);
  return tab;
};
