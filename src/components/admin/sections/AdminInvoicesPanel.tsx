import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Download,
  Printer,
  Search,
  Trash2,
  FileText,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import type { Invoice } from '../../../types';

/* ================================================================
   PROPS
================================================================ */

interface AdminInvoicesPanelProps {
  invoices?: Invoice[];

  onDownloadInvoice: (
    invoice: Invoice
  ) => void;

  onPrintInvoice?: (
    invoice: Invoice
  ) => void;

  onDeleteInvoice: (
    invoice: Invoice
  ) => void;
}

/* ================================================================
   TYPES
================================================================ */

interface EnquiryItem {
  id?: string | number;
  productId?: string | number;

  productName?: unknown;
  name?: unknown;
  description?: unknown;

  quantity?: unknown;
  unitPrice?: unknown;
  price?: unknown;
  total?: unknown;
}

interface BackendEnquiry {
  id?: string | number;
  enquiryId?: string | number;

  invoiceNumber?: unknown;
  invoice_number?: unknown;

  orderNumber?: unknown;
  order_number?: unknown;

  customerName?: unknown;
  customer_name?: unknown;
  name?: unknown;

  customerPhone?: unknown;
  customer_phone?: unknown;
  phone?: unknown;
  mobile?: unknown;

  customerEmail?: unknown;
  customer_email?: unknown;

  customerAddress?: unknown;
  customer_address?: unknown;

  status?: unknown;

  issueDate?: unknown;
  issue_date?: unknown;

  createdAt?: unknown;
  created_at?: unknown;

  total?: unknown;
  totalAmount?: unknown;
  total_amount?: unknown;
  amount?: unknown;

  subtotal?: unknown;
  discount?: unknown;
  shipping?: unknown;

  items?: unknown;
  products?: unknown;
  orderItems?: unknown;

  notes?: unknown;
  source?: unknown;

  [key: string]: unknown;
}

/* ================================================================
   API CONFIG
================================================================ */

/**
 * IMPORTANT:
 *
 * Frontend:
 * http://172.20.10.2:3000
 *
 * Backend:
 * http://172.20.10.2:4004
 *
 * VITE_API_BASE_URL should be:
 *
 * VITE_API_BASE_URL=http://172.20.10.2:4004
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://172.20.10.2:4004';

/**
 * Only these enquiry statuses should appear
 * in the invoice section.
 */
const INVOICE_STATUSES = [
  'paid',
  'preparing',
  'delivered',
] as const;

/* ================================================================
   SAFE HELPERS
================================================================ */

