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
  onSaveEnquiries: (enquiries: EnquiryOrder[]) => void;

  invoices: Invoice[];
  onSaveInvoices: (invoices: Invoice[]) => void;

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
  // ENQUIRY STATUS
  // ============================================================

  const handleRequestEnquiryStatusChange = (
    enquiry: EnquiryOrder,
    newStatus: EnquiryOrder['status']
  ) => {
    if (
      newStatus === 'Cancelled'
    ) {
      setCancellationModal({
        isOpen: true,
        enquiry,
        reason: '',
      });

      return;
    }

    const updatedEnquiries =
      enquiries.map(
        (item) =>
          item.id === enquiry.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
      );

    onSaveEnquiries(
      updatedEnquiries
    );

    showToast(
      'Status Updated',
      `Order ${enquiry.orderNumber || enquiry.id} status changed to ${newStatus}.`
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

  const handleDownloadInvoicePDF = (
    invoice: Invoice
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

      invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>
              Invoice - ${invoice.id}
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
              }

              h1 {
                color: #9E315A;
                margin: 0;
              }

              .header {
                display: flex;
                justify-content: space-between;
                border-bottom:
                  2px solid #9E315A;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }

              .details {
                background: #FFF8FA;
                border: 1px solid #f3dce4;
                border-radius: 12px;
                padding: 20px;
              }

              .total {
                margin-top: 30px;
                padding-top: 20px;
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
                <h1>
                  Meera Fashion
                </h1>

                <p>
                  Official Invoice
                </p>
              </div>

              <div>
                <strong>
                  Invoice:
                </strong>

                ${invoice.id}
              </div>
            </div>

            <div class="details">

              <p>
                <strong>
                  Invoice Number:
                </strong>

                ${invoice.id}
              </p>

              <p>
                <strong>
                  Status:
                </strong>

                ${
                  invoice.status ||
                  '-'
                }
              </p>

              <p>
                <strong>
                  Generated:
                </strong>

                ${new Date().toLocaleDateString(
                  'en-GB',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </p>

            </div>

            <div class="total">
              Total:
              ${
                invoice.total !==
                undefined
                  ? `£${Number(
                      invoice.total
                    ).toFixed(2)}`
                  : '-'
              }
            </div>

            <div class="footer">
              Meera Fashion
              <br />
              Official invoice generated
              from the Admin Portal.
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
        'The invoice has been prepared for printing.'
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
          confirmationModal
        }

        onClose={() =>
          setConfirmationModal(
            null
          )
        }
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