import React, { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { Logo } from '../brand/Logo';
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

/* ================================================================
   PROPS
================================================================ */

interface AdminSidebarProps {
  activeTab: AdminTabId;
  setActiveTab: (tab: AdminTabId) => void;

  products: Product[];

  /**
   * COMPLETE enquiries table data.
   *
   * This is the main source of truth for:
   *
   * 1. Sales History count
   * 2. Invoice count
   */
  enquiries: EnquiryOrder[];

  /**
   * Kept for compatibility with AdminPortal.
   *
   * We DO NOT use invoices.length for the
   * sidebar invoice badge.
   */
  invoices: Invoice[];

  settings: BrandSettings;

  /**
   * Only pending/new enquiries.
   */
  pendingEnquiriesCount: number;

  /**
   * Kept for compatibility.
   *
   * These are intentionally ignored because
   * the sidebar calculates counts directly
   * from the enquiries table.
   */
  salesHistoryCount?: number;
  invoiceCount?: number;
}

/* ================================================================
   STATUS NORMALIZER
================================================================ */

const normalizeStatus = (
  value: unknown
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, ' ');
};

/* ================================================================
   INVOICE STATUSES
================================================================ */

/**
 * These enquiry statuses should appear in
 * the Invoice section.
 *
 * IMPORTANT:
 *
 * Invoice count is calculated from the
 * COMPLETE enquiries table, NOT from
 * invoices.length.
 */
const INVOICE_STATUSES = new Set([
  'paid',
  'preparing',
  'delivered',
]);

/* ================================================================
   COMPONENT
================================================================ */

export const AdminSidebar: React.FC<
  AdminSidebarProps