const safeText = (
  value: unknown,
  fallback = ''
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (
    typeof value === 'object'
  ) {
    try {
      const object =
        value as Record<string, unknown>;

      if (
        typeof object.name ===
        'string'
      ) {
        return object.name;
      }

      if (
        typeof object.value ===
        'string'
      ) {
        return object.value;
      }

      if (
        typeof object.label ===
        'string'
      ) {
        return object.label;
      }

      if (
        typeof object.number ===
          'string' ||
        typeof object.number ===
          'number'
      ) {
        return String(
          object.number
        );
      }

      return fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const safeNumber = (
  value: unknown,
  fallback = 0
): number => {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === 'string'
  ) {
    const cleaned =
      value.replace(
        /[^0-9.-]/g,
        ''
      );

    const parsed =
      Number(cleaned);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return fallback;
};

const searchableText = (
  value: unknown
): string => {
  return safeText(
    value
  ).toLowerCase();
};

/* ================================================================
   STATUS NORMALIZER
================================================================ */

const normalizeStatus = (
  value: unknown
): string => {
  return safeText(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, ' ');
};

/* ================================================================
   DATE FORMATTER
================================================================ */

const formatDate = (
  value: unknown
): string => {
  const text =
    safeText(value);

  if (!text) {
    return 'Not available';
  }

  const date =
    new Date(text);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return text;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );
};

/* ================================================================
   EXTRACT ARRAY FROM API RESPONSE
================================================================ */

const extractEnquiries = (
  response: unknown
): BackendEnquiry[] => {
  if (
    Array.isArray(response)
  ) {
    return response as BackendEnquiry[];
  }

  if (
    response &&
    typeof response === 'object'
  ) {
    const object =
      response as Record<
        string,
        unknown
      >;

    if (
      Array.isArray(
        object.data
      )
    ) {
      return object.data as BackendEnquiry[];
    }

    if (
      Array.isArray(
        object.enquiries
      )
    ) {
      return object.enquiries as BackendEnquiry[];
    }

    if (
      Array.isArray(
        object.results
      )
    ) {
      return object.results as BackendEnquiry[];
    }
  }

  return [];
};

/* ================================================================
   GET ENQUIRY ITEMS
================================================================ */

const getEnquiryItems = (
  enquiry: BackendEnquiry
): EnquiryItem[] => {
  const possibleItems = [
    enquiry.items,
    enquiry.products,
    enquiry.orderItems,
  ];

  for (
    const value of possibleItems
  ) {
    if (
      Array.isArray(value)
    ) {
      return value as EnquiryItem[];
    }

    /**
     * PostgreSQL JSON/JSONB can sometimes
     * arrive as a JSON string depending on
     * the database schema.
     */
    if (
      typeof value === 'string'
    ) {
      try {
        const parsed =
          JSON.parse(value);

        if (
          Array.isArray(parsed)
        ) {
          return parsed as EnquiryItem[];
        }
      } catch {
        // Ignore invalid JSON
      }
    }
  }

  return [];
};

/* ================================================================
   CREATE INVOICE FROM ENQUIRY
================================================================ */

const enquiryToInvoice = (
  enquiry: BackendEnquiry,
  index: number
): Invoice => {
  const id =
    enquiry.id ??
    enquiry.enquiryId ??
    index + 1;

  const invoiceNumber =
    safeText(
      enquiry.invoiceNumber ??
        enquiry.invoice_number
    ) ||
    `INV-${safeText(id)}`;

  const customerName =
    safeText(
      enquiry.customerName ??
        enquiry.customer_name ??
        enquiry.name
    ) ||
    'Customer';

  const customerPhone =
    safeText(
      enquiry.customerPhone ??
        enquiry.customer_phone ??
        enquiry.phone ??
        enquiry.mobile
    ) ||
    'Not provided';

  const issueDate =
    enquiry.issueDate ??
    enquiry.issue_date ??
    enquiry.createdAt ??
    enquiry.created_at;

  const status =
    normalizeStatus(
      enquiry.status
    );

  const rawTotal =
    enquiry.total ??
    enquiry.totalAmount ??
    enquiry.total_amount ??
    enquiry.amount;

  const items =
    getEnquiryItems(
      enquiry
    );

  const invoiceItems =
    items.map(
      (
        item,
        itemIndex
      ) => {
        const quantity =
          Math.max(
            safeNumber(
              item.quantity,
              1
            ),
            1
          );

        const unitPrice =
          safeNumber(
            item.unitPrice ??
              item.price,
            0
          );

        const itemTotal =
          safeNumber(
            item.total,
            unitPrice *
              quantity
          );

        const description =
          safeText(
            item.description ??
              item.productName ??
              item.name
          ) ||
          'Item';

        return {
          id:
            item.id ??
            `${id}-${itemIndex}`,

          description,

          quantity,

          unitPrice,

          total: itemTotal,
        };
      }
    );

  let total =
    safeNumber(
      rawTotal,
      0
    );

  /**
   * If the backend doesn't provide
   * a total, calculate it from items.
   */
  if (
    total === 0 &&
    invoiceItems.length > 0
  ) {
    total =
      invoiceItems.reduce(
        (
          sum,
          item
        ) =>
          sum +
          safeNumber(
            item.total,
            0
          ),
        0
      );
  }

  return {
    ...enquiry,

    id: safeText(id),

    invoiceNumber,

    customerName,

    customerPhone,

    issueDate:
      formatDate(
        issueDate
      ),

    status,

    total,

    items:
      invoiceItems,

  } as unknown as Invoice;
};

/* ================================================================
   COMPONENT
================================================================ */

export const AdminInvoicesPanel: React.FC<
  AdminInvoicesPanelProps
> = ({
  onDownloadInvoice,
  onPrintInvoice,
  onDeleteInvoice,
}) => {
  const [
    invoices,
    setInvoices,
  ] = useState<Invoice[]>([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  /* ==============================================================
     FETCH REAL DATABASE DATA
  ============================================================== */

  const fetchInvoices =
    useCallback(
      async (
        showRefreshing = false
      ) => {
        try {
          if (
            showRefreshing
          ) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError('');

          /**
           * IMPORTANT:
           *
           * This now calls:
           *
           * http://172.20.10.2:4004/api/invoice-enquiries
           *
           * instead of:
           *
           * http://172.20.10.2:3000/api/invoice-enquiries
           */
          const url =
            `${API_BASE_URL}/api/enquiries`;

          console.log(
            '📡 Fetching invoice enquiries:',
            url
          );

          const response =
            await fetch(
              url,
              {
                method: 'GET',

                headers: {
                  Accept:
                    'application/json',
                },

                /**
                 * Only needed if your backend
                 * uses cookie authentication.
                 */
                credentials:
                  'include',
              }
            );

          if (
            !response.ok
          ) {
            let serverMessage =
              '';

            try {
              const errorBody =
                await response.json();

              serverMessage =
                safeText(
                  errorBody?.message
                );
            } catch {
              // Response wasn't JSON
            }

            throw new Error(
              serverMessage ||
                `Failed to fetch invoice enquiries (${response.status})`
            );
          }

          const result =
            await response.json();

          console.log(
            '✅ Invoice enquiry API response:',
            result
          );

          const enquiries =
            extractEnquiries(
              result
            );

          console.log(
            `✅ Received ${enquiries.length} enquiries from PostgreSQL`
          );

          /**
           * Only:
           *
           * Paid
           * Preparing
           * Delivered
           */
          const invoiceEnquiries =
            enquiries.filter(
              (
                enquiry
              ) => {
                const status =
                  normalizeStatus(
                    enquiry.status
                  );

                return INVOICE_STATUSES.includes(
                  status as
                    (typeof INVOICE_STATUSES)[number]
                );
              }
            );

          console.log(
            `🧾 ${invoiceEnquiries.length} enquiries qualify as invoices`
          );

          const mappedInvoices =
            invoiceEnquiries.map(
              (
                enquiry,
                index
              ) =>
                enquiryToInvoice(
                  enquiry,
                  index
                )
            );

          /**
           * Newest records first.
           *
           * The backend already orders by
           * created_at DESC, but we keep
           * this client-side safety sorting.
           */
          mappedInvoices.sort(
            (
              a,
              b
            ) => {
              const dateA =
                new Date(
                  safeText(
                    a.issueDate
                  )
                ).getTime();

              const dateB =
                new Date(
                  safeText(
                    b.issueDate
                  )
                ).getTime();

              if (
                Number.isNaN(
                  dateA
                ) ||
                Number.isNaN(
                  dateB
                )
              ) {
                return 0;
              }

              return (
                dateB -
                dateA
              );
            }
          );

          setInvoices(
            mappedInvoices
          );

        } catch (
          err
        ) {
          console.error(
            '❌ Failed to fetch invoice enquiries:',
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load invoices.'
          );

          setInvoices([]);

        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /* ==============================================================
     INITIAL FETCH
  ============================================================== */

  useEffect(() => {
    fetchInvoices();
  }, [
    fetchInvoices,
  ]);

  /* ==============================================================
     SEARCH
  ============================================================== */

  const filteredInvoices =
    useMemo(
      () => {
        const term =
          searchTerm
            .trim()
            .toLowerCase();

        if (!term) {
          return invoices;
        }

        return invoices.filter(
          (
            invoice
          ) => {
            const invoiceNumber =
              searchableText(
                invoice?.invoiceNumber
              );

            const customerName =
              searchableText(
                invoice?.customerName
              );

            const customerPhone =
              searchableText(
                invoice?.customerPhone
              );

            const status =
              searchableText(
                invoice?.status
              );

            return (
              invoiceNumber.includes(
                term
              ) ||
              customerName.includes(
                term
              ) ||
              customerPhone.includes(
                term
              ) ||
              status.includes(
                term
              )
            );
          }
        );
      },
      [
        invoices,
        searchTerm,
      ]
    );

  const clearSearch =
    () => {
      setSearchTerm('');
    };

  /* ==============================================================
     PRINT
  ============================================================== */

  const handlePrint = (
    invoice: Invoice
  ) => {
    if (
      onPrintInvoice
    ) {
      onPrintInvoice(
        invoice
      );
      return;
    }

    window.print();
  };

  /* ==============================================================
     STATUS STYLE
  ============================================================== */

  const getStatusClasses =
    (
      status: string
    ) => {
      switch (
        normalizeStatus(
          status
        )
      ) {
        case 'paid':
          return 'bg-emerald-100 text-emerald-800 border-emerald-200';

        case 'preparing':
          return 'bg-amber-100 text-amber-800 border-amber-200';

        case 'delivered':
          return 'bg-blue-100 text-blue-800 border-blue-200';

        default:
          return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

  /* ==============================================================
     LOADING
  ============================================================== */

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="font-serif font-bold text-lg text-[#241B20]">
              Invoices
            </h3>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Loading invoice data...
            </p>
          </div>

        </div>

        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-12 text-center">

          <Loader2 className="w-8 h-8 mx-auto text-[#9E315A] animate-spin" />

          <p className="text-sm font-semibold text-[#5A4550] mt-4">
            Fetching enquiries from database...
          </p>

        </div>

      </div>
    );
  }

  /* ==============================================================
     MAIN UI
  ============================================================== */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#241B20]">
            Invoices
          </h3>

          <p className="text-xs sm:text-sm text-[#8C5D6C] mt-1">
            Paid, preparing and delivered orders
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchInvoices(true)
          }
          disabled={
            refreshing
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white border border-rose-100 text-[#9E315A] hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              refreshing
                ? 'animate-spin'
                : ''
            }`}
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">

          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />

          <div className="flex-1">

            <p className="text-sm font-bold text-red-800">
              Failed to load invoices
            </p>

            <p className="text-xs text-red-700 mt-1">
              {safeText(error)}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              fetchInvoices()
            }
            className="text-xs font-bold text-red-700 hover:text-red-900 cursor-pointer"
          >
            Retry
          </button>

        </div>
      )}

      {/* SEARCH */}

      <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-rose-100 shadow-sm">

        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#9E315A] shrink-0" />

        <input
          type="text"
          placeholder="Search by invoice number, customer name, phone or status..."
          value={
            searchTerm
          }
          onChange={(
            event
          ) =>
            setSearchTerm(
              event.target.value
            )
          }
          className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#241B20] placeholder:text-[#B99AA6] w-full"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={
              clearSearch
            }
            className="p-1.5 rounded-full text-[#8C5D6C] hover:text-[#9E315A] hover:bg-rose-50 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

      </div>

      {/* RESULT COUNT */}

      <div className="flex items-center justify-between px-1">

        <div className="flex items-center gap-2">

          <FileText className="w-4 h-4 text-[#9E315A]" />

          <span className="text-xs sm:text-sm font-semibold text-[#5A4550]">
            {searchTerm
              ? `${filteredInvoices.length} result${
                  filteredInvoices.length !==
                  1
                    ? 's'
                    : ''
                } found`
              : `${invoices.length} invoice${
                  invoices.length !==
                  1
                    ? 's'
                    : ''
                }`}
          </span>

        </div>

        {searchTerm && (
          <button
            type="button"
            onClick={
              clearSearch
            }
            className="text-[11px] sm:text-xs font-semibold text-[#9E315A] hover:text-[#832247] cursor-pointer"
          >
            Clear search
          </button>
        )}

      </div>

      {/* NO INVOICES */}

      {invoices.length === 0 && (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-10 sm:p-14 text-center">

          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center">

            <FileText className="w-7 h-7 text-[#9E315A]" />

          </div>

          <h3 className="font-serif font-bold text-lg text-[#241B20]">
            No invoices yet
          </h3>

          <p className="text-xs sm:text-sm text-[#8C5D6C] mt-1 max-w-sm mx-auto">
            Invoices will appear here when
            an enquiry reaches Paid,
            Preparing or Delivered status.
          </p>

          <button
            type="button"
            onClick={() =>
              fetchInvoices(true)
            }
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#9E315A] hover:bg-[#832247] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

        </div>
      )}

      {/* NO SEARCH RESULTS */}

      {invoices.length > 0 &&
        filteredInvoices.length ===
          0 && (
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-10 sm:p-14 text-center">

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center">

              <Search className="w-7 h-7 text-[#9E315A]" />

            </div>

            <h3 className="font-serif font-bold text-lg text-[#241B20]">
              No invoices found
            </h3>

            <p className="text-xs sm:text-sm text-[#8C5D6C] mt-1">

              No invoice matches{' '}

              <span className="font-semibold text-[#241B20]">
                "{safeText(
                  searchTerm
                )}"
              </span>
              .

            </p>

            <button
              type="button"
              onClick={
                clearSearch
              }
              className="mt-4 px-4 py-2 rounded-full bg-[#9E315A] hover:bg-[#832247] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Search
            </button>

          </div>
        )}

      {/* INVOICE CARDS */}

      {filteredInvoices.length >
        0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">

          {filteredInvoices.map(
            (
              invoice,
              invoiceIndex
            ) => {

              const invoiceNumber =
                safeText(
                  invoice?.invoiceNumber,
                  `INV-${invoiceIndex + 1}`
                );

              const customerName =
                safeText(
                  invoice?.customerName,
                  'Customer'
                );

              const customerPhone =
                safeText(
                  invoice?.customerPhone,
                  'Not provided'
                );

              const issueDate =
                safeText(
                  invoice?.issueDate,
                  'Not available'
                );

              const status =
                normalizeStatus(
                  invoice?.status
                );

              const total =
                safeNumber(
                  invoice?.total,
                  0
                );

              const items =
                Array.isArray(
                  invoice?.items
                )
                  ? invoice.items
                  : [];

              return (
                <article
                  key={
                    safeText(
                      invoice?.id
                    ) ||
                    `${invoiceNumber}-${invoiceIndex}`
                  }
                  className="group bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-200 overflow-hidden"
                >

                  {/* CARD CONTENT */}

                  <div className="p-5 sm:p-6">

                    {/* HEADER */}

                    <div className="flex items-start justify-between gap-3 mb-3">

                      <span className="inline-flex items-center font-mono font-bold text-[11px] sm:text-xs text-[#9E315A] bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
                        {invoiceNumber}
                      </span>

                      <span
                        className={`shrink-0 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${getStatusClasses(
                          status
                        )}`}
                      >
                        {status}
                      </span>

                    </div>

                    {/* CUSTOMER */}

                    <div className="mb-4">

                      <h4 className="font-serif font-bold text-base sm:text-lg text-[#241B20] truncate">
                        {customerName}
                      </h4>

                      <p className="text-[11px] sm:text-xs text-[#8C5D6C] mt-1">

                        <span>
                          Date:{' '}
                          {issueDate}
                        </span>

                        <span className="mx-1.5">
                          •
                        </span>

                        <span>
                          Phone:{' '}
                          {customerPhone}
                        </span>

                      </p>

                    </div>

                    {/* ITEMS */}

                    <div className="bg-[#FFF8FA] p-3.5 sm:p-4 rounded-2xl text-xs space-y-2 mb-4 border border-rose-100">

                      {items.length >
                      0 ? (
                        items.map(
                          (
                            item,
                            itemIndex
                          ) => {

                            const quantity =
                              safeNumber(
                                item?.quantity,
                                1
                              );

                            const description =
                              safeText(
                                item?.description,
                                'Item'
                              );

                            const unitPrice =
                              safeNumber(
                                item?.unitPrice,
                                0
                              );

                            const itemTotal =
                              safeNumber(
                                item?.total,
                                unitPrice *
                                  quantity
                              );

                            return (
                              <div
                                key={`${invoiceNumber}-item-${itemIndex}`}
                                className="flex items-start justify-between gap-3"
                              >

                                <span className="text-[#5A4550] leading-relaxed">

                                  <span className="font-semibold text-[#241B20]">
                                    {quantity}x
                                  </span>{' '}

                                  {description}

                                </span>

                                <span className="font-bold text-[#9E315A] whitespace-nowrap">
                                  £
                                  {itemTotal.toFixed(
                                    2
                                  )}
                                </span>

                              </div>
                            );
                          }
                        )
                      ) : (
                        <p className="text-[#8C5D6C] italic">
                          No item details available.
                        </p>
                      )}

                    </div>

                    {/* TOTAL */}

                    <div className="flex items-end justify-between pt-3 border-t border-rose-100">

                      <span className="text-xs font-semibold text-[#5A4550]">
                        Total Billed
                      </span>

                      <span className="font-serif font-bold text-xl sm:text-2xl text-[#9E315A]">
                        £
                        {total.toFixed(
                          2
                        )}
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="px-5 sm:px-6 py-4 bg-[#FFFDFE] border-t border-rose-100">

                    <div className="flex items-center justify-between gap-3">

                      {/* DOWNLOAD */}

                      <button
                        type="button"
                        onClick={() =>
                          onDownloadInvoice(
                            invoice
                          )
                        }
                        className="flex items-center justify-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] active:scale-[0.98] text-white px-4 py-2.5 rounded-full text-[11px] sm:text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >

                        <Download className="w-3.5 h-3.5" />

                        <span>
                          Download PDF
                        </span>

                      </button>

                      {/* SECONDARY ACTIONS */}

                      <div className="flex items-center gap-1.5">

                        {/* PRINT */}

                        <button
                          type="button"
                          onClick={() =>
                            handlePrint(
                              invoice
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] sm:text-xs font-semibold text-[#8C5D6C] hover:text-[#241B20] hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Print invoice"
                        >

                          <Printer className="w-3.5 h-3.5" />

                          <span className="hidden sm:inline">
                            Print
                          </span>

                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            onDeleteInvoice(
                              invoice
                            )
                          }
                          className="p-2 text-rose-300 hover:text-red-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                          title="Delete Invoice"
                          aria-label={`Delete invoice ${invoiceNumber}`}
                        >

                          <Trash2 className="w-3.5 h-3.5" />

                        </button>

                      </div>

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>
      )}

    </div>
  );
};

export default AdminInvoicesPanel;