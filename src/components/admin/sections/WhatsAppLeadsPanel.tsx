import React from 'react';
import {
  MessageCircle,
  Eye,
  FileDown,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

import type {
  EnquiryOrder,
  BrandSettings,
} from '../../../types';

import { openWhatsAppChat } from '../../../services/whatsapp';

/* ================================================================
   TYPES
================================================================ */

type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Confirmed'
  | 'Paid'
  | 'Preparing'
  | 'Delivered'
  | 'Cancelled';

interface WhatsAppLeadsPanelProps {
  enquiries: EnquiryOrder[];

  settings: BrandSettings;

  setActiveTab: (
    tab:
      | 'dashboard'
      | 'products'
      | 'enquiries'
      | 'sales_history'
      | 'invoices'
      | 'media'
      | 'reports'
      | 'settings'
  ) => void;

  setSelectedOrderDetails: (
    order: EnquiryOrder | null
  ) => void;

  handleDownloadOrderInvoicePdf: (
    enquiry: EnquiryOrder
  ) => void;

  handleDeleteEnquiry: (
    enquiry: EnquiryOrder
  ) => void;

  /**
   * This function must update the database
   * and then update the local enquiries state.
   */
  handleRequestEnquiryStatusChange: (
    enquiry: EnquiryOrder,
    nextStatus: EnquiryStatus
  ) => void | Promise<void>;
}

/* ================================================================
   STATUS OPTIONS
================================================================ */

const STATUS_OPTIONS: EnquiryStatus[] = [
  'New',
  'Contacted',
  'Confirmed',
  'Paid',
  'Preparing',
  'Delivered',
  'Cancelled',
];

/* ================================================================
   STATUS STYLE
================================================================ */

const getStatusClassName = (
  status: EnquiryStatus
): string => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-800';

    case 'New':
      return 'bg-rose-100 text-[#9E315A]';

    case 'Cancelled':
      return 'bg-red-100 text-red-800';

    case 'Delivered':
      return 'bg-blue-100 text-blue-800';

    case 'Preparing':
      return 'bg-amber-100 text-amber-800';

    case 'Confirmed':
      return 'bg-purple-100 text-purple-800';

    case 'Contacted':
      return 'bg-sky-100 text-sky-800';

    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/* ================================================================
   COMPONENT
================================================================ */

export const WhatsAppLeadsPanel: React.FC<
  WhatsAppLeadsPanelProps
> = ({
  enquiries,
  settings,
  setActiveTab,
  setSelectedOrderDetails,
  handleDownloadOrderInvoicePdf,
  handleDeleteEnquiry,
  handleRequestEnquiryStatusChange,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="
        flex
        flex-col
        sm:flex-row
        items-stretch
        sm:items-center
        justify-between
        gap-3
        bg-white
        p-4
        rounded-3xl
        border
        border-rose-100
        shadow-sm
      ">

        <div className="flex items-center gap-2">

          <MessageCircle className="
            w-5
            h-5
            text-[#9E315A]
            shrink-0
          " />

          <div>

            <h3 className="
              font-serif
              font-bold
              text-base
              text-[#241B20]
            ">
              Active WhatsApp Orders &amp; Inquiries ({enquiries.length})
            </h3>

            <p className="
              text-xs
              text-[#8C5D6C]
            ">
              Real-time customer selections sent from website &amp;
              concierge bookings
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            setActiveTab('sales_history')
          }
          className="
            flex
            items-center
            justify-center
            gap-1.5
            px-3.5
            py-2
            rounded-2xl
            bg-rose-50
            hover:bg-rose-100
            text-[#9E315A]
            text-xs
            font-bold
            border
            border-rose-200
            transition-all
            cursor-pointer
          "
        >
          <MessageCircle className="w-4 h-4" />

          <span>
            Open Sales History Table
          </span>
        </button>

      </div>

      {/* ==========================================================
          EMPTY STATE
      ========================================================== */}

      {enquiries.length === 0 && (
        <div className="
          bg-white
          border
          border-rose-100
          rounded-3xl
          p-10
          text-center
          shadow-sm
        ">
          <MessageCircle className="
            w-10
            h-10
            mx-auto
            text-rose-200
            mb-3
          " />

          <h4 className="
            font-serif
            font-bold
            text-[#241B20]
          ">
            No enquiries yet
          </h4>

          <p className="
            text-xs
            text-[#8C5D6C]
            mt-1
          ">
            New WhatsApp enquiries will appear here.
          </p>
        </div>
      )}

      {/* ==========================================================
          ENQUIRY LIST
      ========================================================== */}

      <div className="space-y-4">

        {enquiries.map((enq) => {

          const status =
            enq.status as EnquiryStatus;

          return (
            <div
              key={enq.id}
              className="
                p-5
                sm:p-6
                rounded-3xl
                bg-white
                border
                border-rose-100/90
                shadow-sm
                flex
                flex-col
                md:flex-row
                md:items-center
                justify-between
                gap-5
              "
            >

              {/* ==================================================
                  ORDER INFORMATION
              ================================================== */}

              <div className="
                space-y-2.5
                flex-1
                min-w-0
              ">

                {/* ORDER HEADER */}

                <div className="
                  flex
                  items-center
                  gap-2
                  flex-wrap
                ">

                  <span className="
                    font-mono
                    font-bold
                    text-xs
                    bg-rose-50
                    text-[#9E315A]
                    px-3
                    py-1
                    rounded-full
                    border
                    border-rose-200/60
                  ">
                    {enq.orderNumber}
                  </span>

                  <span className="
                    text-xs
                    text-rose-300
                  ">
                    •
                  </span>

                  <span className="
                    text-xs
                    text-[#8C5D6C]
                  ">
                    {new Date(
                      enq.createdAt
                    ).toLocaleDateString(
                      'en-GB',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </span>

                  {/* STATUS BADGE */}

                  <span
                    className={`
                      text-[10px]
                      font-bold
                      px-2.5
                      py-0.5
                      rounded-full
                      ${getStatusClassName(status)}
                    `}
                  >
                    Status: {status}
                  </span>

                </div>

                {/* CUSTOMER */}

                <div>

                  <h4 className="
                    font-serif
                    font-bold
                    text-base
                    text-[#241B20]
                  ">
                    {enq.customerName}
                  </h4>

                  <p className="
                    text-xs
                    text-[#5A4550]
                  ">
                    WhatsApp Phone:{' '}
                    <strong>
                      {enq.customerPhone}
                    </strong>
                  </p>

                </div>

                {/* ITEMS */}

                <div className="
                  bg-[#FFF8FA]
                  p-3
                  rounded-2xl
                  text-xs
                  space-y-1.5
                  border
                  border-rose-100/70
                ">

                  {enq.items.map(
                    (it, idx) => (
                      <div
                        key={idx}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          text-[#3E2F37]
                        "
                      >

                        <span className="min-w-0">
                          • {it.quantity}x{' '}
                          {it.productName}{' '}
                          {it.size
                            ? `(Size: ${it.size})`
                            : ''}
                        </span>

                        <span className="
                          font-bold
                          text-[#9E315A]
                          shrink-0
                        ">
                          £
                          {Number(
                            it.price
                          ) *
                            Number(
                              it.quantity
                            )}
                        </span>

                      </div>
                    )
                  )}

                </div>

                {/* CANCELLED INFORMATION */}

                {status === 'Cancelled' && (
                  <div className="
                    p-3
                    rounded-2xl
                    bg-red-50/80
                    border
                    border-red-200
                    text-xs
                    text-red-900
                    space-y-1
                  ">

                    <div className="
                      flex
                      items-center
                      gap-1.5
                      font-bold
                      text-red-700
                    ">

                      <AlertTriangle className="
                        w-3.5
                        h-3.5
                        shrink-0
                      " />

                      <span>
                        Lead Cancelled Clarification:
                      </span>

                    </div>

                    <p className="
                      text-[11px]
                      leading-relaxed
                    ">
                      {enq.cancelReason ||
                        'Customer did not proceed with the WhatsApp booking.'}
                    </p>

                    {enq.cancelledAt && (
                      <p className="
                        text-[10px]
                        text-red-500
                        font-mono
                      ">
                        Cancelled at:{' '}
                        {new Date(
                          enq.cancelledAt
                        ).toLocaleString(
                          'en-GB'
                        )}
                      </p>
                    )}

                  </div>
                )}

                {/* NOTES */}

                {enq.notes && (
                  <p className="
                    text-[11px]
                    text-[#8C5D6C]
                    italic
                    bg-amber-50/50
                    p-2
                    rounded-xl
                    border
                    border-amber-100
                  ">
                    Note: "{enq.notes}"
                  </p>
                )}

              </div>

              {/* ==================================================
                  RIGHT SIDE
              ================================================== */}

              <div className="
                flex
                flex-col
                sm:items-end
                gap-3
                shrink-0
                pt-3
                md:pt-0
                border-t
                md:border-t-0
                border-rose-100
              ">

                {/* =================================================
                    STATUS UPDATE
                ================================================= */}

                <div className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  gap-2
                ">

                  <span className="
                    text-xs
                    font-semibold
                    text-[#8C5D6C]
                  ">
                    Update Status:
                  </span>

                  <select
                    value={status}
                    onChange={async (e) => {

                      const nextStatus =
                        e.target.value as EnquiryStatus;

                      if (
                        nextStatus ===
                        status
                      ) {
                        return;
                      }

                      /*
                       * IMPORTANT:
                       *
                       * This calls the parent handler.
                       * The parent handler must make the
                       * PATCH request to the backend.
                       */
                      await handleRequestEnquiryStatusChange(
                        enq,
                        nextStatus
                      );
                    }}
                    className="
                      bg-rose-50
                      border
                      border-rose-200
                      text-xs
                      font-bold
                      text-[#9E315A]
                      px-3
                      py-1.5
                      rounded-xl
                      outline-none
                      cursor-pointer
                    "
                  >

                    {STATUS_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option === 'Paid'
                            ? 'Paid (Generates Invoice)'
                            : option}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* TOTAL */}

                <div className="
                  text-left
                  sm:text-right
                ">

                  <span className="
                    text-[11px]
                    text-[#8C5D6C]
                    uppercase
                    font-bold
                  ">
                    Total Order Value
                  </span>

                  <p className="
                    font-serif
                    font-bold
                    text-2xl
                    text-[#9E315A]
                  ">
                    £
                    {Number(
                      enq.total
                    ).toFixed(2)}
                  </p>

                </div>

                {/* ACTIONS */}

                <div className="
                  flex
                  items-center
                  gap-2
                  w-full
                  sm:w-auto
                  flex-wrap
                  sm:flex-nowrap
                ">

                  {/* VIEW */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrderDetails(
                        enq
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-1.5
                      px-3
                      py-2
                      bg-white
                      hover:bg-rose-50
                      border
                      border-rose-200
                      text-[#241B20]
                      text-xs
                      font-bold
                      rounded-full
                      transition-all
                      cursor-pointer
                    "
                    title="View Full Order Details & Invoice"
                  >

                    <Eye className="
                      w-3.5
                      h-3.5
                      text-[#9E315A]
                    " />

                    <span>
                      View Details
                    </span>

                  </button>

                  {/* PDF */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadOrderInvoicePdf(
                        enq
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-1.5
                      px-3
                      py-2
                      bg-rose-50
                      hover:bg-rose-100
                      border
                      border-rose-200
                      text-[#9E315A]
                      text-xs
                      font-bold
                      rounded-full
                      transition-all
                      cursor-pointer
                    "
                    title="Download Official PDF Invoice"
                  >

                    <FileDown className="
                      w-3.5
                      h-3.5
                    " />

                    <span>
                      PDF Invoice
                    </span>

                  </button>

                  {/* WHATSAPP */}

                  <button
                    type="button"
                    onClick={() =>
                      openWhatsAppChat(
                        enq.customerPhone ||
                          settings.whatsappNumber,
                        `Hello ${enq.customerName} 🌸 This is Meera from Meera's Fashion regarding your order #${enq.orderNumber}.`
                      )
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      bg-[#25D366]
                      hover:bg-[#20ba59]
                      text-white
                      px-3.5
                      py-2
                      rounded-full
                      text-xs
                      font-bold
                      shadow-md
                      transition-all
                      cursor-pointer
                    "
                  >

                    <MessageCircle className="
                      w-3.5
                      h-3.5
                      fill-white
                    " />

                    <span>
                      WhatsApp
                    </span>

                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteEnquiry(
                        enq
                      )
                    }
                    className="
                      p-2
                      text-rose-400
                      hover:text-red-700
                      hover:bg-rose-100
                      rounded-full
                      transition-colors
                      cursor-pointer
                    "
                    title="Delete Lead"
                  >

                    <Trash2 className="
                      w-4
                      h-4
                    " />

                  </button>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default WhatsAppLeadsPanel;