import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { openWhatsAppChat } from '../../services/whatsapp';
import type { BrandSettings, EnquiryOrder, Product, Invoice } from '../../types';
import { ADMIN_TABS, type AdminTabId } from './adminNavigation';

interface AdminSidebarProps {
  activeTab: AdminTabId;
  setActiveTab: (tab: AdminTabId) => void;
  products: Product[];
  enquiries: EnquiryOrder[];
  invoices: Invoice[];
  settings: BrandSettings;
  pendingEnquiriesCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  products,
  enquiries,
  invoices,
  settings,
  pendingEnquiriesCount,
}) => {
  const badges: Partial<Record<AdminTabId, number | string>> = {
    products: products.length,
    enquiries: pendingEnquiriesCount > 0 ? `${pendingEnquiriesCount} New` : enquiries.length,
    sales_history: enquiries.length,
    invoices: invoices.length,
    media: 'WebP',
  };

  return (
    <aside className="w-56 lg:w-64 bg-[#1C1217]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 lg:p-5 flex flex-col justify-between shadow-2xl shadow-black/60 shrink-0 hidden md:flex h-full min-h-0">
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="space-y-0.5">
            <Logo
              variant="light"
              size="sm"
              customLogoUrl={settings.customLogoUrl}
              brandName={settings.brandName}
              tagline={settings.tagline}
            />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] text-rose-200/80 font-mono uppercase tracking-widest font-semibold">
                CMS Live • London
              </span>
            </div>
          </div>
        </div>

        <nav className="space-y-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-220px)]">
          {ADMIN_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = badges[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`admin-nav-${item.id}`}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                    : 'text-rose-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {badge !== undefined && (
                  badge === 'WebP' ? (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-rose-300 bg-rose-900/40 px-1.5 py-0.5 rounded-md">
                      {badge}
                    </span>
                  ) : (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      typeof badge === 'string' && badge.includes('New')
                        ? 'bg-[#25D366] text-white'
                        : 'bg-white/10 text-rose-100'
                    }`}>
                      {badge}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-2.5">
        <button
          onClick={() => openWhatsAppChat(settings.whatsappNumber, 'Hello Meera Fashion Concierge Test.')}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
          <span>Test WhatsApp Concierge</span>
        </button>

        <div className="text-center space-y-1">
          <p className="text-[10px] text-rose-200/50 font-mono">Meera Fashion CMS • London UK</p>
          <p className="text-[10px] text-rose-200/80">
            Developed by <span className="font-bold text-white tracking-wide">NeirahTech</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
