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

import {
  ADMIN_TABS,
  getAdminTab,
  type AdminTabId,
} from './adminNavigation';
import html2pdf from 'html2pdf.js';

// ============================================================
// SECTIONS
// ============================================================

import { DashboardOverview } from './sections/DashboardOverview';
import { ProductsPanel } from './sections/ProductsPanel';
import { WhatsAppLeadsPanel } from './sections/WhatsAppLeadsPanel';
import { SalesHistoryPanel } from './sections/SalesHistoryPanel';
import { AdminInvoicesPanel } from './sections/AdminInvoicesPanel';
import { MediaOptimizerPanel } from './sections/MediaOptimizerPanel';
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
  // MEDIA OPTIMIZER STATE
  // ============================================================

  const [uploadedImagePreview, setUploadedImagePreview] =
    useState<string | null>(null);

  const [compressionRatio, setCompressionRatio] =
    useState(
      'Upload any high-res photo to test instant WebP compression & optimization.'
    );

  const [isCompressing, setIsCompressing] =
    useState(false);

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
      price: 0,
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
              product.id ===
              currentEditProduct.id
          )
        : undefined;

    const productToSave =
      {
        ...(existingProduct || {}),
        ...currentEditProduct,

        id:
          currentEditProduct.id ||
          `product-${Date.now()}`,

        name: productName,

        category:
          currentEditProduct.category ||
          existingProduct?.category ||
          'sarees',

        stockStatus:
          currentEditProduct.stockStatus ||
          existingProduct?.stockStatus ||
          'In Stock',
      } as Product;

    const productExists =
      products.some(
        (product) =>
          product.id ===
          productToSave.id
      );

    const updatedProducts =
      productExists
        ? products.map(
            (product) =>
              product.id ===
              productToSave.id
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

    // Create updated enquiry
    const updatedEnquiry: EnquiryOrder = {
      ...enquiry,
      status: newStatus,
    };

    const updatedEnquiries = enquiries.map((item) => {
      const baseItem = item.id === enquiry.id ? updatedEnquiry : item;
      
      // Clean up fields that might accidentally be empty objects `{}` using `undefined` instead of `null`
      return {
        ...baseItem,
        cancelledAt: typeof baseItem.cancelledAt === 'string' ? baseItem.cancelledAt : undefined,
        createdAt: typeof baseItem.createdAt === 'string' ? baseItem.createdAt : undefined,
      };
    });

    // Save enquiry status to database
    try {
      await onSaveEnquiries(updatedEnquiries);
    } catch (error) {
      console.error('❌ Failed to save enquiry status:', error);
      showToast(
        'Update Failed',
        'The order status could not be saved to the database.'
      );
      return;
    }

    // Only Paid / Delivered create or update invoice
    if (newStatus === 'Paid' || newStatus === 'Delivered') {
      const invoiceNumber = `INV-${enquiry.orderNumber || enquiry.id}`;

      const invoiceItems: Invoice['items'] = (enquiry.items || []).map((item) => {
        const quantity = Number(item?.quantity) || 1;
        const unitPrice = Number(item?.price) || 0;

        return {
          description: typeof item?.productName === 'string' ? item.productName : 'Product',
          quantity,
          unitPrice,
          total: unitPrice * quantity,
          variant: typeof item?.size === 'string' ? item.size : undefined,
        };
      });

      const existingInvoiceIndex = invoices.findIndex(
        (invoice) =>
          invoice.enquiryId === enquiry.id ||
          invoice.invoiceNumber === invoiceNumber
      );

      let updatedInvoices: Invoice[];

      if (existingInvoiceIndex !== -1) {
        updatedInvoices = invoices.map((invoice, index) => {
          if (index !== existingInvoiceIndex) {
            return invoice;
          }

          return {
            ...invoice,
            enquiryId: enquiry.id,
            invoiceNumber,
            customerName: enquiry.customerName || invoice.customerName,
            customerPhone: enquiry.customerPhone || invoice.customerPhone,
            customerEmail: enquiry.customerEmail || invoice.customerEmail,
            items: invoiceItems.length > 0 ? invoiceItems : invoice.items,
            subtotal: Number(enquiry.subtotal ?? enquiry.total) || invoice.subtotal,
            discount: Number(enquiry.discount ?? 0),
            shipping: Number(invoice.shipping ?? 0),
            total: Number(enquiry.total) || invoice.total,
            status: newStatus === 'Delivered' ? 'Delivered' : 'Paid',
            issueDate: invoice.issueDate || new Date().toISOString(),
            dueDate: invoice.dueDate || new Date().toISOString(),
            paymentMethod: invoice.paymentMethod,
            createdAt: invoice.createdAt || new Date().toISOString(),
          };
        });
      } else {
        const now = new Date().toISOString();

        const newInvoice: Invoice = {
          id: `INV-${Date.now()}-${enquiry.id}`,
          enquiryId: enquiry.id,
          invoiceNumber,
          customerName: enquiry.customerName || 'Customer',
          customerPhone: enquiry.customerPhone || '',
          customerEmail: enquiry.customerEmail || undefined,
          items: invoiceItems,
          subtotal: Number(enquiry.subtotal ?? enquiry.total) || 0,
          discount: Number(enquiry.discount ?? 0) || 0,
          notes: typeof enquiry.notes === 'string' ? enquiry.notes : undefined,
          shipping: 0,
          total: Number(enquiry.total) || 0,
          status: newStatus === 'Delivered' ? 'Delivered' : 'Paid',
          issueDate: now,
          dueDate: now,
          paymentMethod: undefined,
          createdAt: now,
        };

        updatedInvoices = [...invoices, newInvoice];
      }

      // Save invoice to database
      try {
        await onSaveInvoices(updatedInvoices);
      } catch (error) {
        console.error('❌ Failed to save invoice:', error);
        showToast(
          'Invoice Save Failed',
          'The order status was saved, but the invoice could not be saved.'
        );
        return;
      }
    }

    // Success notification
    showToast(
      'Status Updated',
      `Order ${enquiry.orderNumber || enquiry.id} status changed to ${newStatus}${
        newStatus === 'Paid' || newStatus === 'Delivered'
          ? ' and invoice updated.'
          : '.'
      }`
    );
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
      const invoiceWindow =
        window.open(
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

      const itemsHtml =
        enquiry.items
          .map(
            (item) => `
              <tr>
                <td>${item.productName || '-'}</td>
                <td>${item.size || 'Standard'}</td>
                <td>${item.quantity || 0}</td>
                <td>£${Number(
                  item.price || 0
                ).toFixed(2)}</td>
                <td>£${(
                  Number(item.price || 0) *
                  Number(item.quantity || 0)
                ).toFixed(2)}</td>
              </tr>
            `
          )
          .join('');

      invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>
              Order Invoice - ${
                enquiry.orderNumber ||
                enquiry.id
              }
            </title>

            <style>
              * {
                box-sizing: border-box;
              }

              body {
                font-family:
                  Arial,
                  Helvetica,
                  sans-serif;
                padding: 40px;
                color: #241B20;
                line-height: 1.5;
              }

              h1 {
                color: #9E315A;
                margin: 0 0 5px;
              }

              h2,
              h3 {
                color: #241B20;
              }

              .header {
                display: flex;
                justify-content: space-between;
                gap: 30px;
                border-bottom:
                  2px solid #9E315A;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }

              .muted {
                color: #8C5D6C;
              }

              .section {
                margin-bottom: 25px;
              }

              .customer {
                background: #FFF8FA;
                border: 1px solid #f3dce4;
                padding: 18px;
                border-radius: 12px;
              }

              table {
                width: 100%;
                border-collapse:
                  collapse;
                margin-top: 15px;
              }

              th,
              td {
                padding: 10px;
                border-bottom:
                  1px solid #f0e1e6;
                text-align: left;
                font-size: 13px;
              }

              th {
                background: #FFF8FA;
                color: #8C5D6C;
              }

              .right {
                text-align: right;
              }

              .total {
                margin-top: 25px;
                padding-top: 15px;
                border-top:
                  2px solid #9E315A;
                text-align: right;
                font-size: 22px;
                font-weight: bold;
                color: #9E315A;
              }

              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top:
                  1px solid #ead6dd;
                color: #8C5D6C;
                font-size: 12px;
              }

              @media print {
                body {
                  padding: 20px;
                }
              }
            </style>
          </head>

          <body>

            <div class="header">
              <div>
                <h1>Meera Fashion</h1>
                <div class="muted">
                  Order Invoice
                </div>
              </div>

              <div>
                <strong>
                  Order:
                </strong>

                ${
                  enquiry.orderNumber ||
                  enquiry.id
                }

                <br />

                <strong>
                  Status:
                </strong>

                ${enquiry.status}
              </div>
            </div>

            <div class="section customer">
              <h3>
                Customer Details
              </h3>

              <p>
                <strong>Name:</strong>
                ${
                  enquiry.customerName ||
                  '-'
                }
              </p>

              <p>
                <strong>Phone:</strong>
                ${
                  enquiry.customerPhone ||
                  '-'
                }
              </p>

              <p>
                <strong>Email:</strong>
                ${
                  enquiry.customerEmail ||
                  '-'
                }
              </p>

              ${
                enquiry.deliveryCity
                  ? `
                    <p>
                      <strong>
                        Delivery:
                      </strong>
                      ${enquiry.deliveryCity}
                    </p>
                  `
                  : ''
              }
            </div>

            <div class="section">
              <h3>
                Order Items
              </h3>

              <table>
                <thead>
                  <tr>
                    <th>
                      Item
                    </th>

                    <th>
                      Size
                    </th>

                    <th>
                      Qty
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="total">
              Total:
              £${Number(
                enquiry.total || 0
              ).toFixed(2)}
            </div>

            ${
              enquiry.notes
                ? `
                  <div class="section">
                    <h3>
                      Customer Notes
                    </h3>

                    <p>
                      ${enquiry.notes}
                    </p>
                  </div>
                `
                : ''
            }

            <div class="footer">
              <p>
                Thank you for choosing
                Meera Fashion.
              </p>

              <p>
                This document was
                generated from the
                Meera Fashion Admin
                Portal.
              </p>
            </div>

            <script>
              window.onload = function () {
                window.print();
              };
            </script>

          </body>
        </html>
      `);

      invoiceWindow.document.close();

      showToast(
        'Invoice Ready',
        'The order invoice has been prepared for printing.'
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
  // INVOICE PDF
  // ============================================================

  const handleDownloadInvoicePDF = async (invoice: Invoice) => {
    try {
      const items = Array.isArray(invoice.items)
        ? invoice.items
        : [];

      const subtotal = items.reduce(
        (sum, item) =>
          sum + Number(item.total || 0),
        0
      );

      const total = Number(invoice.total || 0);

      const invoiceElement =
        document.createElement('div');

      invoiceElement.style.width = '794px';
      invoiceElement.style.padding = '45px';
      invoiceElement.style.background = '#ffffff';
      invoiceElement.style.color = '#241B20';
      invoiceElement.style.fontFamily =
        'Arial, Helvetica, sans-serif';

      invoiceElement.innerHTML = `
        <div style="width:100%;">

          <!-- HEADER -->
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            padding-bottom:25px;
            border-bottom:2px solid #9E315A;
          ">

            <div>

              <div style="
                color:#9E315A;
                font-size:28px;
                font-weight:700;
                margin-bottom:6px;
              ">
                Meera's Fashion
              </div>

              <div style="
                color:#8C5D6C;
                font-size:12px;
              ">
                Premium Fashion & Collection
              </div>

            </div>

            <div style="
              text-align:right;
            ">

              <div style="
                color:#9E315A;
                font-size:28px;
                font-weight:700;
              ">
                INVOICE
              </div>

              <div style="
                margin-top:6px;
                font-size:13px;
                color:#5A4550;
              ">
                #${escapeHtml(
                  String(
                    invoice.invoiceNumber || ''
                  )
                )}
              </div>

            </div>

          </div>


          <!-- CUSTOMER INFORMATION -->
          <div style="
            display:flex;
            gap:20px;
            margin-top:30px;
            margin-bottom:30px;
          ">

            <div style="
              flex:1;
              padding:18px;
              background:#FFF8FA;
              border:1px solid #F3DCE5;
              border-radius:12px;
            ">

              <div style="
                color:#9E315A;
                font-size:10px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:1px;
                margin-bottom:8px;
              ">
                BILL TO
              </div>

              <div style="
                font-size:13px;
                line-height:1.7;
              ">

                <strong>
                  ${escapeHtml(
                    String(
                      invoice.customerName || ''
                    )
                  )}
                </strong>

                <br />

                ${escapeHtml(
                  String(
                    invoice.customerPhone || ''
                  )
                )}

              </div>

            </div>


            <div style="
              flex:1;
              padding:18px;
              background:#FFF8FA;
              border:1px solid #F3DCE5;
              border-radius:12px;
            ">

              <div style="
                color:#9E315A;
                font-size:10px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:1px;
                margin-bottom:8px;
              ">
                INVOICE DETAILS
              </div>

              <div style="
                font-size:13px;
                line-height:1.7;
              ">

                <strong>
                  Invoice Date:
                </strong>

                ${escapeHtml(
                  String(
                    invoice.issueDate || ''
                  )
                )}

                <br />

                <strong>
                  Status:
                </strong>

                ${escapeHtml(
                  String(
                    invoice.status || ''
                  )
                )}

              </div>

            </div>

          </div>


          <!-- ITEMS TABLE -->
          <table style="
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          ">

            <thead>

              <tr>

                <th style="
                  text-align:left;
                  padding:12px;
                  background:#FFF8FA;
                  color:#8C5D6C;
                  font-size:10px;
                  text-transform:uppercase;
                  border-bottom:1px solid #EBCFD9;
                ">
                  Description
                </th>

                <th style="
                  text-align:center;
                  padding:12px;
                  background:#FFF8FA;
                  color:#8C5D6C;
                  font-size:10px;
                  text-transform:uppercase;
                  border-bottom:1px solid #EBCFD9;
                ">
                  Qty
                </th>

                <th style="
                  text-align:right;
                  padding:12px;
                  background:#FFF8FA;
                  color:#8C5D6C;
                  font-size:10px;
                  text-transform:uppercase;
                  border-bottom:1px solid #EBCFD9;
                ">
                  Price
                </th>

                <th style="
                  text-align:right;
                  padding:12px;
                  background:#FFF8FA;
                  color:#8C5D6C;
                  font-size:10px;
                  text-transform:uppercase;
                  border-bottom:1px solid #EBCFD9;
                ">
                  Total
                </th>

              </tr>

            </thead>

            <tbody>

              ${items
                .map(
                  (item) => `
                    <tr>

                      <td style="
                        padding:13px 12px;
                        font-size:12px;
                        border-bottom:1px solid #F3E4E9;
                      ">
                        ${escapeHtml(
                          String(
                            item.description || ''
                          )
                        )}
                      </td>

                      <td style="
                        padding:13px 12px;
                        font-size:12px;
                        text-align:center;
                        border-bottom:1px solid #F3E4E9;
                      ">
                        ${Number(
                          item.quantity || 0
                        )}
                      </td>

                      <td style="
                        padding:13px 12px;
                        font-size:12px;
                        text-align:right;
                        border-bottom:1px solid #F3E4E9;
                      ">
                        £${Number(
                          item.unitPrice || 0
                        ).toFixed(2)}
                      </td>

                      <td style="
                        padding:13px 12px;
                        font-size:12px;
                        text-align:right;
                        font-weight:700;
                        color:#9E315A;
                        border-bottom:1px solid #F3E4E9;
                      ">
                        £${Number(
                          item.total || 0
                        ).toFixed(2)}
                      </td>

                    </tr>
                  `
                )
                .join('')}

            </tbody>

          </table>


          <!-- TOTALS -->
          <div style="
            width:300px;
            margin-left:auto;
            margin-top:30px;
          ">

            <div style="
              display:flex;
              justify-content:space-between;
              padding:7px 0;
              font-size:12px;
              color:#5A4550;
            ">

              <span>
                Subtotal
              </span>

              <span>
                £${subtotal.toFixed(2)}
              </span>

            </div>


            <div style="
              display:flex;
              justify-content:space-between;
              padding:7px 0;
              font-size:12px;
              color:#5A4550;
            ">

              <span>
                Delivery
              </span>

              <span style="
                color:#16803A;
                font-weight:600;
              ">
                Complimentary
              </span>

            </div>


            <div style="
              display:flex;
              justify-content:space-between;
              padding-top:14px;
              margin-top:8px;
              border-top:2px solid #9E315A;
              font-size:18px;
              font-weight:700;
              color:#9E315A;
            ">

              <span>
                Grand Total
              </span>

              <span>
                £${total.toFixed(2)}
              </span>

            </div>

          </div>


          <!-- FOOTER -->
          <div style="
            margin-top:55px;
            padding-top:20px;
            border-top:1px solid #EBCFD9;
            text-align:center;
            color:#8C5D6C;
            font-size:10px;
            line-height:1.6;
          ">

            Thank you for choosing
            <strong>
              Meera's Fashion
            </strong>.

            <br />

            Premium fashion, curated for you.

          </div>

        </div>
      `;

      document.body.appendChild(
        invoiceElement
      );

      const filename =
        `Meeras-Fashion-Invoice-${String(
          invoice.invoiceNumber || 'invoice'
        )}.pdf`;

      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: {
            type: 'jpeg',
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
        })
        .from(invoiceElement)
        .save();

      document.body.removeChild(
        invoiceElement
      );

    } catch (error) {
      console.error(
        'Invoice PDF download failed:',
        error
      );

      alert(
        'Unable to download the invoice PDF. Please try again.'
      );
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    try {
      const printWindow = window.open(
        '',
        '_blank',
        'width=900,height=700'
      );

      if (!printWindow) {
        alert('Please allow pop-ups to print the invoice.');
        return;
      }

      const items = Array.isArray(invoice.items)
        ? invoice.items
        : [];

      const subtotal = items.reduce(
        (sum, item) =>
          sum + Number(item.total || 0),
        0
      );

      const total = Number(invoice.total || 0);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>
              Invoice ${escapeHtml(
                String(invoice.invoiceNumber || '')
              )}
            </title>

            <meta charset="UTF-8" />

            <style>
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                padding: 40px;
                font-family: Arial, Helvetica, sans-serif;
                color: #241B20;
                background: #ffffff;
              }

              .invoice {
                max-width: 800px;
                margin: 0 auto;
              }

              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding-bottom: 25px;
                border-bottom: 2px solid #9E315A;
              }

              .brand {
                color: #9E315A;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 5px;
              }

              .brand-subtitle {
                color: #8C5D6C;
                font-size: 12px;
              }

              .invoice-title {
                text-align: right;
              }

              .invoice-title h1 {
                margin: 0;
                color: #9E315A;
                font-size: 28px;
              }

              .invoice-number {
                margin-top: 6px;
                font-size: 13px;
                color: #5A4550;
              }

              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin: 30px 0;
              }

              .info-box {
                padding: 18px;
                background: #FFF8FA;
                border: 1px solid #F3DCE5;
                border-radius: 12px;
              }

              .label {
                display: block;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #9E315A;
                margin-bottom: 7px;
              }

              .value {
                font-size: 13px;
                color: #241B20;
                line-height: 1.7;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 25px;
              }

              th {
                padding: 12px;
                text-align: left;
                background: #FFF8FA;
                color: #8C5D6C;
                font-size: 10px;
                text-transform: uppercase;
                border-bottom: 1px solid #EBCFD9;
              }

              td {
                padding: 13px 12px;
                font-size: 12px;
                border-bottom: 1px solid #F3E4E9;
              }

              .text-right {
                text-align: right;
              }

              .text-center {
                text-align: center;
              }

              .totals {
                width: 320px;
                margin-left: auto;
                margin-top: 25px;
              }

              .total-row {
                display: flex;
                justify-content: space-between;
                padding: 7px 0;
                font-size: 12px;
                color: #5A4550;
              }

              .grand-total {
                display: flex;
                justify-content: space-between;
                padding-top: 12px;
                margin-top: 8px;
                border-top: 2px solid #9E315A;
                font-size: 18px;
                font-weight: 700;
                color: #9E315A;
              }

              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #EBCFD9;
                text-align: center;
                color: #8C5D6C;
                font-size: 10px;
                line-height: 1.6;
              }

              @media print {
                body {
                  padding: 0;
                }

                .invoice {
                  max-width: none;
                }

                @page {
                  size: A4;
                  margin: 15mm;
                }
              }
            </style>
          </head>

          <body>

            <div class="invoice">

              <!-- HEADER -->
              <div class="header">

                <div>
                  <div class="brand">
                    Meera's Fashion
                  </div>

                  <div class="brand-subtitle">
                    Premium Fashion & Collection
                  </div>
                </div>

                <div class="invoice-title">

                  <h1>
                    INVOICE
                  </h1>

                  <div class="invoice-number">
                    #${escapeHtml(
                      String(
                        invoice.invoiceNumber || ''
                      )
                    )}
                  </div>

                </div>

              </div>

              <!-- CUSTOMER / INVOICE INFO -->
              <div class="info-grid">

                <div class="info-box">

                  <span class="label">
                    Bill To
                  </span>

                  <div class="value">

                    <strong>
                      ${escapeHtml(
                        String(
                          invoice.customerName || ''
                        )
                      )}
                    </strong>

                    <br />

                    ${escapeHtml(
                      String(
                        invoice.customerPhone || ''
                      )
                    )}

                  </div>

                </div>

                <div class="info-box">

                  <span class="label">
                    Invoice Details
                  </span>

                  <div class="value">

                    <strong>
                      Invoice Date:
                    </strong>

                    ${escapeHtml(
                      String(
                        invoice.issueDate || ''
                      )
                    )}

                    <br />

                    <strong>
                      Status:
                    </strong>

                    ${escapeHtml(
                      String(
                        invoice.status || ''
                      )
                    )}

                  </div>

                </div>

              </div>

              <!-- ITEMS -->
              <table>

                <thead>
                  <tr>

                    <th>
                      Description
                    </th>

                    <th class="text-center">
                      Qty
                    </th>

                    <th class="text-right">
                      Price
                    </th>

                    <th class="text-right">
                      Total
                    </th>

                  </tr>
                </thead>

                <tbody>

                  ${items
                    .map(
                      (item) => `
                        <tr>

                          <td>
                            ${escapeHtml(
                              String(
                                item.description || ''
                              )
                            )}
                          </td>

                          <td class="text-center">
                            ${Number(
                              item.quantity || 0
                            )}
                          </td>

                          <td class="text-right">
                            £${Number(
                              item.unitPrice || 0
                            ).toFixed(2)}
                          </td>

                          <td class="text-right">
                            £${Number(
                              item.total || 0
                            ).toFixed(2)}
                          </td>

                        </tr>
                      `
                    )
                    .join('')}

                </tbody>

              </table>

              <!-- TOTALS -->
              <div class="totals">

                <div class="total-row">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    £${subtotal.toFixed(2)}
                  </span>

                </div>

                <div class="total-row">

                  <span>
                    Delivery
                  </span>

                  <span>
                    Complimentary
                  </span>

                </div>

                <div class="grand-total">

                  <span>
                    Grand Total
                  </span>

                  <span>
                    £${total.toFixed(2)}
                  </span>

                </div>

              </div>

              <!-- FOOTER -->
              <div class="footer">

                Thank you for choosing
                Meera's Fashion.

                <br />

                Premium fashion, curated for you.

              </div>

            </div>

            <script>

              window.onload = function () {

                setTimeout(function () {

                  window.print();

                  window.onafterprint = function () {
                    window.close();
                  };

                }, 300);

              };

            </script>

          </body>

        </html>
      `);

      printWindow.document.close();

    } catch (error) {

      console.error(
        'Failed to print invoice:',
        error
      );

      alert(
        'Unable to print the invoice. Please try again.'
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
  // MEDIA IMAGE CHANGE
  // ============================================================

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast(
        'Invalid Image',
        'Please select a valid image file.'
      );

      event.target.value = '';

      return;
    }

    try {
      setIsCompressing(true);

      const reader =
        new FileReader();

      reader.onload = () => {
        const result =
          reader.result;

        if (
          typeof result === 'string'
        ) {
          setUploadedImagePreview(
            result
          );

          setCompressionRatio(
            'Image loaded successfully. Your product images are optimized through the product editor.'
          );
        }

        setIsCompressing(false);
      };

      reader.onerror = () => {
        setIsCompressing(false);

        showToast(
          'Image Error',
          'Unable to read this image.'
        );
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error(
        'Image processing failed:',
        error
      );

      setIsCompressing(false);

      showToast(
        'Image Error',
        'Unable to process this image.'
      );
    } finally {
      event.target.value = '';
    }
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
        pendingEnquiriesCount={
          pendingEnquiriesCount
        }
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

              onPrintInvoice={
                handlePrintInvoice
              }
            />
          )}

          {/* ==================================================
              MEDIA
          ================================================== */}

          {activeTab === 'media' && (
            <MediaOptimizerPanel
              uploadedImagePreview={
                uploadedImagePreview
              }

              compressionRatio={
                compressionRatio
              }

              isCompressing={
                isCompressing
              }

              handleImageFileChange={
                handleImageFileChange
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