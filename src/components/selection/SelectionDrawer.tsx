import React, { useState } from 'react';

import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';

import confetti from 'canvas-confetti';

import {
  SelectionItem,
  BrandSettings,
  EnquiryOrder,
} from '../../types';

import {
  generateWhatsAppSelectionMessage,
  openWhatsAppChat,
} from '../../services/whatsapp';

import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../utils/imageFallback';

interface SelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SelectionItem[];
  onUpdateQuantity: (
    id: string,
    newQty: number
  ) => void;
  onRemoveItem: (id: string) => void;
  onClearSelection: () => void;

  onRecordEnquiry: (
    enquiry: EnquiryOrder
  ) => Promise<void> | void;

  settings: BrandSettings;
  onContinueShopping: () => void;
}

/**
 * Get currency symbol from currency code.
 */
const getCurrencySymbol = (
  currencyCode?: string,
  fallbackSymbol?: string
): string => {
  const code = currencyCode?.trim() || 'GBP';

  try {
    const parts = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);

    const symbol = parts.find(
      (part) => part.type === 'currency'
    )?.value;

    if (symbol) {
      return symbol;
    }
  } catch {
    // Fall through to fallback
  }

  const fallback = fallbackSymbol?.trim();

  if (
    fallback &&
    fallback !== '?' &&
    fallback !== '�'
  ) {
    return fallback;
  }

  return '£';
};

/**
 * Format currency amount.
 */
