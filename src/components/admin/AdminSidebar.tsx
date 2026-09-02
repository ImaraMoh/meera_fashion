import React, { useMemo } from 'react';
import {
  MessageCircle,
  LogOut,
} from 'lucide-react';

import LogoImage from '../../assets/logo.png';
import { openWhatsAppChat } from '../../services/whatsapp';

import type {
  BrandSettings,
  EnquiryOrder,
  Product,
  Invoice,
} from '../../types';

import {
  ADMIN_TABS,
  type AdminTabId,
} from './adminNavigation';

interface AdminSidebarProps {
  activeTab: AdminTabId;
  setActiveTab: (tab: AdminTabId) => void;
  products: Product[];
  enquiries: EnquiryOrder[];
  invoices: Invoice[];
  settings: BrandSettings;
  pendingEnquiriesCount: number;
  salesHistoryCount?: number;
  invoiceCount?: number;
  onLogout?: () => void;
}

const normalizeStatus = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, ' ');
};

const INVOICE_STATUSES = new Set([
  'paid',
  'preparing',
  'delivered',
]);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  products,
  enquiries,
  invoices: _invoices,
  settings,
  pendingEnquiriesCount,
  salesHistoryCount: _salesHistoryCount,
  invoiceCount: _invoiceCount,
  onLogout,
}) => {
  const enquiryData = Array.isArray(enquiries)
    ? enquiries
    : [];

  const productData = Array.isArray(products)
    ? products
    : [];

  const productCount = productData.length;

  const enquiryCount = Number.isFinite(
    pendingEnquiriesCount
  )
    ? Math.max(0, pendingEnquiriesCount)
    : 0;

  const totalSalesHistoryCount = useMemo(() => {
    return enquiryData.length;
  }, [enquiryData]);

  const totalInvoiceCount = useMemo(() => {
    return enquiryData.filter((enquiry) => {
      const status = normalizeStatus(
        (enquiry as any)?.status
      );

      return INVOICE_STATUSES.has(status);
    }).length;
  }, [enquiryData]);

  const badges = useMemo<
    Partial<Record<AdminTabId, number | string>>
  >(() => {
    return {
      products: productCount,

      enquiries:
        enquiryCount > 0
          ? `${enquiryCount} New`
          : 0,

      sales_history: totalSalesHistoryCount,

      invoices: totalInvoiceCount,
    };
  }, [
    productCount,
    enquiryCount,
    totalSalesHistoryCount,
    totalInvoiceCount,
  ]);

  const activeTabLabel =
    ADMIN_TABS.find(
      (item) => item.id === activeTab
    )?.label || 'Dashboard';

  const handleLogoutAction = () => {
    console.log(
      '=========================================='
    );
    console.log('🔐 MEERA FASHION ADMIN LOGOUT');
    console.log(
      '=========================================='
    );

    sessionStorage.removeItem(
      'meera_admin_authenticated'
    );

    localStorage.removeItem(
      'meera_admin_authenticated'
    );

    console.log(
      '✅ Admin authentication cleared'
    );

    if (onLogout) {
      console.log(
        '➡️ Returning to AdminLoginPage'
      );

      onLogout();
    } else {
      console.warn(
        '⚠️ onLogout callback was not provided.'
      );
    }
  };

  const handleWhatsApp = () => {
    openWhatsAppChat(
      settings.whatsappNumber,
      'Hello Meera Fashion Concierge Test.'
    );
  };

  return (
    <>
      {/* =====================================================
          MOBILE TOP BAR
      ====================================================== */}
      <header
        className="
          lg:hidden
          sticky
          top-0
          z-50
          w-full
          bg-[#1C1217]/95
          backdrop-blur-2xl
          border-b
          border-white/10
          shadow-lg
          shadow-black/30
        "
      >
        <div
          className="
            h-16
            px-4
            flex
            items-center
            justify-between
            gap-3
          "
        >
          {/* Logo + Brand */}
          <div
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >
            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-white
                p-1
                overflow-hidden
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <img
                src={
                  settings.customLogoUrl ||
                  LogoImage
                }
                alt={
                  settings.brandName ||
                  'Meera Fashion'
                }
                className="
                  w-full
                  h-full
                  object-contain
                "
              />
            </div>

            <div className="min-w-0">
              <h1
                className="
                  text-sm
                  font-serif
                  font-bold
                  text-white
                  truncate
                "
              >
                {settings.brandName ||
                  'Meera Fashion'}
              </h1>

              <p
                className="
                  text-[9px]
                  text-rose-200/60
                  uppercase
                  tracking-widest
                  truncate
                "
              >
                {activeTabLabel}
              </p>
            </div>
          </div>

          {/* Mobile Live Status */}
          <div
            className="
              flex
              items-center
              gap-2
              shrink-0
            "
          >
            <span
              className="
                relative
                flex
                w-2
                h-2
              "
            >
              <span
                className="
                  absolute
                  inline-flex
                  w-full
                  h-full
                  rounded-full
                  bg-emerald-400
                  opacity-75
                  animate-ping
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  w-2
                  h-2
                  rounded-full
                  bg-emerald-400
                "
              />
            </span>

            <span
              className="
                hidden
                sm:block
                text-[9px]
                text-emerald-300/80
                font-mono
                uppercase
                tracking-wider
              "
            >
              Live
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <aside
        className="
          hidden
          lg:flex
          lg:w-72
          lg:shrink-0

          bg-[#1C1217]/98
          backdrop-blur-2xl

          border
          border-white/10
          rounded-3xl

          p-5

          flex-col
          justify-between

          shadow-2xl
          shadow-black/90

          h-[calc(100vh-2rem)]

          sticky
          top-4

          z-30
        "
      >
        {/* =====================================================
            TOP SECTION (Logo & Status)
        ===================================================== */}
        <div className="space-y-3.5 shrink-0">
          <div
            className="
              flex
              items-center
              justify-between
              pb-3.5
              border-b
              border-white/10
            "
          >
            <div
              className="
                flex
                items-center
                gap-2.5
                min-w-0
              "
            >
              <div
                className="
                  relative
                  flex
                  items-center
                  justify-center
                  w-12
                  h-12
                  rounded-2xl
                  bg-white/90
                  shadow-[0_0_20px_rgba(255,255,255,0.25)]
                  border
                  border-white/40
                  overflow-hidden
                  shrink-0
                  p-1
                "
              >
                <img
                  src={
                    settings.customLogoUrl ||
                    LogoImage
                  }
                  alt={
                    settings.brandName ||
                    'Meera Fashion'
                  }
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    font-serif
                    text-base
                    font-bold
                    text-white
                    tracking-wide
                    truncate
                  "
                >
                  {settings.brandName ||
                    'Meera Fashion'}
                </h2>

                <p
                  className="
                    text-[10px]
                    text-rose-200/70
                    uppercase
                    tracking-widest
                    truncate
                  "
                >
                  {settings.tagline ||
                    'Boutique CMS'}
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-1.5
              px-1
            "
          >
            <span
              className="
                relative
                flex
                w-2
                h-2
                shrink-0
              "
              aria-hidden="true"
            >
              <span
                className="
                  absolute
                  inline-flex
                  w-full
                  h-full
                  rounded-full
                  bg-emerald-400
                  opacity-75
                  animate-ping
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  w-2
                  h-2
                  rounded-full
                  bg-emerald-400
                "
              />
            </span>

            <span
              className="
                text-[10px]
                text-rose-200/80
                font-mono
                uppercase
                tracking-widest
                font-semibold
              "
            >
              CMS Live • London
            </span>
          </div>
        </div>

        {/* =====================================================
            MIDDLE NAVIGATION (Natural Native Scrolling)
        ===================================================== */}
        <nav
          className="
            flex-1
            overflow-y-auto
            my-3
            pr-1
            space-y-1
            min-h-0
          "
        >
          {ADMIN_TABS.map((item) => {
            const Icon = item.icon;

            const isActive =
              activeTab === item.id;

            const badge =
              badges[item.id];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setActiveTab(item.id)
                }
                id={`admin-nav-${item.id}`}
                className={`
                  w-full
                  min-h-9
                  flex
                  items-center
                  justify-between
                  px-3.5
                  py-2
                  rounded-2xl
                  text-sm
                  font-bold
                  transition-all
                  duration-200
                  cursor-pointer
                  active:scale-[0.98]

                  ${
                    isActive
                      ? `
                        bg-gradient-to-r
                        from-[#9E315A]
                        to-[#C94F7C]
                        text-white
                        shadow-md
                        shadow-rose-950/40
                        scale-[1.01]
                      `
                      : `
                        text-rose-100/70
                        hover:text-white
                        hover:bg-white/5
                      `
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    min-w-0
                  "
                >
                  <Icon
                    className="
                      w-[18px]
                      h-[18px]
                      shrink-0
                    "
                  />

                  <span className="truncate">
                    {item.label}
                  </span>
                </div>

                {badge !== undefined &&
                  (badge === 'WebP' ? (
                    <span
                      className="
                        text-[9px]
                        uppercase
                        tracking-wider
                        font-bold
                        text-rose-300
                        bg-rose-900/40
                        px-1.5
                        py-0.5
                        rounded-md
                        shrink-0
                        ml-2
                      "
                    >
                      {badge}
                    </span>
                  ) : (
                    <span
                      className={`
                        text-[10px]
                        px-2
                        py-0.5
                        rounded-full
                        font-mono
                        shrink-0
                        ml-2

                        ${
                          typeof badge === 'string' &&
                          badge.includes('New')
                            ? `
                              bg-[#25D366]
                              text-white
                            `
                            : `
                              bg-white/10
                              text-rose-100
                            `
                        }
                      `}
                    >
                      {badge}
                    </span>
                  ))}
              </button>
            );
          })}
        </nav>

        {/* =====================================================
            BOTTOM SECTION (WhatsApp, Logout, & Footer)
        ===================================================== */}
        <div
          className="
            pt-3.5
            border-t
            border-white/10
            space-y-2.5
            shrink-0
          "
        >
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="
              w-full
              min-h-9
              flex
              items-center
              justify-center
              gap-2
              px-3
              py-2
              rounded-xl
              bg-white/5
              hover:bg-white/10
              border
              border-white/10
              text-white
              text-xs
              font-semibold
              transition-all
              active:scale-[0.98]
              cursor-pointer
            "
          >
            <MessageCircle
              className="
                w-3.5
                h-3.5
                text-[#25D366]
              "
            />

            <span>
              Test WhatsApp Concierge
            </span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={
              handleLogoutAction
            }
            className="
              w-full
              min-h-9
              flex
              items-center
              justify-center
              gap-2
              px-3
              py-2
              rounded-xl
              bg-rose-600/20
              hover:bg-rose-600/30
              border
              border-rose-500/30
              text-rose-200
              hover:text-white
              text-xs
              font-bold
              transition-all
              active:scale-[0.98]
              cursor-pointer
            "
          >
            <LogOut
              className="
                w-3.5
                h-3.5
                text-rose-400
              "
            />

            <span>
              Admin Logout
            </span>
          </button>

          {/* Footer */}
          <div
            className="
              text-center
              space-y-0.5
              pt-1
            "
          >
            <p
              className="
                text-[9px]
                text-rose-200/50
                font-mono
                truncate
              "
            >
              Meera Fashion CMS • London UK
            </p>

            <p
              className="
                text-[9px]
                text-rose-200/80
              "
            >
              Developed by{' '}
              <span
                className="
                  font-bold
                  text-white
                  tracking-wide
                "
              >
                NeirahTech
              </span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;