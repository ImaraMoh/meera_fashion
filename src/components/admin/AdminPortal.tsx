import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Store,
  Plus,
  Save,
  Check,
} from 'lucide-react';

import {
  Product,
  BrandSettings,
  EnquiryOrder,
  Invoice,
  StockStatus,
} from '../../types';

import { AdminSidebar } from './AdminSidebar';
import logo from '../../assets/logo.png';
import {
  ADMIN_TABS,
  getAdminTab,
  type AdminTabId,
} from './adminNavigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ============================================================
// SECTIONS
// ============================================================

import { DashboardOverview } from './sections/DashboardOverview';
import { ProductsPanel } from './sections/ProductsPanel';
import { WhatsAppLeadsPanel } from './sections/WhatsAppLeadsPanel';
import { SalesHistoryPanel } from './sections/SalesHistoryPanel';
import { AdminInvoicesPanel } from './sections/AdminInvoicesPanel';
import { ReportsPanel } from './sections/ReportsPanel';
import { SettingsPanel } from './sections/SettingsPanel';

// ============================================================
// MODALS
// ============================================================

import { ProductFormModal } from './modals/ProductFormModal';

import {
  CancellationReasonModal,
} from './modals/CancellationReasonModal';

import {
  OrderDetailsModal,
} from './modals/OrderDetailsModal';

import {
  ConfirmationModal,
  type ConfirmationModalConfig,
} from './modals/ConfirmationModal';

import {
  ToastNotification,
} from './modals/ToastNotification';

// ============================================================
// TYPES
// ============================================================

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;

  products: Product[];
  onSaveProducts: (products: Product[]) => void;

  enquiries: EnquiryOrder[];
  onSaveEnquiries: (enquiries: EnquiryOrder[]) => void | Promise<void>;

  invoices: Invoice[];
  onSaveInvoices: (invoices: Invoice[]) => void | Promise<void>;

  settings: BrandSettings;
  onSaveSettings: (settings: BrandSettings) => void;
}

// ============================================================
// LOCAL MODAL TYPES
// ============================================================

interface CancellationModalState {
  isOpen: boolean;
  enquiry: EnquiryOrder | null;
  reason: string;
}

interface ToastNotificationState {
  show: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,

  products,
  onSaveProducts,

  enquiries,
  onSaveEnquiries,

  invoices,
  onSaveInvoices,