const formatCurrency = (
  amount: number,
  currencyCode?: string,
  fallbackSymbol?: string
): string => {
  const code = currencyCode?.trim() || 'GBP';

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = getCurrencySymbol(
      code,
      fallbackSymbol
    );

    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const SelectionDrawer: React.FC<
  SelectionDrawerProps
> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearSelection,
  onRecordEnquiry,
  settings,
  onContinueShopping,
}) => {
  const [customerName, setCustomerName] =
    useState('');

  const [customerPhone, setCustomerPhone] =
    useState('');

  const [customerNotes, setCustomerNotes] =
    useState('');

  const [showPreview, setShowPreview] =
    useState(false);

  const [isSending, setIsSending] =
    useState(false);

  const [sendError, setSendError] =
    useState('');

  if (!isOpen) {
    return null;
  }

  /*
   * Currency
   */
  const currencyCode =
    settings.currencyCode?.trim() || 'GBP';

  const currencySymbol = getCurrencySymbol(
    currencyCode,
    settings.currencySymbol
  );

  /*
   * Total
   */
  const totalAmount = items.reduce(
    (sum, item) =>
      sum + item.unitPrice * item.quantity,
    0
  );

  /*
   * WhatsApp message.
   */
  const liveMessage =
    generateWhatsAppSelectionMessage(
      items,
      {
        name: customerName,
        phone: customerPhone,
        notes: customerNotes,
      },
      settings.brandName,
      currencySymbol
    );

  /**
   * Small delay before opening WhatsApp.
   *
   * This gives mobile browsers enough time to
   * finish UI updates after the database request.
   */
  const waitBeforeOpeningWhatsApp = (
    milliseconds: number
  ) =>
    new Promise<void>((resolve) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    });

  /**
   * Send selection to WhatsApp.
   *
   * IMPORTANT FLOW:
   *
   * 1. Create enquiry object
   * 2. Save enquiry to database
   * 3. Wait for database handler
   * 4. Small mobile-safe delay
   * 5. Open WhatsApp
   */
  const handleSendToWhatsApp = async () => {
    if (items.length === 0 || isSending) return;

    setIsSending(true);
    setSendError('');

    try {
      const newEnquiry: EnquiryOrder = {
        id: `enq-${Date.now()}`,
        orderNumber: `MF-ENQ-${new Date().getFullYear()}-${Math.floor(
          100 + Math.random() * 900
        )}`,

        customerName:
          customerName.trim() || 'WhatsApp Customer',

        customerPhone:
          customerPhone.trim() || 'Via WhatsApp',

        customerEmail: 'Pending confirmation',

        items: items.map((it) => ({
          productId: it.productId,
          productName: it.product.name,
          quantity: it.quantity,
          price: it.unitPrice,
          size: it.selectedSize,
          image: it.product.images.main,
        })),

        subtotal: totalAmount,
        discount: 0,
        total: totalAmount,
        status: 'New',

        notes:
          customerNotes.trim() ||
          'Sent via boutique selection drawer',

        createdAt: new Date().toISOString(),
        source: 'WhatsApp',
      };

      /*
      * STEP 1
      * Save enquiry and WAIT for database response.
      */
      await Promise.resolve(
        onRecordEnquiry(newEnquiry)
      );

      /*
      * STEP 2
      * Database save succeeded.
      *
      * Now remove all products from My Selection.
      */
      onClearSelection();

      /*
      * STEP 3
      * Give mobile browser a short moment to
      * complete the state update before opening WhatsApp.
      */
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 300);
      });

      /*
      * STEP 4
      * Open WhatsApp only after successful save.
      */
      openWhatsAppChat(
        settings.whatsappNumber,
        liveMessage
      );
    } catch (error) {
      console.error(
        '❌ Failed to record WhatsApp enquiry:',
        error
      );

      /*
      * IMPORTANT:
      * Selection is NOT cleared when saving fails.
      */
      setSendError(
        'We could not save your enquiry. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        overflow-hidden
        bg-black/60
        backdrop-blur-sm
        flex
        justify-end
        animate-fadeIn
      "
    >
      {/* =====================================================
          DRAWER
      ====================================================== */}
      <div
        className="
          relative
          w-full
          max-w-lg
          sm:max-w-xl
          bg-white
          h-full
          shadow-2xl
          flex
          flex-col
          border-l
          border-rose-100
          overflow-hidden
        "
      >
        {/* ===================================================
            HEADER
        ==================================================== */}
        <div
          className="
            shrink-0
            px-4
            py-3.5
            sm:px-6
            sm:py-4
            bg-gradient-to-r
            from-[#FFF5F8]
            to-[#FFF0F5]
            border-b
            border-rose-200/80
            flex
            items-center
            justify-between
            gap-3
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
                w-8
                h-8
                sm:w-9
                sm:h-9
                rounded-full
                bg-[#9E315A]
                text-white
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <ShoppingBag
                className="
                  w-4
                  h-4
                  sm:w-[18px]
                  sm:h-[18px]
                "
              />
            </div>

            <div className="min-w-0">
              <h3
                className="
                  font-serif
                  font-bold
                  text-base
                  sm:text-lg
                  text-[#241B20]
                  truncate
                "
              >
                My Selection
              </h3>

              <p
                className="
                  text-[10px]
                  sm:text-[11px]
                  text-[#8C5D6C]
                  font-medium
                  truncate
                "
              >
                {items.length}{' '}
                {items.length === 1
                  ? 'curated piece'
                  : 'curated pieces'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              p-2
              text-[#3E2F37]
              hover:text-[#9E315A]
              hover:bg-white
              rounded-full
              transition-colors
              shrink-0
            "
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}
        <div
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
            p-3.5
            sm:p-5
            md:p-6
            space-y-5
            sm:space-y-6
          "
        >
          {items.length === 0 ? (
            /* =================================================
                EMPTY STATE
            ================================================== */
            <div
              className="
                text-center
                py-16
                flex
                flex-col
                items-center
              "
            >
              <div
                className="
                  w-16
                  h-16
                  rounded-full
                  bg-rose-50
                  border
                  border-rose-100
                  flex
                  items-center
                  justify-center
                  text-rose-300
                  mb-4
                "
              >
                <ShoppingBag className="w-8 h-8" />
              </div>

              <h4
                className="
                  font-serif
                  font-bold
                  text-lg
                  text-[#241B20]
                  mb-1
                "
              >
                Your Selection is Empty
              </h4>

              <p
                className="
                  text-xs
                  text-[#5A4550]
                  max-w-xs
                  mb-6
                  leading-relaxed
                "
              >
                Explore our silk sarees,
                temple jewellery bangles,
                and bridal collections to
                build your dream ensemble.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContinueShopping();
                }}
                className="
                  bg-[#9E315A]
                  hover:bg-[#C94F7C]
                  text-white
                  text-xs
                  font-semibold
                  px-6
                  py-2.5
                  rounded-full
                  transition-colors
                "
              >
                Browse Collections
              </button>
            </div>
          ) : (
            <>
              {/* =================================================
                  ITEMS
              ================================================== */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="
                      p-3
                      sm:p-3.5
                      rounded-2xl
                      bg-[#FFF8FA]
                      border
                      border-rose-100
                      flex
                      items-center
                      gap-2.5
                      sm:gap-3
                      shadow-sm
                      hover:border-rose-200
                      transition-colors
                      min-w-0
                    "
                  >
                    {/* Thumbnail */}
                    <div
                      className="
                        w-14
                        h-[4.5rem]
                        sm:w-16
                        sm:h-20
                        rounded-xl
                        overflow-hidden
                        shrink-0
                        border
                        border-rose-200/80
                        bg-white
                      "
                    >
                      <img
                        src={getOptimizedImageUrl(
                          item.product.images
                            .main,
                          {
                            width: 140,
                            quality: 60,
                            fallbackType:
                              item.product
                                .category ===
                              'jewellery'
                                ? 'jewellery'
                                : item.product
                                    .category ===
                                  'performance'
                                ? 'performance'
                                : 'saree',
                          }
                        )}
                        alt={
                          item.product.name
                        }
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) =>
                          handleImageError(
                            e,
                            item.product
                              .category ===
                              'jewellery'
                              ? 'jewellery'
                              : item.product
                                  .category ===
                                'performance'
                              ? 'performance'
                              : 'saree'
                          )
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />
                    </div>

                    {/* Details */}
                    <div
                      className="
                        flex-1
                        min-w-0
                        self-stretch
                        flex
                        flex-col
                        justify-center
                      "
                    >
                      <h4
                        className="
                          font-serif
                          font-bold
                          text-xs
                          sm:text-sm
                          text-[#241B20]
                          truncate
                        "
                      >
                        {item.product.name}
                      </h4>

                      <p
                        className="
                          text-xs
                          font-semibold
                          text-[#9E315A]
                          mt-0.5
                          whitespace-nowrap
                        "
                      >
                        {formatCurrency(
                          item.unitPrice,
                          currencyCode,
                          settings.currencySymbol
                        )}
                      </p>

                      {item.selectedSize && (
                        <span
                          className="
                            inline-flex
                            self-start
                            text-[9px]
                            sm:text-[10px]
                            bg-rose-100/80
                            text-[#9E315A]
                            font-bold
                            px-2
                            py-0.5
                            rounded
                            mt-1
                            whitespace-nowrap
                          "
                        >
                          Size:{' '}
                          {item.selectedSize}
                        </span>
                      )}
                    </div>

                    {/* Quantity */}
                    <div
                      className="
                        flex
                        flex-col
                        items-end
                        gap-1.5
                        shrink-0
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          border
                          border-rose-200
                          bg-white
                          rounded-lg
                          overflow-hidden
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          className="
                            p-1.5
                            text-rose-800
                            hover:bg-rose-50
                            active:bg-rose-100
                          "
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span
                          className="
                            px-1.5
                            sm:px-2
                            text-xs
                            font-bold
                            text-[#241B20]
                            min-w-[24px]
                            text-center
                          "
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          className="
                            p-1.5
                            text-rose-800
                            hover:bg-rose-50
                            active:bg-rose-100
                          "
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveItem(item.id)
                        }
                        className="
                          text-rose-400
                          hover:text-rose-700
                          text-xs
                          p-1
                        "
                        title="Remove"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* =================================================
                  CUSTOMER DETAILS
              ================================================== */}
              <div
                className="
                  bg-[#FFF5F8]
                  p-3.5
                  sm:p-4
                  rounded-2xl
                  border
                  border-rose-200/80
                  space-y-3
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-1
                  "
                >
                  <span
                    className="
                      text-[10px]
                      sm:text-xs
                      font-bold
                      text-[#9E315A]
                      uppercase
                      tracking-wider
                    "
                  >
                    Concierge Details
                    (Optional)
                  </span>

                  <span
                    className="
                      text-[9px]
                      sm:text-[10px]
                      text-[#8C5D6C]
                    "
                  >
                    Included in WhatsApp chat
                  </span>
                </div>

                {/* Inputs */}
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-2
                  "
                >
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Priya)"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      bg-white
                      border
                      border-rose-200
                      rounded-xl
                      px-3
                      py-2
                      text-xs
                      text-[#241B20]
                      outline-none
                      focus:border-[#9E315A]
                      focus:ring-1
                      focus:ring-[#9E315A]/20
                    "
                  />

                  <input
                    type="text"
                    placeholder="Phone / City"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      bg-white
                      border
                      border-rose-200
                      rounded-xl
                      px-3
                      py-2
                      text-xs
                      text-[#241B20]
                      outline-none
                      focus:border-[#9E315A]
                      focus:ring-1
                      focus:ring-[#9E315A]/20
                    "
                  />
                </div>

                {/* Notes */}
                <textarea
                  rows={2}
                  placeholder="Special requests, wedding dates, or sizing queries..."
                  value={customerNotes}
                  onChange={(e) =>
                    setCustomerNotes(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    bg-white
                    border
                    border-rose-200
                    rounded-xl
                    p-2.5
                    text-xs
                    text-[#241B20]
                    outline-none
                    focus:border-[#9E315A]
                    focus:ring-1
                    focus:ring-[#9E315A]/20
                    resize-none
                  "
                />

                {/* Preview */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPreview(
                      (previous) => !previous
                    )
                  }
                  className="
                    text-[11px]
                    font-semibold
                    text-[#9E315A]
                    hover:underline
                    flex
                    items-center
                    gap-1
                  "
                >
                  <Sparkles className="w-3 h-3 shrink-0" />

                  <span>
                    {showPreview
                      ? 'Hide Message Preview'
                      : 'Preview WhatsApp Message'}
                  </span>
                </button>

                {showPreview && (
                  <pre
                    className="
                      mt-2
                      p-3
                      bg-white
                      border
                      border-rose-200
                      rounded-xl
                      text-[10px]
                      text-[#241B20]
                      font-mono
                      whitespace-pre-wrap
                      leading-relaxed
                      max-h-40
                      overflow-y-auto
                    "
                  >
                    {liveMessage}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>

        {/* ===================================================
            FOOTER
        ==================================================== */}
        {items.length > 0 && (
          <div
            className="
              shrink-0
              p-3.5
              sm:p-5
              md:p-6
              bg-white
              border-t
              border-rose-100
              shadow-lg
              space-y-3
              pb-[max(0.875rem,env(safe-area-inset-bottom))]
            "
          >
            {/* Total */}
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <span
                className="
                  text-xs
                  sm:text-sm
                  font-semibold
                  text-[#5A4550]
                "
              >
                Estimated Selection Total:
              </span>

              <span
                className="
                  font-serif
                  font-bold
                  text-xl
                  sm:text-2xl
                  text-[#9E315A]
                  whitespace-nowrap
                "
              >
                {formatCurrency(
                  totalAmount,
                  currencyCode,
                  settings.currencySymbol
                )}
              </span>
            </div>

            {/* Delivery */}
            <p
              className="
                text-[10px]
                sm:text-[11px]
                text-[#8C5D6C]
                text-center
                leading-relaxed
              "
            >
              Free UK Royal Mail Delivery
              applies on orders over{' '}
              {formatCurrency(
                100,
                currencyCode,
                settings.currencySymbol
              )}
            </p>

            {/* Error */}
            {sendError && (
              <div
                className="
                  w-full
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2.5
                  text-[11px]
                  text-red-700
                  text-center
                  leading-relaxed
                "
              >
                {sendError}
              </div>
            )}

            {/* =================================================
                PRIMARY WHATSAPP BUTTON
            ================================================== */}
            <button
              type="button"
              onClick={
                handleSendToWhatsApp
              }
              disabled={isSending}
              className="
                w-full
                inline-flex
                items-center
                justify-center
                gap-2.5
                bg-[#25D366]
                hover:bg-[#20BA59]
                active:bg-[#1EAD53]
                disabled:bg-[#8ED9A9]
                disabled:cursor-wait
                text-white
                py-3.5
                px-4
                sm:px-6
                rounded-2xl
                font-bold
                text-xs
                sm:text-sm
                shadow-md
                hover:shadow-lg
                transition-all
                duration-200
                cursor-pointer
                disabled:shadow-none
              "
            >
              {isSending ? (
                <>
                  <span
                    className="
                      w-5
                      h-5
                      rounded-full
                      border-2
                      border-white/40
                      border-t-white
                      animate-spin
                      shrink-0
                    "
                  />

                  <span className="whitespace-nowrap">
                    Saving Enquiry...
                  </span>
                </>
              ) : (
                <>
                  <MessageCircle
                    className="
                      w-5
                      h-5
                      fill-white
                      shrink-0
                    "
                  />

                  <span
                    className="
                      whitespace-nowrap
                      overflow-hidden
                      text-ellipsis
                    "
                  >
                    Send Selection to WhatsApp
                    Concierge
                  </span>
                </>
              )}
            </button>

            {/* WhatsApp Information */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-1.5
                sm:gap-2
                text-[9px]
                sm:text-[10px]
                text-[#8C5D6C]
                text-center
              "
            >
              <ShieldCheck
                className="
                  w-3.5
                  h-3.5
                  text-[#25D366]
                  shrink-0
                "
              />

              <span className="min-w-0">
                Opens official{' '}
                {settings.brandName}{' '}
                WhatsApp (
                {settings.formattedPhone ||
                  settings.phone}
                )
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};