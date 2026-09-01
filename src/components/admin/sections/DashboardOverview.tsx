import React from 'react';
import {
  DollarSign,
  MessageCircle,
  Package,
  FileText,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import type { BrandSettings, EnquiryOrder, Product } from '../../../types';
import { getOptimizedImageUrl, handleImageError } from '../../../utils/imageFallback';
import { openWhatsAppChat } from '../../../services/whatsapp';

interface DashboardOverviewProps {
  totalRevenue: number;
  pendingEnquiriesCount: number;
  inStockCount: number;
  outOfStockCount: number;
  enquiries: EnquiryOrder[];
  products: Product[];
  settings: BrandSettings;
  setActiveTab: (tab: 'dashboard' | 'products' | 'enquiries' | 'sales_history' | 'invoices' | 'media' | 'reports' | 'settings') => void;
  handleOpenEditProduct: (prod: Product) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  totalRevenue,
  pendingEnquiriesCount,
  inStockCount,
  outOfStockCount,
  enquiries,
  products,
  settings,
  setActiveTab,
  handleOpenEditProduct,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#9E315A]">£{totalRevenue.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ WhatsApp Verified Sales</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">Active Leads</span>
            <div className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366]"><MessageCircle className="w-4 h-4" /></div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#241B20]">{pendingEnquiriesCount} Pending</h3>
            <p className="text-[11px] text-[#8C5D6C] mt-0.5">{enquiries.length} total customer orders</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">Inventory Status</span>
            <div className="p-2 rounded-xl bg-rose-50 text-[#9E315A]"><Package className="w-4 h-4" /></div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#241B20]">{inStockCount} In Stock</h3>
            <p className="text-[11px] text-amber-700 mt-0.5">{outOfStockCount} Out of Stock / Unavailable</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">Invoices Archive</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700"><FileText className="w-4 h-4" /></div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#241B20]">{enquiries.length} Bills</h3>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">PDF Export Ready</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#9E315A]" />
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#241B20]">Recent WhatsApp Orders</h4>
            </div>
            <button onClick={() => setActiveTab('enquiries')} className="text-xs font-bold text-[#9E315A] hover:underline cursor-pointer flex items-center gap-1">
              <span>View All ({enquiries.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {enquiries.slice(0, 4).map((enq) => (
              <div key={enq.id} className="p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100/70 flex items-center justify-between gap-3 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#9E315A]">{enq.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      enq.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : enq.status === 'New'
                        ? 'bg-rose-100 text-[#9E315A]'
                        : 'bg-amber-100 text-amber-800'
                    }`}>{enq.status}</span>
                  </div>
                  <p className="font-serif font-bold text-xs text-[#241B20] mt-0.5 truncate">{enq.customerName} • {enq.customerPhone}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif font-bold text-sm text-[#9E315A]">£{enq.total}</span>
                  <button onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera Fashion regarding your order #${enq.orderNumber}.`)} className="block text-[10px] text-[#25D366] font-bold hover:underline">Reply WhatsApp</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#9E315A]" />
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#241B20]">Inventory Overview</h4>
            </div>
            <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-[#9E315A] hover:underline cursor-pointer flex items-center gap-1">
              <span>Manage Products</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 4).map((prod) => (
              <div key={prod.id} className="p-2.5 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getOptimizedImageUrl(prod.images.main, { width: 100, quality: 60 })}
                    alt={prod.name}
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-12 rounded-lg object-cover border border-rose-200 shrink-0"
                    onError={(e) => handleImageError(e, 'general')}
                  />
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-xs text-[#241B20] truncate">{prod.name}</p>
                    <p className="text-[10px] text-[#8C5D6C]">{prod.category.toUpperCase()} • £{prod.price}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    prod.stockStatus === 'In Stock'
                      ? 'bg-emerald-100 text-emerald-800'
                      : prod.stockStatus === 'Out of Stock'
                      ? 'bg-gray-800 text-white'
                      : prod.stockStatus === 'Unavailable'
                      ? 'bg-rose-900 text-rose-100'
                      : 'bg-amber-100 text-amber-800'
                  }`}>{prod.stockStatus}</span>

                  <button onClick={() => handleOpenEditProduct(prod)} className="p-1.5 text-[#9E315A] hover:bg-rose-100 rounded-lg" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