  settings,
  onSaveSettings,
}) => {

  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://172.20.10.2:4004';
  // ============================================================
  // NAVIGATION
  // ============================================================

  const [activeTab, setActiveTab] =
    useState<AdminTabId>('dashboard');

  const activeTabDetails =
    getAdminTab(activeTab);

  // ============================================================
  // CONFIRMATION MODAL
  // ============================================================

  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalConfig | null>(null);

  // ============================================================
  // CANCELLATION MODAL
  // ============================================================

  const [cancellationModal, setCancellationModal] =
    useState<CancellationModalState | null>(null);

  // ============================================================
  // ORDER DETAILS MODAL
  // ============================================================

  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<EnquiryOrder | null>(null);

  // ============================================================
  // TOAST
  // ============================================================

  const [toastNotification, setToastNotification] =
    useState<ToastNotificationState | null>(null);

  // ============================================================
  // SETTINGS
  // ============================================================

  const [localSettings, setLocalSettings] =
    useState<BrandSettings>({
      ...settings,
    });

  const [settingsSavedFeedback, setSettingsSavedFeedback] =
    useState(false);

  useEffect(() => {
    setLocalSettings({
      ...settings,
    });
  }, [settings]);

  // ============================================================
  // PRODUCT FORM STATE
  // ============================================================

  const [isEditingProduct, setIsEditingProduct] =
    useState(false);

  const [currentEditProduct, setCurrentEditProduct] =
    useState<Partial<Product> | null>(null);

  // ============================================================
  // PRODUCT FILTERS
  // ============================================================

  const [productSearch, setProductSearch] =
    useState('');

  const [productCategoryFilter, setProductCategoryFilter] =
    useState('all');

  const [productStockFilter, setProductStockFilter] =
    useState('all');

  const [adminProductPage, setAdminProductPage] =
    useState(1);

  const adminProductsPerPage = 10;

  // ============================================================
  // SALES HISTORY FILTERS
  // ============================================================

  const [salesHistorySearch, setSalesHistorySearch] =
    useState('');

  const [salesHistoryStatusFilter, setSalesHistoryStatusFilter] =
    useState<
      | 'all'
      | 'Paid'
      | 'Delivered'
      | 'in_progress'
      | 'Cancelled'
    >('all');

  const [salesHistoryPage, setSalesHistoryPage] =
    useState(1);

  const salesHistoryPerPage = 10;
  const escapeHtml = (value: string): string => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean;
    enquiry: EnquiryOrder | null;
    newStatus: EnquiryOrder['status'] | null;
  }>({
    isOpen: false,
    enquiry: null,
    newStatus: null,
  });

  // ============================================================
  // REFS
  // ============================================================

  const logoInputRef =
    useRef<HTMLInputElement>(null);

  // ============================================================
  // TOAST HANDLER
  // ============================================================

  const showToast = (
    title: string,
    message: string,
    actionLabel?: string,
    onAction?: () => void
  ) => {
    setToastNotification({
      show: true,
      title,
      message,
      actionLabel,
      onAction,
    });

    window.setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  const handleCloseToast = () => {
    setToastNotification(null);
  };

  // ============================================================
  // WHATSAPP HANDLER
  // ============================================================

  const handleWhatsApp = (
    phone: string,
    message: string
  ) => {
    const cleanPhone = phone.replace(
      /[^\d+]/g,
      ''
    );

    const whatsappUrl =
      `https://wa.me/${cleanPhone.replace(
        '+',
        ''
      )}?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // ============================================================
  // PRODUCT HANDLERS
  // ============================================================

  const handleOpenAddProduct = () => {
    setCurrentEditProduct({
      name: '',
      slug: '',
      price: 0,
      category: 'sarees',
      stockStatus: 'In Stock' as StockStatus,
      images: {
        main: '',
      },
    });

    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (
    product: Product
  ) => {
    setCurrentEditProduct({
      ...product,
    });

    setIsEditingProduct(true);
  };

  const handleCloseProductModal = () => {
    setIsEditingProduct(false);
    setCurrentEditProduct(null);
  };

  const handleProductChange = (
    updatedProduct: Partial<Product>
  ) => {
    setCurrentEditProduct(
      updatedProduct
    );
  };

  const handleSaveProductForm = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!currentEditProduct) {
      return;
    }

    const productName =
      String(
        currentEditProduct.name || ''
      ).trim();

    if (!productName) {
      showToast(
        'Product Name Required',
        'Please enter a product name.'
      );

      return;
    }

    if (!currentEditProduct.images?.main) {
      showToast(
        'Main Photo Required',
        'Please upload a main product photo before saving.'
      );

      return;
    }

    const existingProduct =
      currentEditProduct.id
        ? products.find(
            (product) =>
              product.id === currentEditProduct.id
          )
        : undefined;

    const now = new Date().toISOString();

    const productToSave: Product = {
      ...(existingProduct || {}),
      ...currentEditProduct,

      id:
        currentEditProduct.id ||
        `prod-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      name: productName,

      slug:
        currentEditProduct.slug ||
        existingProduct?.slug ||
        productName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),

      category:
        currentEditProduct.category ||
        existingProduct?.category ||
        'sarees',

      stockStatus:
        currentEditProduct.stockStatus ||
        existingProduct?.stockStatus ||
        'In Stock',

      createdAt:
        typeof existingProduct?.createdAt === 'string'
          ? existingProduct.createdAt
          : now,

      updatedAt: now,
    };

    const productExists =
      products.some(
        (product) =>
          product.id === productToSave.id
      );

    const updatedProducts =
      productExists
        ? products.map(
            (product) =>
              product.id === productToSave.id
                ? productToSave
                : product
          )
        : [
            ...products,
            productToSave,
          ];

    onSaveProducts(
      updatedProducts
    );

    showToast(
      productExists
        ? 'Product Updated'
        : 'Product Added',

      productExists
        ? `${productToSave.name} has been updated successfully.`
        : `${productToSave.name} has been added successfully.`
    );

    handleCloseProductModal();
  };

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const handleDeleteProduct = (
    product: Product
  ) => {
    if (!product) {
      return;
    }

    setConfirmationModal({
      isOpen: true,

      title: 'Delete Product',

      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,

      confirmLabel: 'Delete Product',

      cancelLabel: 'Cancel',

      isDestructive: true,

      onConfirm: () => {
        const updatedProducts =
          products.filter(
            (item) =>
              item.id !== product.id
          );

        onSaveProducts(
          updatedProducts
        );

        setConfirmationModal(null);

        showToast(
          'Product Deleted',
          `${product.name} has been removed from the catalogue.`
        );
      },
    });
  };

  // ============================================================
  // QUICK STOCK STATUS
  // ============================================================

  const handleQuickStockStatusChange = (
    productId: string,
    status: StockStatus
  ) => {
    const product =
      products.find(
        (item) =>
          item.id === productId
      );

    if (!product) {
      return;
    }

    const updatedProducts =
      products.map(
        (item) =>
          item.id === productId
            ? {
                ...item,
                stockStatus: status,
              }
            : item
      );

    onSaveProducts(
      updatedProducts
    );

    showToast(
      'Stock Updated',
      `${product.name} stock status changed to ${status}.`
    );
  };

  // ============================================================
  // ENQUIRY STATUS TRIGGER
  // ============================================================

  const handleRequestEnquiryStatusChange = (
    enquiry: EnquiryOrder,
    newStatus: EnquiryOrder['status']
  ) => {
    // Same status → nothing to update
    if (enquiry.status === newStatus) {
      return;
    }

    // Cancelled → open cancellation modal
    if (newStatus === 'Cancelled') {
      setCancellationModal({
        isOpen: true,
        enquiry,
        reason: '',
      });
      return;
    }

    // All other statuses → open confirmation modal
    setStatusConfirmation({
      isOpen: true,
      enquiry,
      newStatus,
    });
  };

  // ============================================================
  // CONFIRM STATUS CHANGE & UPDATE DATABASE
  // ============================================================

  const handleConfirmEnquiryStatusChange = async () => {
    const enquiry = statusConfirmation.enquiry;
    const newStatus = statusConfirmation.newStatus;

    if (!enquiry || !newStatus) {
      return;
    }

    // Close confirmation modal
    setStatusConfirmation({
      isOpen: false,
      enquiry: null,
      newStatus: null,
    });

    try {
      /* =====================================================
        1. UPDATE STATUS IN DATABASE
      ===================================================== */

      const response = await fetch(
        `${API_BASE_URL}/api/enquiries/${enquiry.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || 'Failed to update enquiry status.'
        );
      }

      /*
      * This comes directly from Neon/PostgreSQL.
      *
      * Backend returns:
      * status
      * statusUpdatedAt
      * createdAt
      * etc.
      */
      const savedEnquiry: EnquiryOrder = data.enquiry;

      const updatedEnquiry: EnquiryOrder = {
        ...enquiry,
        ...savedEnquiry,

        status: newStatus,

        statusUpdatedAt:
          savedEnquiry.statusUpdatedAt ||
          new Date().toISOString(),

        cancelledAt:
          typeof savedEnquiry.cancelledAt === 'string'
            ? savedEnquiry.cancelledAt
            : undefined,

        createdAt: enquiry.createdAt,
      };

      /* =====================================================
        2. UPDATE PARENT / LOCAL DATA
      ===================================================== */

      const updatedEnquiries = enquiries.map((item) =>
        item.id === enquiry.id
          ? updatedEnquiry
          : item
      );

      /*
      * IMPORTANT:
      *
      * We do NOT call setEnquiries()
      * because AdminPortal doesn't have that state setter.
      *
      * onSaveEnquiries() should update the parent state
      * and/or persist the complete enquiry list.
      */
      await onSaveEnquiries(updatedEnquiries);

      /* =====================================================
        3. CREATE / UPDATE INVOICE
        Only Paid / Delivered
      ===================================================== */

      if (
        newStatus === 'Paid' ||
        newStatus === 'Delivered'
      ) {
        const invoiceNumber =
          `INV-${enquiry.orderNumber || enquiry.id}`;

        const invoiceItems: Invoice['items'] =
          (enquiry.items || []).map((item) => {
            const quantity =
              Number(item?.quantity) || 1;

            const unitPrice =
              Number(item?.price) || 0;

            return {
              description:
                typeof item?.productName === 'string'
                  ? item.productName
                  : 'Product',

              quantity,

              unitPrice,

              total:
                unitPrice * quantity,

              variant:
                typeof item?.size === 'string'
                  ? item.size
                  : undefined,
            };
          });

        /* ===================================================
          FIND EXISTING INVOICE
        =================================================== */

        const existingInvoiceIndex =
          invoices.findIndex(
            (invoice) =>
              invoice.enquiryId === enquiry.id ||
              invoice.invoiceNumber === invoiceNumber
          );

        let updatedInvoices: Invoice[];

        /* ===================================================
          UPDATE EXISTING INVOICE
        =================================================== */

        if (existingInvoiceIndex !== -1) {
          updatedInvoices = invoices.map(
            (invoice, index) => {
              if (index !== existingInvoiceIndex) {
                return invoice;
              }

              return {
                ...invoice,

                enquiryId: enquiry.id,

                invoiceNumber,

                customerName:
                  enquiry.customerName ||
                  invoice.customerName,

                customerPhone:
                  enquiry.customerPhone ||
                  invoice.customerPhone,

                customerEmail:
                  enquiry.customerEmail ||
                  invoice.customerEmail,

                items:
                  invoiceItems.length > 0
                    ? invoiceItems
                    : invoice.items,

                subtotal:
                  Number(
                    enquiry.subtotal ??
                    enquiry.total
                  ) || invoice.subtotal,

                discount:
                  Number(
                    enquiry.discount ?? 0
                  ),

                shipping:
                  Number(
                    invoice.shipping ?? 0
                  ),

                total:
                  Number(enquiry.total) ||
                  invoice.total,

                status:
                  newStatus === 'Delivered'
                    ? 'Delivered'
                    : 'Paid',

                /*
                * Keep invoice status date
                * synchronized with enquiry status.
                */
                statusUpdatedAt:
                  updatedEnquiry.statusUpdatedAt,

                issueDate:
                  invoice.issueDate ||
                  enquiry.createdAt ||
                  new Date().toISOString(),

                dueDate:
                  invoice.dueDate ||
                  new Date().toISOString(),

                paymentMethod:
                  invoice.paymentMethod,

                createdAt:
                  invoice.createdAt ||
                  new Date().toISOString(),
              };
            }
          );
        }

        /* ===================================================
          CREATE NEW INVOICE
        =================================================== */

        else {
          const now =
            new Date().toISOString();

          const newInvoice: Invoice = {
            id:
              `INV-${Date.now()}-${enquiry.id}`,

            enquiryId:
              enquiry.id,

            invoiceNumber,

            customerName:
              enquiry.customerName ||
              'Customer',

            customerPhone:
              enquiry.customerPhone ||
              '',

            customerEmail:
              enquiry.customerEmail ||
              undefined,

            items:
              invoiceItems,

            subtotal:
              Number(
                enquiry.subtotal ??
                enquiry.total
              ) || 0,

            discount:
              Number(
                enquiry.discount ?? 0
              ) || 0,

            notes:
              typeof enquiry.notes === 'string'
                ? enquiry.notes
                : undefined,

            shipping: 0,

            total:
              Number(enquiry.total) || 0,

            status:
              newStatus === 'Delivered'
                ? 'Delivered'
                : 'Paid',

            /*
            * Store the same timestamp
            * as the enquiry status update.
            */
            statusUpdatedAt:
              updatedEnquiry.statusUpdatedAt,

            issueDate:
              enquiry.createdAt || now,

            dueDate:
              now,

            paymentMethod:
              undefined,

            createdAt:
              now,
          };

          updatedInvoices = [
            ...invoices,
            newInvoice,
          ];
        }

        /* ===================================================
          4. SAVE INVOICE
        =================================================== */

        try {
          await onSaveInvoices(
            updatedInvoices
          );
        } catch (error) {
          console.error(
            '❌ Failed to save invoice:',
            error
          );

          showToast(
            'Invoice Save Failed',
            'The order status was saved, but the invoice could not be saved.'
          );

          return;
        }
      }

      /* =====================================================
        5. SUCCESS
      ===================================================== */

      showToast(
        'Status Updated',
        `Order ${
          enquiry.orderNumber || enquiry.id
        } status changed to ${newStatus}${
          newStatus === 'Paid' ||
          newStatus === 'Delivered'
            ? ' and invoice updated.'
            : '.'
        }`
      );
    } catch (error) {
      console.error(
        '❌ Failed to update enquiry status:',
        error
      );

      showToast(
        'Update Failed',
        error instanceof Error
          ? error.message
          : 'The order status could not be saved to the database.'
      );
    }
  };

  // ============================================================
  // CANCELLATION REASON CHANGE
  // ============================================================

  const handleCancellationReasonChange = (
    reason: string
  ) => {
    setCancellationModal(
      (previous) =>
        previous
          ? {
              ...previous,
              reason,
            }
          : previous
    );
  };

  // ============================================================
  // CANCEL CANCELLATION MODAL
  // ============================================================

  const handleCloseCancellationModal = () => {
    setCancellationModal(null);
  };

  // ============================================================
  // CONFIRM CANCELLATION
  // ============================================================

  const handleConfirmCancellation = () => {
    if (
      !cancellationModal?.enquiry
    ) {
      return;
    }

    const enquiry =
      cancellationModal.enquiry;

    const cancellationReason =
      cancellationModal.reason.trim() ||
      'Cancelled by administrator';

    const updatedEnquiries =
      enquiries.map(
        (item): EnquiryOrder =>
          item.id === enquiry.id
            ? {
                ...item,
                status: 'Cancelled',
                cancelReason:
                  cancellationReason,
                cancelledAt:
                  new Date().toISOString(),
              }
            : item
      );

    onSaveEnquiries(
      updatedEnquiries
    );

    setCancellationModal(null);

    showToast(
      'Order Cancelled',
      `Order ${enquiry.orderNumber || enquiry.id} has been cancelled successfully.`
    );
  };

  // ============================================================
  // DELETE ENQUIRY
  // ============================================================

  const handleDeleteEnquiry = (
    enquiry: EnquiryOrder
  ) => {
    if (!enquiry) {
      return;
    }

    setConfirmationModal({
      isOpen: true,

      title: 'Delete Enquiry',

      message: `Are you sure you want to permanently delete order ${enquiry.orderNumber || enquiry.id}?`,

      confirmLabel: 'Delete',

      cancelLabel: 'Cancel',

      isDestructive: true,

      onConfirm: () => {
        const updatedEnquiries =
          enquiries.filter(
            (item) =>
              item.id !== enquiry.id
          );

        onSaveEnquiries(
          updatedEnquiries
        );

        setConfirmationModal(null);

        showToast(
          'Enquiry Deleted',
          `Order ${enquiry.orderNumber || enquiry.id} has been removed.`
        );
      },
    });
  };

  // ============================================================
  // DELETE INVOICE
  // ============================================================

  const handleDeleteInvoice = (
    invoice: Invoice
  ) => {
    if (!invoice) {
      return;
    }

    setConfirmationModal({
      isOpen: true,

      title: 'Delete Invoice',

      message: `Are you sure you want to delete invoice ${invoice.id}?`,

      confirmLabel: 'Delete Invoice',

      cancelLabel: 'Cancel',

      isDestructive: true,

      onConfirm: () => {
        const updatedInvoices =
          invoices.filter(
            (item) =>
              item.id !== invoice.id
          );

        onSaveInvoices(
          updatedInvoices
        );

        setConfirmationModal(null);

        showToast(
          'Invoice Deleted',
          'The invoice has been removed successfully.'
        );
      },
    });
  };

  // ============================================================
  // ORDER INVOICE PDF
  // ============================================================

  const handleDownloadOrderInvoicePdf = (
    enquiry: EnquiryOrder
  ) => {
    try {
      const invoiceWindow = window.open(
        '',
        '_blank'
      );

      if (!invoiceWindow) {
        showToast(
          'Popup Blocked',
          'Please allow popups to generate the invoice.'
        );

        return;
      }

      /* =======================================================
        RAW ENQUIRY DATA

        Support both frontend camelCase and
        PostgreSQL snake_case fields.

        IMPORTANT:
        We do NOT create or replace these dates.
      ======================================================= */

      const rawEnquiry = enquiry as EnquiryOrder & {
        created_at?: string | null;
        status_updated_at?: string | null;
      };

      const rawCreatedAt =
        rawEnquiry.createdAt ??
        rawEnquiry.created_at ??
        null;

      const rawStatusUpdatedAt =
        rawEnquiry.statusUpdatedAt ??
        rawEnquiry.status_updated_at ??
        null;

      console.log(
        '=========================================='
      );

      console.log(
        '📄 INVOICE PDF DATE DEBUG'
      );

      console.log({
        enquiryId: rawEnquiry.id,

        createdAt:
          rawEnquiry.createdAt,

        created_at:
          rawEnquiry.created_at,

        statusUpdatedAt:
          rawEnquiry.statusUpdatedAt,

        status_updated_at:
          rawEnquiry.status_updated_at,

        finalCreatedAt:
          rawCreatedAt,

        finalStatusUpdatedAt:
          rawStatusUpdatedAt,
      });

      console.log(
        '=========================================='
      );

      /* =======================================================
        DATE PARSER

        Handles:
        - ISO strings
        - PostgreSQL timestamp strings
        - numeric timestamps
        - Date objects
      ======================================================= */

      const parseDatabaseDate = (
        value: unknown
      ): Date | null => {
        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          return null;
        }

        /*
        * Already a JavaScript Date
        */
        if (value instanceof Date) {
          return Number.isNaN(value.getTime())
            ? null
            : value;
        }

        /*
        * Timestamp number
        */
        if (typeof value === 'number') {
          const date = new Date(value);

          return Number.isNaN(date.getTime())
            ? null
            : date;
        }

        /*
        * Normal string timestamp
        */
        if (typeof value === 'string') {
          const trimmed = value.trim();

          if (!trimmed) {
            return null;
          }

          /*
          * PostgreSQL:
          * 2026-09-01 12:30:45
          *
          * JavaScript:
          * 2026-09-01T12:30:45
          */
          const normalized =
            trimmed.includes(' ') &&
            !trimmed.includes('T')
              ? trimmed.replace(' ', 'T')
              : trimmed;

          const date = new Date(normalized);

          if (!Number.isNaN(date.getTime())) {
            return date;
          }

          return null;
        }

        /*
        * Date-like object
        *
        * This is important for your current response:
        *
        * createdAt: { ... }
        * statusUpdatedAt: { ... }
        */

        if (
          typeof value === 'object'
        ) {
          const objectValue =
            value as Record<string, unknown>;

          /*
          * Possible shapes:
          *
          * { value: "2026-09-01..." }
          * { date: "2026-09-01..." }
          * { createdAt: "2026-09-01..." }
          * { timestamp: "2026-09-01..." }
          */

          const nestedValue =
            objectValue.value ??
            objectValue.date ??
            objectValue.timestamp ??
            objectValue.createdAt ??
            objectValue.created_at;

          if (
            nestedValue !== undefined &&
            nestedValue !== value
          ) {
            return parseDatabaseDate(
              nestedValue
            );
          }

          /*
          * Try JSON serialization as a final fallback.
          */

          try {
            const jsonValue =
              JSON.stringify(value);

            if (jsonValue) {
              /*
              * Extract an ISO date from the object
              */
              const isoMatch =
                jsonValue.match(
                  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?/
                );

              if (isoMatch?.[0]) {
                const date =
                  new Date(isoMatch[0]);

                if (
                  !Number.isNaN(
                    date.getTime()
                  )
                ) {
                  return date;
                }
              }

              /*
              * PostgreSQL timestamp without timezone
              */
              const postgresMatch =
                jsonValue.match(
                  /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?/
                );

              if (postgresMatch?.[0]) {
                const date =
                  new Date(
                    postgresMatch[0].replace(
                      ' ',
                      'T'
                    )
                  );

                if (
                  !Number.isNaN(
                    date.getTime()
                  )
                ) {
                  return date;
                }
              }
            }
          } catch {
            // Ignore parsing failure
          }
        }

        return null;
      };

      /* =======================================================
        ORDER CREATED DATE

        SOURCE:
        enquiries.created_at

        Frontend:
        enquiry.createdAt

        NEVER use current date as fallback.
      ======================================================= */

      const createdDate =
        parseDatabaseDate(
          rawCreatedAt
        );

      console.log(
        '📅 FINAL PDF ORDER DATE:',
        createdDate
      );

      const formattedDate =
        createdDate
          ? createdDate.toLocaleDateString(
              'en-GB',
              {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }
            )
          : '-';

      const formattedTime =
        createdDate
          ? createdDate.toLocaleTimeString(
              'en-GB',
              {
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '-';

      /* =======================================================
        STATUS UPDATED DATE

        SOURCE:
        enquiries.status_updated_at

        Frontend:
        enquiry.statusUpdatedAt

        NEVER fallback to createdDate.
      ======================================================= */

      const statusUpdatedDate =
        parseDatabaseDate(
          rawStatusUpdatedAt
        );

      console.log(
        '🔄 FINAL PDF STATUS UPDATED DATE:',
        statusUpdatedDate
      );

      const formattedStatusUpdatedDate =
        statusUpdatedDate
          ? statusUpdatedDate.toLocaleDateString(
              'en-GB',
              {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }
            )
          : '-';

      const formattedStatusUpdatedTime =
        statusUpdatedDate
          ? statusUpdatedDate.toLocaleTimeString(
              'en-GB',
              {
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '-';

      /* =======================================================
        BRAND
      ======================================================= */

      const brandName =
        settings.brandName ||
        "Meera's Fashion";

      const brandLogo = logo;

      const brandPhone =
        (settings as BrandSettings & {
          phone?: string;
          contactPhone?: string;
        }).phone ||
        (settings as BrandSettings & {
          phone?: string;
          contactPhone?: string;
        }).contactPhone ||
        '';

      const brandEmail =
        (settings as BrandSettings & {
          email?: string;
          contactEmail?: string;
        }).email ||
        (settings as BrandSettings & {
          email?: string;
          contactEmail?: string;
        }).contactEmail ||
        '';

      const brandAddress =
        (settings as BrandSettings & {
          address?: string;
        }).address ||
        '';

      /* =======================================================
        ESCAPE HTML
      ======================================================= */

      const escapeHtml = (
        value: unknown
      ) => {
        return String(value ?? '')
          .replace(
            /&/g,
            '&amp;'
          )
          .replace(
            /</g,
            '&lt;'
          )
          .replace(
            />/g,
            '&gt;'
          )
          .replace(
            /"/g,
            '&quot;'
          )
          .replace(
            /'/g,
            '&#039;'
          );
      };

      /* =======================================================
        STATUS
      ======================================================= */

      const status =
        String(
          enquiry.status || 'New'
        ).trim() || 'New';

      const getStatusStyle = (
        currentStatus: string
      ) => {
        switch (
          currentStatus.toLowerCase()
        ) {
          case 'new':
            return {
              background: '#E0F2FE',
              color: '#0369A1',
              border: '#BAE6FD',
            };

          case 'contacted':
            return {
              background: '#F3E8FF',
              color: '#7E22CE',
              border: '#E9D5FF',
            };

          case 'confirmed':
            return {
              background: '#FEF3C7',
              color: '#B45309',
              border: '#FDE68A',
            };

          case 'paid':
            return {
              background: '#DCFCE7',
              color: '#15803D',
              border: '#BBF7D0',
            };

          case 'preparing':
            return {
              background: '#FEF3C7',
              color: '#B45309',
              border: '#FDE68A',
            };

          case 'delivered':
            return {
              background: '#DBEAFE',
              color: '#1D4ED8',
              border: '#BFDBFE',
            };

          case 'cancelled':
            return {
              background: '#FEE2E2',
              color: '#B91C1C',
              border: '#FECACA',
            };

          default:
            return {
              background: '#F5F3F4',
              color: '#5A4550',
              border: '#E5DDE1',
            };
        }
      };

      const statusStyle =
        getStatusStyle(status);

      /* =======================================================
        ORDER ITEMS
      ======================================================= */

      const itemsHtml =
        enquiry.items
          ?.map((item) => {
            const quantity =
              Number(
                item.quantity || 0
              );

            const price =
              Number(
                item.price || 0
              );

            const itemSubtotal =
              price * quantity;

            return `
              <tr>

                <td class="item-name">
                  ${escapeHtml(
                    item.productName || '-'
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.size ||
                      'Standard'
                  )}
                </td>

                <td class="center">
                  ${quantity}
                </td>

                <td class="right">
                  £${price.toFixed(2)}
                </td>

                <td class="right item-total">
                  £${itemSubtotal.toFixed(2)}
                </td>

              </tr>
            `;
          })
          .join('') || '';

      /* =======================================================
        TOTALS
      ======================================================= */

      const subtotal =
        Number(
          enquiry.subtotal ??
            enquiry.total ??
            0
        );

      const discount =
        Number(
          enquiry.discount || 0
        );

      const total =
        Number(
          enquiry.total || 0
        );

      /* =======================================================
        BRAND CONTACT
      ======================================================= */

      const brandContactDetails = [
        brandAddress,
        brandPhone,
        brandEmail,
      ]
        .filter(Boolean)
        .map(
          (value) =>
            escapeHtml(value)
        )
        .join(
          ' &nbsp; • &nbsp; '
        );

      /* =======================================================
        CUSTOMER DELIVERY
      ======================================================= */

      const deliveryHtml =
        enquiry.deliveryCity
          ? `
            <div class="customer-item">

              <span class="info-label">
                Delivery Destination
              </span>

              <span class="info-value">
                ${escapeHtml(
                  enquiry.deliveryCity
                )}
              </span>

            </div>
          `
          : '';

      /* =======================================================
        NOTES
      ======================================================= */

      const notesHtml =
        enquiry.notes
          ? `
            <div class="notes-card">

              <div class="notes-title">
                SPECIAL INSTRUCTIONS
              </div>

              <div class="notes-text">
                ${escapeHtml(
                  enquiry.notes
                )}
              </div>

            </div>
          `
          : '';

      /* =======================================================
        WRITE PDF WINDOW
      ======================================================= */

      invoiceWindow.document.write(`
        <!DOCTYPE html>

        <html>

          <head>

            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <title>
              Invoice -
              ${escapeHtml(
                enquiry.orderNumber ||
                  enquiry.id ||
                  ''
              )}
            </title>

            <style>

              @page {
                size: A4;
                margin: 0;
              }

              * {
                box-sizing: border-box;
              }

              html,
              body {
                margin: 0;
                padding: 0;
                background: #f2ecef;
              }

              body {
                font-family:
                  "Helvetica Neue",
                  Arial,
                  sans-serif;

                color: #241b20;

                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .page {
                width: 210mm;
                min-height: 297mm;

                margin: 0 auto;

                background: #ffffff;

                position: relative;

                overflow: hidden;
              }

              .top-accent {
                height: 6px;

                background:
                  linear-gradient(
                    90deg,
                    #9e315a 0%,
                    #c45d7e 35%,
                    #f0b429 65%,
                    #9e315a 100%
                  );
              }

              .header {
                padding:
                  38px 46px 30px;

                display: flex;

                justify-content:
                  space-between;

                align-items:
                  flex-start;

                border-bottom:
                  1px solid #eadde2;
              }

              .brand-section {
                display: flex;

                align-items: center;

                gap: 17px;
              }

              .logo-container {
                width: 92px;
                height: 92px;

                border-radius: 20px;

                display: flex;

                align-items: center;

                justify-content: center;

                background: #fff8fa;

                border:
                  1px solid #efdde4;

                box-shadow:
                  0 8px 24px
                  rgba(
                    158,
                    49,
                    90,
                    0.10
                  );

                overflow: hidden;
              }

              .brand-logo {
                width: 78px;
                height: 78px;

                object-fit: contain;

                display: block;
              }

              .brand-name {
                margin: 0;

                font-family:
                  Georgia,
                  "Times New Roman",
                  serif;

                font-size: 27px;

                font-weight: 700;

                color: #241b20;
              }

              .brand-tagline {
                margin-top: 4px;

                color: #9e315a;

                font-size: 9px;

                font-weight: 800;

                letter-spacing: 2px;

                text-transform:
                  uppercase;
              }

              .brand-contact {
                margin-top: 9px;

                max-width: 280px;

                color: #8c5d6c;

                font-size: 8px;

                line-height: 1.6;
              }

              .invoice-heading {
                text-align: right;
              }

              .official-label {
                color: #9e315a;

                font-size: 8px;

                font-weight: 800;

                letter-spacing: 2.5px;

                text-transform:
                  uppercase;

                margin-bottom: 4px;
              }

              .invoice-title {
                margin: 0;

                font-family:
                  Georgia,
                  "Times New Roman",
                  serif;

                font-size: 34px;

                font-weight: 700;

                color: #241b20;
              }

              .invoice-number {
                margin-top: 7px;

                font-family:
                  "Courier New",
                  monospace;

                font-size: 10px;

                color: #8c5d6c;
              }

              .meta-section {
                padding:
                  24px 46px;

                display: grid;

                grid-template-columns:
                  1fr 1fr 1fr;

                gap: 13px;
              }

              .meta-card {
                padding:
                  14px 16px;

                border-radius: 14px;

                background: #fff8fa;

                border:
                  1px solid #f0dfe5;
              }

              .meta-label {
                font-size: 8px;

                text-transform:
                  uppercase;

                letter-spacing: 1.3px;

                color: #9e315a;

                font-weight: 800;

                margin-bottom: 5px;
              }

              .meta-value {
                font-size: 11px;

                color: #241b20;

                font-weight: 700;
              }

              .status-card {
                padding:
                  14px 16px;

                border-radius: 14px;

                background:
                  ${statusStyle.background};

                border:
                  1px solid
                  ${statusStyle.border};
              }

              .status-label {
                font-size: 8px;

                text-transform:
                  uppercase;

                letter-spacing: 1.3px;

                font-weight: 800;

                color:
                  ${statusStyle.color};

                margin-bottom: 5px;
              }

              .status-value {
                font-size: 14px;

                font-weight: 900;

                color:
                  ${statusStyle.color};
              }

              .status-updated {
                margin-top: 6px;

                font-size: 7px;

                color:
                  ${statusStyle.color};

                font-weight: 600;
              }

              .section {
                padding:
                  0 46px;

                margin-bottom: 24px;
              }

              .section-heading {
                display: flex;

                align-items: center;

                gap: 9px;

                margin-bottom: 11px;
              }

              .section-number {
                width: 24px;
                height: 24px;

                border-radius: 50%;

                display: flex;

                align-items: center;

                justify-content: center;

                background: #fff0f4;

                color: #9e315a;

                font-size: 8px;

                font-weight: 900;
              }

              .section-title {
                margin: 0;

                font-size: 10px;

                text-transform:
                  uppercase;

                letter-spacing: 1.5px;

                color: #9e315a;

                font-weight: 900;
              }

              .customer-card {
                display: grid;

                grid-template-columns:
                  1fr 1fr;

                border:
                  1px solid #eadde2;

                border-radius: 15px;

                overflow: hidden;
              }

              .customer-item {
                padding:
                  14px 17px;

                min-height: 59px;

                border-bottom:
                  1px solid #f0e6ea;
              }

              .customer-item:nth-child(
                odd
              ) {
                border-right:
                  1px solid #f0e6ea;
              }

              .customer-item:last-child,
              .customer-item:nth-last-child(
                2
              ) {
                border-bottom: none;
              }

              .info-label {
                display: block;

                color: #9e315a;

                font-size: 7px;

                text-transform:
                  uppercase;

                letter-spacing: 1px;

                font-weight: 800;

                margin-bottom: 4px;
              }

              .info-value {
                color: #241b20;

                font-size: 10px;

                font-weight: 600;
              }

              .items-table {
                width: 100%;

                border-collapse:
                  separate;

                border-spacing: 0;

                border:
                  1px solid #eadde2;

                border-radius: 15px;

                overflow: hidden;
              }

              .items-table th {
                padding:
                  12px 13px;

                background: #9e315a;

                color: white;

                font-size: 7.5px;

                font-weight: 800;

                text-transform:
                  uppercase;

                letter-spacing: 1px;

                text-align: left;
              }

              .items-table td {
                padding:
                  13px;

                font-size: 9.5px;

                color: #5a4550;

                border-bottom:
                  1px solid #f0e6ea;
              }

              .items-table tbody tr:last-child td {
                border-bottom: none;
              }

              .item-name {
                color: #241b20 !important;

                font-weight: 700 !important;
              }

              .item-total {
                color: #9e315a !important;

                font-weight: 800 !important;
              }

              .center {
                text-align:
                  center !important;
              }

              .right {
                text-align:
                  right !important;
              }

              .summary-area {
                display: flex;

                justify-content:
                  flex-end;

                padding:
                  0 46px;

                margin-top: 4px;

                margin-bottom: 25px;
              }

              .summary {
                width: 285px;

                padding:
                  16px 18px;

                border-radius: 16px;

                background: #fff8fa;

                border:
                  1px solid #f0dfe5;
              }

              .summary-row {
                display: flex;

                justify-content:
                  space-between;

                align-items: center;

                padding: 5px 0;

                color: #6c5660;

                font-size: 9.5px;
              }

              .discount {
                color: #9e315a;
              }

              .grand-total {
                display: flex;

                justify-content:
                  space-between;

                align-items: center;

                margin-top: 8px;

                padding-top: 12px;

                border-top:
                  1px solid #e2cdd5;
              }

              .grand-total-label {
                color: #241b20;

                font-size: 10px;

                font-weight: 900;
              }

              .grand-total-value {
                color: #9e315a;

                font-family:
                  Georgia,
                  "Times New Roman",
                  serif;

                font-size: 22px;

                font-weight: 700;
              }

              .notes-card {
                margin:
                  0 46px 25px;

                padding:
                  14px 17px;

                border-radius: 14px;

                background: #fffbeb;

                border:
                  1px solid #f3dfa3;
              }

              .notes-title {
                color: #a16207;

                font-size: 7.5px;

                font-weight: 900;

                letter-spacing: 1.2px;

                margin-bottom: 5px;
              }

              .notes-text {
                color: #655025;

                font-size: 9px;

                font-style: italic;

                line-height: 1.5;
              }

              .footer {
                position: absolute;

                left: 0;
                right: 0;
                bottom: 0;

                padding:
                  17px 46px 20px;

                border-top:
                  1px solid #eadde2;

                background:
                  linear-gradient(
                    90deg,
                    #fff8fa,
                    #ffffff
                  );

                display: flex;

                justify-content:
                  space-between;

                align-items:
                  flex-end;
              }

              .footer-brand {
                color: #9e315a;

                font-family:
                  Georgia,
                  "Times New Roman",
                  serif;

                font-size: 12px;

                font-weight: 700;
              }

              .footer-text {
                margin-top: 3px;

                color: #8c5d6c;

                font-size: 7.5px;
              }

              .developer-credit {
                margin-top: 6px;

                color: #8c5d6c;

                font-size: 7px;

                line-height: 1.4;
              }

              .developer-name {
                color: #9e315a;

                font-weight: 800;
              }

              .developer-website {
                color: #9e315a;

                font-weight: 700;
              }

              .footer-right {
                text-align:
                  right;

                color: #8c5d6c;

                font-size: 7.5px;

                line-height: 1.6;
              }

              .thank-you {
                color: #9e315a;

                font-family:
                  Georgia,
                  "Times New Roman",
                  serif;

                font-size: 10px;

                font-weight: 700;

                margin-bottom: 2px;
              }

              @media print {

                html,
                body {
                  width: 210mm;
                  min-height: 297mm;

                  background:
                    #ffffff;
                }

                .page {
                  width: 210mm;
                  min-height: 297mm;

                  margin: 0;
                }

              }

            </style>

          </head>

          <body>

            <div class="page">

              <!-- =================================
                  TOP ACCENT
              ================================= -->

              <div class="top-accent"></div>

              <!-- =================================
                  BRAND HEADER
              ================================= -->

              <div class="header">

                <div class="brand-section">

                  <div class="logo-container">

                    <img
                      src="${escapeHtml(
                        brandLogo
                      )}"
                      alt="${escapeHtml(
                        brandName
                      )}"
                      class="brand-logo"
                    />

                  </div>

                  <div>

                    <h1 class="brand-name">
                      ${escapeHtml(
                        brandName
                      )}
                    </h1>

                    <div class="brand-tagline">
                      Fashion • Elegance • Style
                    </div>

                    ${
                      brandContactDetails
                        ? `
                          <div class="brand-contact">
                            ${brandContactDetails}
                          </div>
                        `
                        : ''
                    }

                  </div>

                </div>

                <div class="invoice-heading">

                  <div class="official-label">
                    Official Document
                  </div>

                  <h2 class="invoice-title">
                    Invoice
                  </h2>

                  <div class="invoice-number">
                    #${escapeHtml(
                      enquiry.orderNumber ||
                        enquiry.id ||
                        '-'
                    )}
                  </div>

                </div>

              </div>

              <!-- =================================
                  ORDER INFORMATION
              ================================= -->

              <div class="meta-section">

                <div class="meta-card">

                  <div class="meta-label">
                    Order Number
                  </div>

                  <div class="meta-value">
                    ${escapeHtml(
                      enquiry.orderNumber ||
                        enquiry.id ||
                        '-'
                    )}
                  </div>

                </div>

                <!-- =================================
                    ORDER DATE
                    EXACTLY FROM createdAt
                ================================= -->

                <div class="meta-card">

                  <div class="meta-label">
                    Order Date
                  </div>

                  <div class="meta-value">

                    ${escapeHtml(
                      formattedDate
                    )}

                    <br />

                    <span
                      style="
                        font-size:8px;
                        color:#8C5D6C;
                        font-weight:500;
                      "
                    >
                      ${escapeHtml(
                        formattedTime
                      )}
                    </span>

                  </div>

                </div>

                <!-- =================================
                    ENQUIRY STATUS
                ================================= -->

                <div class="status-card">

                  <div class="status-label">
                    Enquiry Status
                  </div>

                  <div class="status-value">
                    ${escapeHtml(
                      status
                    )}
                  </div>

                  <div class="status-updated">
                    Updated:
                    ${escapeHtml(
                      formattedStatusUpdatedDate
                    )}
                    •
                    ${escapeHtml(
                      formattedStatusUpdatedTime
                    )}
                  </div>

                </div>

              </div>

              <!-- =================================
                  CUSTOMER
              ================================= -->

              <div class="section">

                <div class="section-heading">

                  <div class="section-number">
                    01
                  </div>

                  <h3 class="section-title">
                    Customer Information
                  </h3>

                </div>

                <div class="customer-card">

                  <div class="customer-item">

                    <span class="info-label">
                      Full Name
                    </span>

                    <span class="info-value">
                      ${escapeHtml(
                        enquiry.customerName ||
                          '-'
                      )}
                    </span>

                  </div>

                  <div class="customer-item">

                    <span class="info-label">
                      WhatsApp / Phone
                    </span>

                    <span class="info-value">
                      ${escapeHtml(
                        enquiry.customerPhone ||
                          '-'
                      )}
                    </span>

                  </div>

                  ${deliveryHtml}

                </div>

              </div>

              <!-- =================================
                  ORDER ITEMS
              ================================= -->

              <div class="section">

                <div class="section-heading">

                  <div class="section-number">
                    02
                  </div>

                  <h3 class="section-title">
                    Order Items
                  </h3>

                </div>

                <table class="items-table">

                  <thead>

                    <tr>

                      <th>
                        Item Description
                      </th>

                      <th>
                        Size / Spec
                      </th>

                      <th
                        style="
                          text-align:center;
                        "
                      >
                        Qty
                      </th>

                      <th
                        style="
                          text-align:right;
                        "
                      >
                        Unit Price
                      </th>

                      <th
                        style="
                          text-align:right;
                        "
                      >
                        Subtotal
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    ${itemsHtml}

                  </tbody>

                </table>

              </div>

              <!-- =================================
                  SUMMARY
              ================================= -->

              <div class="summary-area">

                <div class="summary">

                  <div class="summary-row">

                    <span>
                      Items Subtotal
                    </span>

                    <span>
                      £${subtotal.toFixed(
                        2
                      )}
                    </span>

                  </div>

                  ${
                    discount > 0
                      ? `
                        <div
                          class="
                            summary-row
                            discount
                          "
                        >

                          <span>
                            Discount
                          </span>

                          <span>
                            -£${discount.toFixed(
                              2
                            )}
                          </span>

                        </div>
                      `
                      : ''
                  }

                  <div class="summary-row">

                    <span>
                      Delivery
                    </span>

                    <span
                      style="
                        color:#15803D;
                        font-weight:700;
                      "
                    >
                      Complimentary
                    </span>

                  </div>

                  <div class="grand-total">

                    <span
                      class="grand-total-label"
                    >
                      Grand Total
                    </span>

                    <span
                      class="grand-total-value"
                    >
                      £${total.toFixed(
                        2
                      )}
                    </span>

                  </div>

                </div>

              </div>

              <!-- =================================
                  NOTES
              ================================= -->

              ${notesHtml}

              <!-- =================================
                  FOOTER
              ================================= -->

              <div class="footer">

                <div>

                  <div class="footer-brand">
                    ${escapeHtml(
                      brandName
                    )}
                  </div>

                  <div class="footer-text">
                    Thank you for choosing
                    us for your fashion journey.
                  </div>

                  <div class="developer-credit">
                    Built by
                    <span class="developer-name">
                      NeirahTech
                    </span>
                    •
                    <span class="developer-website">
                      neirahtech.com
                    </span>
                  </div>

                </div>

                <div class="footer-right">

                  <div class="thank-you">
                    Thank you for your order ✦
                  </div>

                  <div>
                    This invoice was generated
                    from the Admin Portal.
                  </div>

                  <div>
                    Order #
                    ${escapeHtml(
                      enquiry.orderNumber ||
                        enquiry.id ||
                        '-'
                    )}
                  </div>

                </div>

              </div>

            </div>

            <script>

              window.onload = function () {

                setTimeout(
                  function () {
                    window.print();
                  },
                  400
                );

              };

            </script>

          </body>

        </html>
      `);

      invoiceWindow.document.close();

      showToast(
        'Invoice Ready',
        'The premium Meera Fashion invoice has been prepared for printing.'
      );

    } catch (error) {

      console.error(
        'Invoice generation failed:',
        error
      );

      showToast(
        'Invoice Error',
        'Unable to generate the invoice.'
      );
    }
  };


  // ============================================================
  // Invoice PDF
  // ============================================================

  const handleDownloadInvoicePDF = async (
    invoice: Invoice
  ) => {
    try {
      console.log('==========================================');
      console.log('📄 INVOICE PDF DOWNLOAD');
      console.log('==========================================');
      console.log('Invoice:', invoice);

      /*
      |--------------------------------------------------------------------------
      | FIND ORIGINAL ENQUIRY
      |--------------------------------------------------------------------------
      */

      const invoiceData =
        invoice as Invoice & {
          enquiryId?: string | null;
          orderId?: string | null;
          orderNumber?: string | null;
        };

      const invoiceId = String(
        invoiceData.id ?? ''
      ).trim();

      const enquiryId = String(
        invoiceData.enquiryId ??
          invoiceData.orderId ??
          invoiceId
      ).trim();

      console.log('🔎 Invoice ID:', invoiceId);
      console.log('🔎 Enquiry ID:', enquiryId);

      /*
      |--------------------------------------------------------------------------
      | FIND MATCHING ENQUIRY
      |--------------------------------------------------------------------------
      */

      const matchingEnquiry =
        enquiries.find(
          (enquiry: EnquiryOrder) => {
            const enquiryAny =
              enquiry as EnquiryOrder & {
                order_number?: string;
              };

            const enquiryIdValue =
              String(
                enquiry.id ?? ''
              ).trim();

            const enquiryOrderNumber =
              String(
                enquiry.orderNumber ??
                  enquiryAny.order_number ??
                  ''
              ).trim();

            const invoiceOrderNumber =
              String(
                invoiceData.orderNumber ?? ''
              ).trim();

            return (
              enquiryIdValue === enquiryId ||
              enquiryIdValue === invoiceId ||
              (
                invoiceOrderNumber &&
                enquiryOrderNumber ===
                  invoiceOrderNumber
              )
            );
          }
        );

      console.log(
        '🔍 MATCHING ENQUIRY:',
        matchingEnquiry
      );

      if (!matchingEnquiry) {
        console.error(
          '❌ Could not find original enquiry for invoice:',
          invoice
        );

        showToast(
          'Invoice Error',
          'Could not find the original order information.'
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | DATABASE DATE DEBUG
      |--------------------------------------------------------------------------
      */

      const enquiryWithDbFields =
        matchingEnquiry as EnquiryOrder & {
          created_at?: unknown;
          status_updated_at?: unknown;
        };

      console.log(
        '=========================================='
      );

      console.log(
        '📅 ORIGINAL DATABASE DATES'
      );

      console.log({
        id:
          matchingEnquiry.id,

        createdAt:
          matchingEnquiry.createdAt,

        created_at:
          enquiryWithDbFields.created_at,

        statusUpdatedAt:
          matchingEnquiry.statusUpdatedAt,

        status_updated_at:
          enquiryWithDbFields.status_updated_at,
      });

      console.log(
        '=========================================='
      );

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | Use the SAME function that already creates your correct
      | premium invoice.
      |
      | We pass TRUE so that the invoice is downloaded automatically
      | instead of opening the print dialog.
      |
      */

      await handleDownloadOrderInvoicePdf(
        matchingEnquiry,
        true
      );

    } catch (error) {
      console.error(
        '❌ Invoice PDF generation failed:',
        error
      );

      showToast(
        'Invoice Error',
        'Unable to download the invoice PDF.'
      );
    }
  };

  // ============================================================
  // LOGO UPLOAD
  // ============================================================

  const handleLogoFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast(
        'Invalid File',
        'Please upload a valid image file.'
      );

      event.target.value = '';

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result !== 'string'
      ) {
        return;
      }

      setLocalSettings(
        (previous) => ({
          ...previous,
          logo: result,
        })
      );

      showToast(
        'Logo Uploaded',
        'Your new boutique logo is ready to save.'
      );
    };

    reader.onerror = () => {
      showToast(
        'Upload Error',
        'Unable to read the selected image.'
      );
    };

    reader.readAsDataURL(file);

    event.target.value = '';
  };

  // ============================================================
  // SAVE BOUTIQUE SETTINGS
  // ============================================================

  const handleSaveBoutiqueSettings = () => {
    onSaveSettings({
      ...localSettings,
    });

    setSettingsSavedFeedback(
      true
    );

    showToast(
      'Settings Saved',
      'Your boutique settings have been updated successfully.'
    );

    window.setTimeout(() => {
      setSettingsSavedFeedback(
        false
      );
    }, 2500);
  };

  // ============================================================
  // CALCULATED VALUES
  // ============================================================

  const totalRevenue =
    enquiries
      .filter(
        (enquiry) =>
          enquiry.status ===
            'Confirmed' ||
          enquiry.status ===
            'Paid' ||
          enquiry.status ===
            'Delivered'
      )
      .reduce(
        (total, enquiry) =>
          total +
          Number(
            enquiry.total || 0
          ),
        0
      );

  const pendingEnquiriesCount =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
          'New' ||
        enquiry.status ===
          'Contacted'
    ).length;

  const inStockCount =
    products.filter(
      (product) =>
        product.stockStatus ===
        'In Stock'
    ).length;

  const outOfStockCount =
    products.filter(
      (product) =>
        product.stockStatus ===
          'Out of Stock' ||
        product.stockStatus ===
          'Unavailable'
    ).length;

  // ============================================================
  // CLOSED STATE
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        fixed inset-0 z-100
        bg-[#120B0F]
        text-[#241B20]
        flex flex-col md:flex-row
        p-2 sm:p-3 md:p-4 lg:p-5
        gap-3 lg:gap-5
        overflow-hidden
        animate-fadeIn
        select-none
        box-border
        w-screen
        h-screen
        max-w-full
      "
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        products={products}
        enquiries={enquiries}
        invoices={invoices}
        settings={settings}
        pendingEnquiriesCount={pendingEnquiriesCount}
        onLogout={onClose}
        onNavigateToLogin={onClose}
      />

      {/* ======================================================
          MAIN WORKSPACE
      ====================================================== */}

      <main
        className="
          flex-1
          min-w-0
          h-full
          bg-[#FAF6F8]
          rounded-2xl sm:rounded-3xl
          border border-rose-200/70
          overflow-hidden
          flex flex-col
          shadow-2xl
        "
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <header
          className="
            px-4 sm:px-6
            py-3.5
            bg-white/95
            backdrop-blur-md
            border-b border-rose-200/60
            flex items-center
            justify-between
            shrink-0
            gap-3
          "
        >

          <div
            className="
              flex items-center
              gap-2.5 sm:gap-3
              min-w-0
            "
          >

            <div
              className="
                p-2
                rounded-xl
                bg-rose-50
                text-[#9E315A]
                border border-rose-200/60
                shrink-0
              "
            >
              <activeTabDetails.icon
                className="w-4 h-4"
              />
            </div>

            <div className="min-w-0">

              <div
                className="
                  flex items-center
                  gap-1.5
                  text-[10px] sm:text-[11px]
                  uppercase
                  tracking-widest
                  text-[#8C5D6C]
                  font-bold
                "
              >

                <span className="hidden sm:inline">
                  Admin
                </span>

                <span className="hidden sm:inline text-rose-300">
                  •
                </span>

                <span
                  className="
                    font-serif
                    font-bold
                    text-[#9E315A]
                    capitalize
                    truncate
                  "
                >
                  {activeTabDetails.label}
                </span>

              </div>

              <h2
                className="
                  font-serif
                  font-bold
                  text-sm sm:text-base md:text-lg
                  text-[#241B20]
                  truncate
                "
              >
                {activeTabDetails.title}
              </h2>

            </div>

          </div>

          {/* HEADER ACTIONS */}

          <div
            className="
              flex items-center
              gap-2
              shrink-0
            "
          >

            {activeTab === 'products' && (
              <button
                type="button"
                onClick={
                  handleOpenAddProduct
                }
                className="
                  flex items-center
                  gap-1.5
                  bg-[#9E315A]
                  hover:bg-[#832247]
                  text-white
                  px-3 sm:px-4
                  py-2
                  rounded-full
                  text-xs
                  font-bold
                  transition-colors
                  cursor-pointer
                "
              >
                <Plus className="w-3.5 h-3.5" />

                <span>
                  Add Piece
                </span>
              </button>
            )}

            {activeTab === 'settings' && (
              <button
                type="button"
                onClick={
                  handleSaveBoutiqueSettings
                }
                className={`
                  flex items-center
                  gap-1.5
                  px-3.5 sm:px-4
                  py-2
                  rounded-full
                  text-xs
                  font-bold
                  transition-colors
                  cursor-pointer
                  ${
                    settingsSavedFeedback
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#9E315A] text-white hover:bg-[#832247]'
                  }
                `}
              >

                {settingsSavedFeedback ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}

                <span>
                  {settingsSavedFeedback
                    ? 'Saved!'
                    : 'Save Changes'}
                </span>

              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="
                flex items-center
                gap-1.5
                px-3 sm:px-4
                py-2
                rounded-full
                bg-white
                hover:bg-rose-50
                border border-rose-200
                text-[#241B20]
                text-xs
                font-semibold
                transition-colors
                cursor-pointer
              "
            >

              <Store
                className="
                  w-3.5 h-3.5
                  text-[#9E315A]
                "
              />

              <span className="hidden sm:inline">
                Back to Store
              </span>

              <span className="sm:hidden">
                Exit
              </span>

            </button>

          </div>

        </header>

        {/* ==================================================
            MOBILE NAV
        ================================================== */}

        <div
          className="
            md:hidden
            bg-white/90
            border-b border-rose-100
            px-3 py-2
            overflow-x-auto
            no-scrollbar
            flex items-center
            gap-1.5
            shrink-0
          "
        >

          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;

            const isActive =
              activeTab === tab.id;

            const count =
              tab.id === 'products'
                ? products.length
                : tab.id === 'enquiries'
                  ? pendingEnquiriesCount ||
                    enquiries.length
                  : tab.id === 'sales_history'
                    ? enquiries.length
                    : tab.id === 'invoices'
                      ? invoices.length
                      : null;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`
                  flex items-center
                  gap-1.5
                  px-3 py-1.5
                  rounded-full
                  text-xs
                  font-bold
                  whitespace-nowrap
                  transition-colors
                  cursor-pointer
                  ${
                    isActive
                      ? 'bg-[#9E315A] text-white'
                      : 'bg-rose-50 text-[#5A4550] hover:bg-rose-100'
                  }
                `}
              >

                <Icon className="w-3.5 h-3.5" />

                <span>
                  {count === null
                    ? tab.mobileLabel
                    : `${tab.mobileLabel} (${count})`}
                </span>

              </button>
            );
          })}

        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            p-4 sm:p-6 md:p-8
            space-y-6
          "
        >

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          {activeTab === 'dashboard' && (
            <DashboardOverview
              totalRevenue={
                totalRevenue
              }
              pendingEnquiriesCount={
                pendingEnquiriesCount
              }
              inStockCount={
                inStockCount
              }
              outOfStockCount={
                outOfStockCount
              }
              enquiries={
                enquiries
              }
              products={
                products
              }
              settings={
                settings
              }
              setActiveTab={
                setActiveTab
              }
              handleOpenEditProduct={
                handleOpenEditProduct
              }
            />
          )}

          {/* ==================================================
              PRODUCTS
          ================================================== */}

          {activeTab === 'products' && (
            <ProductsPanel
              products={
                products
              }

              productSearch={
                productSearch
              }

              setProductSearch={
                setProductSearch
              }

              productCategoryFilter={
                productCategoryFilter
              }

              setProductCategoryFilter={
                setProductCategoryFilter
              }

              productStockFilter={
                productStockFilter
              }

              setProductStockFilter={
                setProductStockFilter
              }

              adminProductPage={
                adminProductPage
              }

              setAdminProductPage={
                setAdminProductPage
              }

              adminProductsPerPage={
                adminProductsPerPage
              }

              handleOpenAddProduct={
                handleOpenAddProduct
              }

              handleOpenEditProduct={
                handleOpenEditProduct
              }

              handleDeleteProduct={
                handleDeleteProduct
              }

              handleQuickStockStatusChange={
                handleQuickStockStatusChange
              }
            />
          )}

          {/* ==================================================
              WHATSAPP LEADS
          ================================================== */}

          {activeTab === 'enquiries' && (
            <WhatsAppLeadsPanel
              enquiries={
                enquiries
              }

              settings={
                settings
              }

              setActiveTab={
                setActiveTab
              }

              setSelectedOrderDetails={
                setSelectedOrderDetails
              }

              handleDownloadOrderInvoicePdf={
                handleDownloadOrderInvoicePdf
              }

              handleDeleteEnquiry={
                handleDeleteEnquiry
              }

              handleRequestEnquiryStatusChange={
                handleRequestEnquiryStatusChange
              }
            />
          )}

          {/* ==================================================
              SALES HISTORY
          ================================================== */}

          {activeTab === 'sales_history' && (
            <SalesHistoryPanel
              enquiries={
                enquiries
              }

              settings={
                settings
              }

              salesHistorySearch={
                salesHistorySearch
              }

              setSalesHistorySearch={
                setSalesHistorySearch
              }

              salesHistoryStatusFilter={
                salesHistoryStatusFilter
              }

              setSalesHistoryStatusFilter={
                setSalesHistoryStatusFilter
              }

              salesHistoryPage={
                salesHistoryPage
              }

              setSalesHistoryPage={
                setSalesHistoryPage
              }

              setSelectedOrderDetails={
                setSelectedOrderDetails
              }

              handleDownloadOrderInvoicePdf={
                handleDownloadOrderInvoicePdf
              }
            />
          )}

          {/* ==================================================
              INVOICES
          ================================================== */}

          {activeTab === 'invoices' && (
            <AdminInvoicesPanel
              invoices={
                invoices
              }

              onDownloadInvoice={
                handleDownloadInvoicePDF
              }

              onDeleteInvoice={
                handleDeleteInvoice
              }
            />
          )}

          {/* ==================================================
              REPORTS
          ================================================== */}

          {activeTab === 'reports' && (
            <ReportsPanel
              totalRevenue={
                totalRevenue
              }

              products={
                products
              }
            />
          )}

          {/* ==================================================
              SETTINGS
          ================================================== */}

          {activeTab === 'settings' && (
            <SettingsPanel
              localSettings={
                localSettings
              }

              setLocalSettings={
                setLocalSettings
              }

              settingsSavedFeedback={
                settingsSavedFeedback
              }

              logoInputRef={
                logoInputRef
              }

              handleLogoFileUpload={
                handleLogoFileUpload
              }

              handleSaveBoutiqueSettings={
                handleSaveBoutiqueSettings
              }
            />
          )}

        </div>
      </main>

      {/* ========================================================
          PRODUCT FORM MODAL
      ======================================================== */}

      <ProductFormModal
        isOpen={
          isEditingProduct
        }

        product={
          currentEditProduct
        }

        products={
          products
        }

        onChange={
          handleProductChange
        }

        onClose={
          handleCloseProductModal
        }

        onSave={
          handleSaveProductForm
        }

        showToast={
          showToast
        }
      />

      {/* ========================================================
          CANCELLATION MODAL
      ======================================================== */}

      <CancellationReasonModal
        isOpen={
          cancellationModal?.isOpen ??
          false
        }

        enquiry={
          cancellationModal?.enquiry ??
          null
        }

        reason={
          cancellationModal?.reason ??
          ''
        }

        onReasonChange={
          handleCancellationReasonChange
        }

        onCancel={
          handleCloseCancellationModal
        }

        onConfirm={
          handleConfirmCancellation
        }
      />

      {/* ========================================================
          ORDER DETAILS MODAL
      ======================================================== */}

      <OrderDetailsModal
        enquiry={
          selectedOrderDetails
        }

        settings={
          settings
        }

        onClose={() =>
          setSelectedOrderDetails(
            null
          )
        }

        onDownloadInvoice={
          handleDownloadOrderInvoicePdf
        }

        onWhatsApp={
          handleWhatsApp
        }
      />

      {/* ========================================================
          CONFIRMATION MODAL
      ======================================================== */}

      <ConfirmationModal
        config={
          statusConfirmation.isOpen &&
          statusConfirmation.enquiry &&
          statusConfirmation.newStatus
            ? {
                isOpen: true,

                title: 'Confirm Order Status',

                message:
                  statusConfirmation.newStatus === 'Paid'
                    ? 'This order will be marked as paid and added to the invoice section.'
                    : statusConfirmation.newStatus === 'Delivered'
                      ? 'This order will be marked as delivered. Since the order is already paid, it will remain available in the invoice section.'
                      : `Are you sure you want to change this order to ${statusConfirmation.newStatus}?`,

                currentStatus:
                  statusConfirmation.enquiry.status,

                newStatus:
                  statusConfirmation.newStatus,

                confirmLabel:
                  'Yes, Update Status',

                cancelLabel:
                  'Keep Current Status',

                isDestructive:
                  statusConfirmation.newStatus ===
                  'Cancelled',

                onConfirm:
                  handleConfirmEnquiryStatusChange,
              }
            : null
        }
        onClose={() => {
          setStatusConfirmation({
            isOpen: false,
            enquiry: null,
            newStatus: null,
          });
        }}
      />

      {/* ========================================================
          TOAST
      ======================================================== */}

      <ToastNotification
        notification={
          toastNotification
        }

        onClose={
          handleCloseToast
        }
      />

    </div>
  );
};