> = ({
  activeTab,
  setActiveTab,

  products,
  enquiries,

  // Kept because AdminPortal still passes it.
  // It is intentionally NOT used for invoice count.
  invoices: _invoices,

  settings,

  pendingEnquiriesCount,

  // Compatibility props.
  salesHistoryCount: _salesHistoryCount,
  invoiceCount: _invoiceCount,
}) => {

  /* ==============================================================
     SAFE DATA
  ============================================================== */

  const enquiryData =
    Array.isArray(enquiries)
      ? enquiries
      : [];

  const productData =
    Array.isArray(products)
      ? products
      : [];

  /* ==============================================================
     PRODUCT COUNT
  ============================================================== */

  const productCount =
    productData.length;

  /* ==============================================================
     ENQUIRY COUNT
  ============================================================== */

  /**
   * This is ONLY for the "Enquiries" badge.
   *
   * It should represent pending/new enquiries.
   */
  const enquiryCount =
    Number.isFinite(
      pendingEnquiriesCount
    )
      ? Math.max(
          0,
          pendingEnquiriesCount
        )
      : 0;

  /* ==============================================================
     SALES HISTORY COUNT
  ============================================================== */

  /**
   * SALES HISTORY = ALL ENQUIRIES
   *
   * Do NOT filter by status here.
   *
   * Example:
   *
   * enquiries table:
   *
   * Pending       3
   * Paid          2
   * Preparing     1
   * Delivered     3
   * Cancelled     1
   * ----------------
   * TOTAL         10
   *
   * Sidebar:
   *
   * Sales History → 10
   */
  const totalSalesHistoryCount =
    useMemo(() => {
      return enquiryData.length;
    }, [enquiryData]);

  /* ==============================================================
     INVOICE COUNT
  ============================================================== */

  /**
   * INVOICES = PAID + PREPARING + DELIVERED
   *
   * IMPORTANT:
   *
   * We intentionally calculate this from
   * the COMPLETE enquiries table.
   *
   * We DO NOT use:
   *
   *     invoices.length
   *
   * because the Invoice panel may have a
   * separately mapped/filtered dataset.
   *
   * Example:
   *
   * enquiries table:
   *
   * Pending       3
   * Paid          1
   * Preparing     1
   * Delivered     2
   * Cancelled     3
   * ----------------
   * Total         10
   *
   * Invoice count:
   *
   * Paid          1
   * Preparing     1
   * Delivered     2
   * ----------------
   * Invoice       4
   */
  const totalInvoiceCount =
    useMemo(() => {

      return enquiryData.filter(
        (enquiry) => {

          const status =
            normalizeStatus(
              (enquiry as any)?.status
            );

          return INVOICE_STATUSES.has(
            status
          );
        }
      ).length;

    }, [enquiryData]);

  /* ==============================================================
     BADGES
  ============================================================== */

  const badges =
    useMemo<
      Partial<
        Record<
          AdminTabId,
          number | string
        >
      >
    >(() => {

      return {

        /* --------------------------------------------------------
           PRODUCTS
        -------------------------------------------------------- */

        products:
          productCount,

        /* --------------------------------------------------------
           ENQUIRIES
        -------------------------------------------------------- */

        enquiries:
          enquiryCount > 0
            ? `${enquiryCount} New`
            : 0,

        /* --------------------------------------------------------
           SALES HISTORY
           
           ALL ENQUIRIES
        -------------------------------------------------------- */

        sales_history:
          totalSalesHistoryCount,

        /* --------------------------------------------------------
           INVOICES
           
           PAID + PREPARING + DELIVERED
        -------------------------------------------------------- */

        invoices:
          totalInvoiceCount,

        /* --------------------------------------------------------
           MEDIA
        -------------------------------------------------------- */

        media:
          'WebP',
      };

    }, [
      productCount,
      enquiryCount,
      totalSalesHistoryCount,
      totalInvoiceCount,
    ]);

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <aside
      className="
        w-56 lg:w-64
        bg-[#1C1217]/95
        backdrop-blur-2xl
        border border-white/10
        rounded-3xl
        p-4 lg:p-5
        flex flex-col
        justify-between
        shadow-2xl
        shadow-black/60
        shrink-0
        hidden md:flex
        h-full
        min-h-0
      "
    >

      {/* ==========================================================
          TOP
      ========================================================== */}

      <div className="space-y-5">

        {/* ========================================================
            LOGO
        ======================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            pb-4
            border-b
            border-white/10
          "
        >

          <div className="space-y-0.5">

            <Logo
              variant="light"
              size="sm"
              customLogoUrl={
                settings.customLogoUrl
              }
              brandName={
                settings.brandName
              }
              tagline={
                settings.tagline
              }
            />

            {/* ====================================================
                LIVE STATUS
            ==================================================== */}

            <div
              className="
                flex
                items-center
                gap-1.5
                pt-1
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

        </div>

        {/* ========================================================
            NAVIGATION
        ======================================================== */}

        <nav
          className="
            space-y-1
            overflow-y-auto
            no-scrollbar
            max-h-[calc(100vh-220px)]
          "
        >

          {ADMIN_TABS.map(
            (item) => {

              const Icon =
                item.icon;

              const isActive =
                activeTab ===
                item.id;

              const badge =
                badges[
                  item.id
                ];

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      item.id
                    )
                  }
                  id={`admin-nav-${item.id}`}
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    px-3.5
                    py-2.5
                    rounded-2xl
                    text-xs
                    font-bold
                    transition-all
                    duration-200
                    cursor-pointer

                    ${
                      isActive
                        ? `
                          bg-linear-to-r
                          from-[#9E315A]
                          to-[#C94F7C]
                          text-white
                          shadow-lg
                          shadow-rose-950/50
                          scale-[1.02]
                        `
                        : `
                          text-rose-100/70
                          hover:text-white
                          hover:bg-white/5
                        `
                    }
                  `}
                >

                  {/* ==================================================
                      LEFT SIDE
                  ================================================== */}

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
                        w-4
                        h-4
                        shrink-0
                      "
                    />

                    <span
                      className="
                        truncate
                      "
                    >
                      {item.label}
                    </span>

                  </div>

                  {/* ==================================================
                      BADGE
                  ================================================== */}

                  {badge !==
                    undefined && (

                    badge ===
                    'WebP' ? (

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

                          ${
                            typeof badge ===
                              'string' &&
                            badge.includes(
                              'New'
                            )
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

                    )

                  )}

                </button>
              );
            }
          )}

        </nav>

      </div>

      {/* ==========================================================
          BOTTOM
      ============================================================== */}

      <div
        className="
          pt-4
          border-t
          border-white/10
          space-y-2.5
        "
      >

        {/* ========================================================
            WHATSAPP
        ======================================================== */}

        <button
          type="button"
          onClick={() =>
            openWhatsAppChat(
              settings.whatsappNumber,
              'Hello Meera Fashion Concierge Test.'
            )
          }
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
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

        {/* ========================================================
            FOOTER
        ======================================================== */}

        <div
          className="
            text-center
            space-y-1
          "
        >

          <p
            className="
              text-[10px]
              text-rose-200/50
              font-mono
            "
          >
            Meera Fashion CMS • London UK
          </p>

          <p
            className="
              text-[10px]
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
  );
};

export default AdminSidebar;