import React, { useState, useRef } from 'react';
import {
  X,
  LayoutDashboard,
  Package,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  Settings,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  Download,
  Printer,
  Upload,
  MessageCircle,
  Eye,
  Sliders,
  DollarSign,
  AlertCircle,
  Store,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Layers,
  Phone,
  Mail,
  Instagram,
  RefreshCw,
  Check,
  AlertTriangle,
  FileCheck,
  Camera,
  Save,
  Menu,
  FileDown,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  Product,
  BrandSettings,
  EnquiryOrder,
  Invoice,
  ProductCategory,
  StockStatus,
  BangleSize,
  ImageBackgroundMode
} from '../../types';
import { Logo } from '../brand/Logo';
import { openWhatsAppChat } from '../../services/whatsapp';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';
import { compressImageFile, formatFileSize } from '../../utils/imageCompressor';

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

interface ConfirmationModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface ToastNotificationConfig {
  show: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const STOCK_UNAVAILABILITY_PRESETS = [
  'Sold Out - Awaiting New Weaving Batch from Kanchipuram',
  'Reserved for Bespoke Bridal Client',
  'Temporary Out of Stock - Restocking Soon',
  'Seasonal Archive / Not in Production',
  'Discontinued Edition',
  'Exclusively Made to Order',
];

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
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'enquiries' | 'sales_history' | 'invoices' | 'media' | 'reports' | 'settings'
  >('dashboard');

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalConfig | null>(null);

  // Cancellation Reason Modal State
  const [cancellationModal, setCancellationModal] = useState<{
    isOpen: boolean;
    enquiry: EnquiryOrder | null;
    reason: string;
  } | null>(null);

  // Order Details Modal State (View Full Details & Invoice)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<EnquiryOrder | null>(null);

  // Toast Notification State
  const [toastNotification, setToastNotification] = useState<ToastNotificationConfig | null>(null);

  // Local Settings form state
  const [localSettings, setLocalSettings] = useState<BrandSettings>({ ...settings });
  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState<boolean>(false);

  // Product Form Modal state
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [currentEditProduct, setCurrentEditProduct] = useState<Partial<Product> | null>(null);
  const [compressingAngle, setCompressingAngle] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{ [key: string]: string }>({});

  // Media Optimizer Upload State
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<string>('Upload any high-res photo to test instant WebP compression & optimization.');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Search & Filter in Products Tab + Pagination (10 per set)
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');
  const [adminProductPage, setAdminProductPage] = useState<number>(1);
  const adminProductsPerPage = 10;

  // Search, Filter & Pagination in Sales History Tab (Supports 100+ sales)
  const [salesHistorySearch, setSalesHistorySearch] = useState('');
  const [salesHistoryStatusFilter, setSalesHistoryStatusFilter] = useState<'all' | 'Paid' | 'Delivered' | 'in_progress' | 'Cancelled'>('all');
  const [salesHistoryPage, setSalesHistoryPage] = useState<number>(1);
  const salesHistoryPerPage = 10;

  // Search & Filter in Invoices Tab
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Logo file input ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productMainImgInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Show Toast helper
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
    setTimeout(() => {
      setToastNotification(prev => (prev?.title === title ? null : prev));
    }, 6000);
  };

  // KPI Calculations
  const totalRevenue = enquiries
    .filter(e => e.status === 'Confirmed' || e.status === 'Paid' || e.status === 'Delivered')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingEnquiriesCount = enquiries.filter(e => e.status === 'New' || e.status === 'Contacted').length;
  const inStockCount = products.filter(p => p.stockStatus === 'In Stock').length;
  const outOfStockCount = products.filter(p => p.stockStatus === 'Out of Stock' || p.stockStatus === 'Unavailable').length;

  // -------------------------------------------------------------
  // Product CRUD Handlers
  // -------------------------------------------------------------
  const handleOpenAddProduct = () => {
    setCurrentEditProduct({
      id: `prod-${Date.now()}`,
      name: '',
      slug: '',
      category: 'sarees',
      subcategory: '',
      price: 0,
      originalPrice: undefined,
      discountPercentage: undefined,
      description: '',
      shortDescription: '',
      material: '',
      color: '',
      stockStatus: 'In Stock',
      unavailabilityReason: '',
      stockQuantity: 1,
      isPreOrder: false,
      isFeatured: false,
      isNewArrival: true,
      isOffer: false,
      isDancePerformance: false,
      backgroundMode: 'blush',
      bangleSizes: [],
      images: {
        main: '',
        front: '',
        back: '',
        detail: '',
        wearing: '',
      },
      saleEnabled: true,
      rentalEnabled: false,
      rentalPricePerDay: 0,
      rentalDeposit: 0,
    });
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setCurrentEditProduct({
      ...prod,
      images: {
        main: prod.images.main,
        front: prod.images.front || '',
        back: prod.images.back || '',
        detail: prod.images.detail || '',
        wearing: prod.images.wearing || '',
      }
    });
    setIsEditingProduct(true);
  };

  // Upload Product Image file handler with auto-compression to high-quality WebP
  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageKey: 'main' | 'front' | 'back' | 'detail' | 'wearing'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setCompressingAngle(imageKey);
        const result = await compressImageFile(file, 1400, 0.82);
        
        setCurrentEditProduct(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            images: {
              ...(prev.images || { main: '' }),
              [imageKey]: result.dataUrl,
            },
          };
        });

        setCompressionStats(prev => ({
          ...prev,
          [imageKey]: `${result.formattedCompressed} (${result.savingsPercentage}% smaller)`,
        }));

        showToast(
          'Photo Compressed & Ready',
          `${imageKey.toUpperCase()} view optimized to ${result.formattedCompressed} (${result.savingsPercentage}% size reduction) and saved.`
        );
      } catch (err) {
        console.error('Image compression failed:', err);
        showToast('Image Error', 'Could not compress this image file. Please try another photo.', 'error');
      } finally {
        setCompressingAngle(null);
        e.target.value = '';
      }
    }
  };

  const handleRemoveProductImage = (imageKey: 'main' | 'front' | 'back' | 'detail' | 'wearing') => {
    setCurrentEditProduct(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        images: {
          ...(prev.images || { main: '' }),
          [imageKey]: '',
        },
      };
    });
    setCompressionStats(prev => {
      const next = { ...prev };
      delete next[imageKey];
      return next;
    });
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    const pName = (currentEditProduct?.name || '').trim();
    if (!currentEditProduct || !pName) {
      showToast('Name Required', 'Please enter a product title.', 'error');
      return;
    }

    // Validation: At least one image (Main photo) is required
    const mainImg = (currentEditProduct.images?.main || '').trim();
    if (!mainImg) {
      showToast(
        'Main Image Required',
        'Please upload at least one image (Main Photo) for this boutique piece.',
        'error'
      );
      return;
    }

    const fullProduct: Product = {
      id: currentEditProduct.id || `prod-${Date.now()}`,
      name: pName,
      slug: currentEditProduct.slug || pName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: (currentEditProduct.category as ProductCategory) || 'sarees',
      subcategory: currentEditProduct.subcategory || 'Silk Sarees',
      price: Number(currentEditProduct.price) || 0,
      originalPrice: Number(currentEditProduct.originalPrice) || undefined,
      discountPercentage: Number(currentEditProduct.discountPercentage) || undefined,
      images: {
        main: currentEditProduct.images.main,
        front: currentEditProduct.images.front || undefined,
        back: currentEditProduct.images.back || undefined,
        detail: currentEditProduct.images.detail || undefined,
        wearing: currentEditProduct.images.wearing || undefined,
      },
      description: currentEditProduct.description || '',
      shortDescription: currentEditProduct.shortDescription || '',
      material: currentEditProduct.material || '',
      color: currentEditProduct.color || '',
      stockStatus: (currentEditProduct.stockStatus as StockStatus) || 'In Stock',
      unavailabilityReason: (currentEditProduct.stockStatus === 'Out of Stock' || currentEditProduct.stockStatus === 'Unavailable')
        ? currentEditProduct.unavailabilityReason || 'Temporarily Out of Stock'
        : undefined,
      stockQuantity: Number(currentEditProduct.stockQuantity) || 0,
      isPreOrder: Boolean(currentEditProduct.isPreOrder),
      isFeatured: Boolean(currentEditProduct.isFeatured),
      isNewArrival: Boolean(currentEditProduct.isNewArrival),
      isOffer: Boolean(currentEditProduct.isOffer),
      isDancePerformance: Boolean(currentEditProduct.isDancePerformance),
      bangleSizes: currentEditProduct.bangleSizes || ['2.2', '2.4', '2.6', '2.8', '3.0'],
      saleEnabled: currentEditProduct.saleEnabled ?? true,
      rentalEnabled: Boolean(currentEditProduct.rentalEnabled),
      rentalPricePerDay: Number(currentEditProduct.rentalPricePerDay) || 0,
      rentalDeposit: Number(currentEditProduct.rentalDeposit) || 0,
      createdAt: currentEditProduct.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exists = products.some(p => p.id === fullProduct.id);
    let updated: Product[];
    if (exists) {
      updated = products.map(p => (p.id === fullProduct.id ? fullProduct : p));
    } else {
      updated = [fullProduct, ...products];
    }

    onSaveProducts(updated);
    setIsEditingProduct(false);
    setCurrentEditProduct(null);
    showToast(
      'Product Saved to Website',
      `"${fullProduct.name}" has been published live to your website catalog.`
    );
  };

  const handleDeleteProduct = (prod: Product) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Boutique Piece',
      message: `Are you sure you want to permanently remove "${prod.name}" from your boutique catalog? This action cannot be undone.`,
      confirmLabel: 'Delete Product',
      isDestructive: true,
      onConfirm: () => {
        const updated = products.filter(p => p.id !== prod.id);
        onSaveProducts(updated);
        setConfirmationModal(null);
        showToast('Product Deleted', `"${prod.name}" was removed.`);
      }
    });
  };

  // Quick Stock Status Toggle from Table
  const handleQuickStockStatusChange = (prodId: string, newStatus: StockStatus) => {
    const targetProd = products.find(p => p.id === prodId);
    if (!targetProd) return;

    setConfirmationModal({
      isOpen: true,
      title: 'Update Stock Status',
      message: `Update status for "${targetProd.name}" to "${newStatus}"?`,
      confirmLabel: 'Confirm Update',
      onConfirm: () => {
        const updated = products.map(p =>
          p.id === prodId
            ? {
                ...p,
                stockStatus: newStatus,
                unavailabilityReason:
                  newStatus === 'Out of Stock' || newStatus === 'Unavailable'
                    ? p.unavailabilityReason || 'Temporarily Out of Stock'
                    : undefined,
              }
            : p
        );
        onSaveProducts(updated);
        setConfirmationModal(null);
        showToast('Stock Status Updated', `"${targetProd.name}" is now marked as ${newStatus}.`);
      }
    });
  };

  // -------------------------------------------------------------
  // Order/Enquiry Workflow Handlers & Automatic Invoicing
  // -------------------------------------------------------------
  const handleRequestEnquiryStatusChange = (
    enquiry: EnquiryOrder,
    newStatus: EnquiryOrder['status']
  ) => {
    if (enquiry.status === newStatus) return;

    // Check if newStatus is 'Cancelled' -> Open clarification modal
    if (newStatus === 'Cancelled') {
      setCancellationModal({
        isOpen: true,
        enquiry,
        reason: 'Customer Changed Mind / Budget Constraint',
      });
      return;
    }

    // Check if newStatus is 'Paid'
    if (newStatus === 'Paid') {
      setConfirmationModal({
        isOpen: true,
        title: 'Confirm Payment & Generate Invoice',
        message: `Mark Order #${enquiry.orderNumber} for ${enquiry.customerName} as "PAID"? This will automatically generate an official invoice in the Invoices section ready for PDF download.`,
        confirmLabel: 'Mark as Paid & Generate Invoice',
        onConfirm: () => {
          // 1. Update enquiry status
          const updatedEnquiries = enquiries.map(e =>
            e.id === enquiry.id ? { ...e, status: 'Paid' as const } : e
          );
          onSaveEnquiries(updatedEnquiries);

          // 2. Generate corresponding invoice
          const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            invoiceNumber: `MF-INV-${new Date().getFullYear()}-${enquiry.orderNumber.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`,
            customerName: enquiry.customerName,
            customerPhone: enquiry.customerPhone,
            customerEmail: enquiry.customerEmail || `${enquiry.customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
            customerAddress: 'London, United Kingdom',
            items: enquiry.items.map(it => ({
              description: `${it.productName}${it.size ? ` (Size: ${it.size})` : ''}`,
              quantity: it.quantity,
              unitPrice: it.price,
              total: it.price * it.quantity,
            })),
            subtotal: enquiry.subtotal || enquiry.total,
            discount: enquiry.discount || 0,
            shipping: 0,
            total: enquiry.total,
            status: 'Paid',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'WhatsApp Verified / Bank Transfer',
          };

          const updatedInvoices = [newInvoice, ...invoices];
          onSaveInvoices(updatedInvoices);

          setConfirmationModal(null);
          showToast(
            'Order Paid & Invoice Generated',
            `Official invoice ${newInvoice.invoiceNumber} created for ${enquiry.customerName}.`,
            'View Invoices',
            () => setActiveTab('invoices')
          );
        }
      });
    } else {
      // Standard confirmation for other statuses
      setConfirmationModal({
        isOpen: true,
        title: 'Update Lead Status',
        message: `Change status of Order #${enquiry.orderNumber} from "${enquiry.status}" to "${newStatus}"?`,
        confirmLabel: 'Confirm Status Change',
        isDestructive: false,
        onConfirm: () => {
          const updated = enquiries.map(e =>
            e.id === enquiry.id ? { ...e, status: newStatus } : e
          );
          onSaveEnquiries(updated);
          setConfirmationModal(null);
          showToast('Status Updated', `Order #${enquiry.orderNumber} is now marked as ${newStatus}.`);
        }
      });
    }
  };

  const handleConfirmCancellation = () => {
    if (!cancellationModal || !cancellationModal.enquiry) return;
    const { enquiry, reason } = cancellationModal;
    const finalReason = (reason || '').trim() || 'Cancelled by admin';
    const updated = enquiries.map(e =>
      e.id === enquiry.id
        ? {
            ...e,
            status: 'Cancelled' as const,
            cancelReason: finalReason,
            cancelledAt: new Date().toISOString(),
          }
        : e
    );
    onSaveEnquiries(updated);
    setCancellationModal(null);
    showToast(
      'Lead Cancelled & Clarification Saved',
      `Order #${enquiry.orderNumber} cancelled. Reason: "${finalReason}"`
    );
  };

  const handleDeleteEnquiry = (enquiry: EnquiryOrder) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete WhatsApp Enquiry',
      message: `Are you sure you want to remove lead #${enquiry.orderNumber} (${enquiry.customerName})?`,
      confirmLabel: 'Delete Lead',
      isDestructive: true,
      onConfirm: () => {
        const updated = enquiries.filter(e => e.id !== enquiry.id);
        onSaveEnquiries(updated);
        setConfirmationModal(null);
        showToast('Lead Removed', `Order #${enquiry.orderNumber} removed.`);
      }
    });
  };

  const handleDeleteInvoice = (inv: Invoice) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Invoice',
      message: `Are you sure you want to delete invoice ${inv.invoiceNumber} for ${inv.customerName}?`,
      confirmLabel: 'Delete Invoice',
      isDestructive: true,
      onConfirm: () => {
        const updated = invoices.filter(i => i.id !== inv.id);
        onSaveInvoices(updated);
        setConfirmationModal(null);
        showToast('Invoice Deleted', `${inv.invoiceNumber} removed from archive.`);
      }
    });
  };

  // Helper to download invoice for any Enquiry/Sale
  const handleDownloadOrderInvoicePdf = (enquiry: EnquiryOrder) => {
    const existing = invoices.find(i => i.enquiryId === enquiry.id || i.invoiceNumber.includes(enquiry.orderNumber.replace(/[^0-9]/g, '')));
    if (existing) {
      handleDownloadInvoicePDF(existing);
      return;
    }

    // Build virtual invoice on the fly
    const virtualInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `MF-INV-${new Date().getFullYear()}-${enquiry.orderNumber.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`,
      customerName: enquiry.customerName,
      customerPhone: enquiry.customerPhone,
      customerEmail: enquiry.customerEmail || 'customer@meerasfashion.co.uk',
      customerAddress: 'London, United Kingdom',
      items: enquiry.items.map(it => ({
        description: `${it.productName}${it.size ? ` (Size: ${it.size})` : ''}`,
        quantity: it.quantity,
        unitPrice: it.price,
        total: it.price * it.quantity,
      })),
      subtotal: enquiry.subtotal || enquiry.total,
      discount: enquiry.discount || 0,
      shipping: 0,
      total: enquiry.total,
      status: enquiry.status === 'Paid' ? 'Paid' : 'Sent',
      issueDate: new Date(enquiry.createdAt).toISOString().split('T')[0],
      dueDate: new Date(enquiry.createdAt).toISOString().split('T')[0],
      paymentMethod: enquiry.status === 'Paid' ? 'WhatsApp Verified / Bank Transfer' : 'Direct Order',
    };

    handleDownloadInvoicePDF(virtualInvoice);
  };

  // -------------------------------------------------------------
  // Invoice PDF Generator
  // -------------------------------------------------------------
  const handleDownloadInvoicePDF = (inv: Invoice) => {
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(158, 49, 90); // #9E315A
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text((settings.brandName || "MEERA'S FASHION").toUpperCase(), 15, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.tagline || "Traditional Clothing & Jewelleries | London, UK", 15, 26);
    doc.text(`Phone: ${settings.formattedPhone || settings.phone} | ${settings.email}`, 15, 32);

    // Invoice Meta
    doc.setTextColor(36, 27, 32);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE: ${inv.invoiceNumber}`, 15, 50);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue Date: ${inv.issueDate}`, 15, 57);
    doc.text(`Payment Status: ${inv.status.toUpperCase()}`, 15, 63);
    if (inv.paymentMethod) {
      doc.text(`Method: ${inv.paymentMethod}`, 15, 69);
    }

    // Customer Info Box
    doc.setDrawColor(248, 221, 231);
    doc.setFillColor(255, 245, 248);
    doc.roundedRect(120, 44, 75, 28, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Billed To:", 125, 51);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.customerName || "Valued Customer", 125, 58);
    doc.text(inv.customerPhone || "", 125, 64);
    doc.text(inv.customerEmail || "", 125, 69);

    // Table Header
    doc.setFillColor(248, 221, 231);
    doc.rect(15, 80, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text("Description", 20, 85);
    doc.text("Qty", 120, 85);
    doc.text("Unit Price", 140, 85);
    doc.text("Total", 175, 85);

    // Items
    let y = 94;
    doc.setFont('helvetica', 'normal');
    inv.items.forEach((item) => {
      doc.text(item.description || "Boutique Item", 20, y);
      doc.text(String(item.quantity), 122, y);
      doc.text(`£${Number(item.unitPrice).toFixed(2)}`, 142, y);
      doc.text(`£${Number(item.total).toFixed(2)}`, 175, y);
      y += 8;
    });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y + 2, 195, y + 2);

    // Totals
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("Subtotal:", 140, y);
    doc.text(`£${Number(inv.subtotal).toFixed(2)}`, 175, y);

    if (inv.discount && inv.discount > 0) {
      y += 6;
      doc.setTextColor(158, 49, 90);
      doc.text("Discount:", 140, y);
      doc.text(`-£${Number(inv.discount).toFixed(2)}`, 175, y);
      doc.setTextColor(36, 27, 32);
    }

    y += 6;
    doc.text("UK Royal Mail Delivery:", 140, y);
    doc.text(inv.shipping === 0 ? "FREE" : `£${Number(inv.shipping).toFixed(2)}`, 175, y);

    y += 8;
    doc.setFontSize(13);
    doc.setTextColor(158, 49, 90);
    doc.text("Grand Total:", 140, y);
    doc.text(`£${Number(inv.total).toFixed(2)}`, 175, y);

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text("Thank you for choosing Meera's Fashion for your celebration.", 15, 268);
    doc.text(`Official WhatsApp Concierge: +${settings.whatsappNumber} | Free Tracked Delivery`, 15, 274);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("Digital Boutique Platform Engineered by NeirahTech", 15, 280);

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  // -------------------------------------------------------------
  // Settings Handlers & Logo Upload
  // -------------------------------------------------------------
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoDataUrl = event.target?.result as string;
        setLocalSettings(prev => ({ ...prev, customLogoUrl: logoDataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBoutiqueSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(localSettings);
    setSettingsSavedFeedback(true);
    setTimeout(() => setSettingsSavedFeedback(false), 4000);
    showToast(
      'Settings Updated',
      'Boutique profile, brand logo, and contact info saved across your website.'
    );
  };

  // -------------------------------------------------------------
  // Image Optimizer & Compressor
  // -------------------------------------------------------------
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsCompressing(true);
      try {
        const result = await compressImageFile(file, 1400, 0.82);
        setUploadedImagePreview(result.dataUrl);
        setCompressionRatio(
          `Original: ${result.formattedOriginal} → WebP: ${result.formattedCompressed} (${result.savingsPercentage}% size reduction, ${result.width}×${result.height}px)`
        );
        showToast('Image Optimized', `Successfully compressed from ${result.formattedOriginal} to ${result.formattedCompressed} WebP.`);
      } catch (err) {
        console.error(err);
        showToast('Compression Error', 'Could not optimize this image.', 'error');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#120B0F] text-[#241B20] flex flex-col md:flex-row p-2 sm:p-3 md:p-4 lg:p-5 gap-3 lg:gap-5 overflow-hidden animate-fadeIn select-none box-border w-screen h-screen max-w-full">
      
      {/* ========================================================
          1. FLOATING LUXURY SIDEBAR DOCK (Desktop & Tablet)
         ======================================================== */}
      <aside className="w-56 lg:w-64 bg-[#1C1217]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 lg:p-5 flex flex-col justify-between shadow-2xl shadow-black/60 shrink-0 hidden md:flex h-full min-h-0">
        
        {/* Top: Brand & Portal Badge */}
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

          {/* Navigation Items in Floating Dock - No visible scroller */}
          <nav className="space-y-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-220px)]">
            
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              id="admin-nav-dashboard"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
              {activeTab === 'dashboard' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* 2. Products */}
            <button
              onClick={() => setActiveTab('products')}
              id="admin-nav-products"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Products &amp; Stock</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/10 text-rose-100">
                {products.length}
              </span>
            </button>

            {/* 3. WhatsApp Enquiries */}
            <button
              onClick={() => setActiveTab('enquiries')}
              id="admin-nav-enquiries"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Leads</span>
              </div>
              {pendingEnquiriesCount > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#25D366] text-white">
                  {pendingEnquiriesCount} New
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/10 text-rose-100">
                  {enquiries.length}
                </span>
              )}
            </button>

            {/* 4. Sales History */}
            <button
              onClick={() => setActiveTab('sales_history')}
              id="admin-nav-sales-history"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'sales_history'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4" />
                <span>Sales History</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/10 text-rose-100">
                {enquiries.length}
              </span>
            </button>

            {/* 5. Invoices */}
            <button
              onClick={() => setActiveTab('invoices')}
              id="admin-nav-invoices"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Invoices (PDF)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/10 text-rose-100">
                {invoices.length}
              </span>
            </button>

            {/* 6. Image Studio */}
            <button
              onClick={() => setActiveTab('media')}
              id="admin-nav-media"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4" />
                <span>Image Studio</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-rose-300 bg-rose-900/40 px-1.5 py-0.5 rounded-md">
                WebP
              </span>
            </button>

            {/* 7. Sales Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              id="admin-nav-reports"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                <span>Sales Reports</span>
              </div>
            </button>

            {/* 8. Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              id="admin-nav-settings"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#9E315A] to-[#C94F7C] text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'text-rose-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Boutique Settings</span>
              </div>
            </button>

          </nav>
        </div>

        {/* Bottom Profile & WhatsApp concierge quick test */}
        <div className="pt-4 border-t border-white/10 space-y-2.5">
          <button
            onClick={() => openWhatsAppChat(settings.whatsappNumber, "Hello Meera Fashion Concierge Test.")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Test WhatsApp Concierge</span>
          </button>

          <div className="text-center space-y-1">
            <p className="text-[10px] text-rose-200/50 font-mono">
              Meera Fashion CMS • London UK
            </p>
            <p className="text-[10px] text-rose-200/80">
              Developed by <span className="font-bold text-white tracking-wide">NeirahTech</span>
            </p>
          </div>
        </div>

      </aside>

      {/* ========================================================
          2. MAIN WORKSPACE CONTAINER (Responsive Elevation)
         ======================================================== */}
      <main className="flex-1 min-w-0 h-full bg-[#FAF6F8] rounded-2xl sm:rounded-3xl border border-rose-200/70 overflow-hidden flex flex-col shadow-2xl">
        
        {/* Workspace Top Header Bar */}
        <header className="px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-rose-200/60 flex items-center justify-between shrink-0 shadow-2xs gap-3">
          
          {/* Left Title & Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-rose-50 text-[#9E315A] border border-rose-200/60 shrink-0">
              {activeTab === 'dashboard' && <LayoutDashboard className="w-4 h-4" />}
              {activeTab === 'products' && <Package className="w-4 h-4" />}
              {activeTab === 'enquiries' && <MessageCircle className="w-4 h-4" />}
              {activeTab === 'sales_history' && <FileCheck className="w-4 h-4" />}
              {activeTab === 'invoices' && <FileText className="w-4 h-4" />}
              {activeTab === 'media' && <ImageIcon className="w-4 h-4" />}
              {activeTab === 'reports' && <TrendingUp className="w-4 h-4" />}
              {activeTab === 'settings' && <Settings className="w-4 h-4" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8C5D6C] font-bold">
                <span className="hidden sm:inline">Admin</span>
                <span className="hidden sm:inline text-rose-300">•</span>
                <span className="font-serif font-bold text-[#9E315A] capitalize truncate">
                  {activeTab === 'dashboard'
                    ? 'Overview'
                    : activeTab === 'sales_history'
                    ? 'Sales History'
                    : activeTab}
                </span>
              </div>
              <h2 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#241B20] truncate">
                {activeTab === 'dashboard' && 'Executive Performance & Sales Overview'}
                {activeTab === 'products' && 'Inventory, Pricing & Stock Catalog'}
                {activeTab === 'enquiries' && 'WhatsApp Orders & Live Concierge Messages'}
                {activeTab === 'sales_history' && 'Sales History, Order Archive & PDF Invoices'}
                {activeTab === 'invoices' && 'Official Invoices & PDF Generator'}
                {activeTab === 'media' && 'Image Studio & WebP Optimizer'}
                {activeTab === 'reports' && 'Sales Analytics & Category Breakdown'}
                {activeTab === 'settings' && 'Boutique Profile, Logo & Contact Info'}
              </h2>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddProduct}
                id="top-add-product-btn"
                className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] text-white px-3 sm:px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Add Piece</span>
              </button>
            )}

            {activeTab === 'settings' && (
              <button
                onClick={() => handleSaveBoutiqueSettings()}
                id="top-save-settings-btn"
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer ${
                  settingsSavedFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#9E315A] hover:bg-[#832247] text-white'
                }`}
              >
                {settingsSavedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{settingsSavedFeedback ? 'Saved!' : 'Save Changes'}</span>
              </button>
            )}

            {/* Quick Exit Back to Storefront */}
            <button
              onClick={onClose}
              id="top-exit-storefront-btn"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white hover:bg-rose-50 border border-rose-200 text-[#241B20] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Return to Customer Storefront"
            >
              <Store className="w-3.5 h-3.5 text-[#9E315A]" />
              <span className="hidden sm:inline">Back to Store</span>
              <span className="sm:hidden">Exit</span>
            </button>

          </div>

        </header>

        {/* MOBILE RESPONSIVE TAB BAR (Horizontal Scrolling on mobile & tablets) */}
        <div className="md:hidden bg-white/90 border-b border-rose-100 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'enquiries', label: `Leads (${pendingEnquiriesCount || enquiries.length})`, icon: MessageCircle },
            { id: 'sales_history', label: `Sales History (${enquiries.length})`, icon: FileCheck },
            { id: 'invoices', label: `Invoices (${invoices.length})`, icon: FileText },
            { id: 'media', label: 'Studio', icon: ImageIcon },
            { id: 'reports', label: 'Reports', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#9E315A] text-white shadow-xs'
                    : 'bg-rose-50 text-[#5A4550] hover:bg-rose-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Workspace Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">

          {/* --------------------------------------------------------
              TAB 1: EXECUTIVE DASHBOARD
             -------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* 1. Total Revenue */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">
                      Gross Revenue
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#9E315A]">
                      £{totalRevenue.toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      ✓ WhatsApp Verified Sales
                    </p>
                  </div>
                </div>

                {/* 2. Active WhatsApp Leads */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">
                      Active Leads
                    </span>
                    <div className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366]">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#241B20]">
                      {pendingEnquiriesCount} Pending
                    </h3>
                    <p className="text-[11px] text-[#8C5D6C] mt-0.5">
                      {enquiries.length} total customer orders
                    </p>
                  </div>
                </div>

                {/* 3. In Stock Units */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">
                      Inventory Status
                    </span>
                    <div className="p-2 rounded-xl bg-rose-50 text-[#9E315A]">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#241B20]">
                      {inStockCount} In Stock
                    </h3>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      {outOfStockCount} Out of Stock / Unavailable
                    </p>
                  </div>
                </div>

                {/* 4. Issued Invoices */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C5D6C] uppercase tracking-wider">
                      Invoices Archive
                    </span>
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#241B20]">
                      {invoices.length} Bills
                    </h3>
                    <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                      PDF Export Ready
                    </p>
                  </div>
                </div>

              </div>

              {/* Quick Jump Modules */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Recent WhatsApp Leads */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#9E315A]" />
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#241B20]">
                        Recent WhatsApp Orders
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('enquiries')}
                      className="text-xs font-bold text-[#9E315A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View All ({enquiries.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {enquiries.slice(0, 4).map(enq => (
                      <div
                        key={enq.id}
                        className="p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100/70 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#9E315A]">
                              {enq.orderNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              enq.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : enq.status === 'New'
                                ? 'bg-rose-100 text-[#9E315A]'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {enq.status}
                            </span>
                          </div>
                          <p className="font-serif font-bold text-xs text-[#241B20] mt-0.5 truncate">
                            {enq.customerName} • {enq.customerPhone}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-serif font-bold text-sm text-[#9E315A]">
                            £{enq.total}
                          </span>
                          <button
                            onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera Fashion regarding your order #${enq.orderNumber}.`)}
                            className="block text-[10px] text-[#25D366] font-bold hover:underline"
                          >
                            Reply WhatsApp
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catalog Quick Stock Overview */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#9E315A]" />
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#241B20]">
                        Inventory Overview
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-bold text-[#9E315A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Manage Products</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {products.slice(0, 4).map(prod => (
                      <div
                        key={prod.id}
                        className="p-2.5 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between gap-3"
                      >
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
                            <p className="font-serif font-bold text-xs text-[#241B20] truncate">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-[#8C5D6C]">
                              {prod.category.toUpperCase()} • £{prod.price}
                            </p>
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
                          }`}>
                            {prod.stockStatus}
                          </span>

                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-[#9E315A] hover:bg-rose-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* --------------------------------------------------------
              TAB 2: PRODUCTS & STOCKS MANAGEMENT
             -------------------------------------------------------- */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Product Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">
                
                {/* Search Bar */}
                <div className="flex items-center gap-2 bg-[#FFF5F8] px-3.5 py-2 rounded-2xl border border-rose-200/80 flex-1">
                  <Search className="w-4 h-4 text-[#9E315A] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by piece name, fabric, color, ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full placeholder:text-rose-300"
                  />
                  {productSearch && (
                    <button onClick={() => setProductSearch('')} className="p-1 text-rose-400 hover:text-rose-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-white border border-rose-200 text-xs font-semibold text-[#241B20] px-3 py-2 rounded-2xl outline-none shadow-2xs"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    <option value="sarees">Sarees</option>
                    <option value="jewellery">Jewellery &amp; Bangles</option>
                    <option value="performance">Dance Performance Edit</option>
                    <option value="lehengas">Lehengas</option>
                    <option value="shalwar">Shalwar</option>
                  </select>

                  <select
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value)}
                    className="bg-white border border-rose-200 text-xs font-semibold text-[#241B20] px-3 py-2 rounded-2xl outline-none shadow-2xs"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Pre-Order">Pre-Order</option>
                  </select>

                  <button
                    onClick={handleOpenAddProduct}
                    className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Piece</span>
                  </button>
                </div>
              </div>

              {/* Products Table Card */}
              <div className="bg-white rounded-3xl border border-rose-100/90 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-[#FFF5F8] border-b border-rose-100 text-[#8C5D6C] uppercase font-bold text-[10px]">
                        <th className="p-4">Piece</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock Status &amp; Reason</th>
                        <th className="p-4">Bangle Sizes</th>
                        <th className="p-4">Badges</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {(() => {
                        const filtered = products
                          .filter(p => productCategoryFilter === 'all' || p.category === productCategoryFilter)
                          .filter(p => productStockFilter === 'all' || p.stockStatus === productStockFilter)
                          .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.color.toLowerCase().includes(productSearch.toLowerCase()) || p.material.toLowerCase().includes(productSearch.toLowerCase()));
                        
                        const startIdx = (adminProductPage - 1) * adminProductsPerPage;
                        const paged = filtered.slice(startIdx, startIdx + adminProductsPerPage);

                        if (paged.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-[#8C5D6C]">
                                <Package className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                                <p className="font-serif font-bold text-sm text-[#241B20]">No pieces found</p>
                                <p className="text-xs">Try adjusting your search query or filters</p>
                              </td>
                            </tr>
                          );
                        }

                        return paged.map((prod) => (
                          <tr key={prod.id} className="hover:bg-rose-50/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getOptimizedImageUrl(prod.images.main, { width: 120, quality: 60 })}
                                  alt={prod.name}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleImageError(e, 'general')}
                                  className="w-12 h-14 rounded-xl object-cover border border-rose-200/80 shadow-2xs shrink-0"
                                />
                                <div>
                                  <p className="font-serif font-bold text-sm text-[#241B20] line-clamp-1">{prod.name}</p>
                                  <p className="text-[10px] text-[#8C5D6C]">{prod.color} • {prod.material}</p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 uppercase text-[10px] font-bold text-[#9E315A]">
                              {prod.category}
                            </td>

                            <td className="p-4 font-serif font-bold text-sm text-[#241B20]">
                              £{prod.price}
                              {prod.originalPrice && (
                                <span className="text-[10px] text-rose-300 line-through ml-1 font-light">
                                  £{prod.originalPrice}
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    prod.stockStatus === 'In Stock'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : prod.stockStatus === 'Pre-Order'
                                      ? 'bg-purple-100 text-purple-800'
                                      : prod.stockStatus === 'Out of Stock'
                                      ? 'bg-gray-800 text-white'
                                      : prod.stockStatus === 'Unavailable'
                                      ? 'bg-rose-900 text-rose-100'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {prod.stockStatus}
                                  </span>

                                  {/* Quick toggle dropdown */}
                                  <select
                                    value={prod.stockStatus}
                                    onChange={(e) => handleQuickStockStatusChange(prod.id, e.target.value as StockStatus)}
                                    className="bg-transparent border border-rose-200 rounded text-[9px] text-[#5A4550] px-1 py-0.5 outline-none cursor-pointer"
                                    title="Quick change status"
                                  >
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                    <option value="Unavailable">Unavailable</option>
                                    <option value="Pre-Order">Pre-Order</option>
                                  </select>
                                </div>

                                {prod.unavailabilityReason && (
                                  <p className="text-[10px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 max-w-[200px] truncate" title={prod.unavailabilityReason}>
                                    Note: {prod.unavailabilityReason}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              {prod.bangleSizes ? (
                                <span className="text-[10px] text-[#5A4550]">
                                  {prod.bangleSizes.join(', ')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">Standard</span>
                              )}
                            </td>

                            <td className="p-4 space-x-1">
                              {prod.isOffer && (
                                <span className="bg-rose-100 text-[#9E315A] text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  Sale
                                </span>
                              )}
                              {prod.isDancePerformance && (
                                <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  Dance
                                </span>
                              )}
                              {prod.isNewArrival && (
                                <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-2 text-[#3E2F37] hover:text-[#9E315A] hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                                  title="Edit Product & Upload Images"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod)}
                                  className="p-2 text-rose-400 hover:text-red-700 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                                  title="Delete Piece"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Products Pagination Footer (Shows 10 per set) */}
                {(() => {
                  const filtered = products
                    .filter(p => productCategoryFilter === 'all' || p.category === productCategoryFilter)
                    .filter(p => productStockFilter === 'all' || p.stockStatus === productStockFilter)
                    .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.color.toLowerCase().includes(productSearch.toLowerCase()) || p.material.toLowerCase().includes(productSearch.toLowerCase()));
                  
                  const totalPages = Math.ceil(filtered.length / adminProductsPerPage) || 1;
                  const startItem = filtered.length === 0 ? 0 : (adminProductPage - 1) * adminProductsPerPage + 1;
                  const endItem = Math.min(adminProductPage * adminProductsPerPage, filtered.length);

                  return (
                    <div className="px-5 py-3.5 bg-[#FFF8FA] border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="text-[#8C5D6C]">
                        Showing <strong className="text-[#241B20]">{startItem}–{endItem}</strong> of <strong className="text-[#241B20]">{filtered.length}</strong> pieces (10 per page)
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setAdminProductPage(prev => Math.max(1, prev - 1))}
                            disabled={adminProductPage <= 1}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 cursor-pointer transition-all"
                          >
                            Previous Page
                          </button>

                          <div className="flex items-center gap-1 px-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                              <button
                                key={pageNum}
                                onClick={() => setAdminProductPage(pageNum)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  adminProductPage === pageNum
                                    ? 'bg-[#9E315A] text-white shadow-xs'
                                    : 'bg-white text-[#5A4550] hover:bg-rose-50 border border-rose-200'
                                }`}
                              >
                                {pageNum}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setAdminProductPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={adminProductPage >= totalPages}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 cursor-pointer transition-all"
                          >
                            Next Page
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* --------------------------------------------------------
              TAB 3: WHATSAPP ENQUIRIES & CONCIERGE LEADS
             -------------------------------------------------------- */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#9E315A]" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#241B20]">
                      Active WhatsApp Orders &amp; Inquiries ({enquiries.length})
                    </h3>
                    <p className="text-xs text-[#8C5D6C]">
                      Real-time customer selections sent from website &amp; concierge bookings
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('sales_history')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-[#9E315A] text-xs font-bold border border-rose-200 transition-all cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Open Sales History Table</span>
                </button>
              </div>

              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-rose-50 text-[#9E315A] px-3 py-1 rounded-full border border-rose-200/60">
                          {enq.orderNumber}
                        </span>
                        <span className="text-xs text-rose-300">•</span>
                        <span className="text-xs text-[#8C5D6C]">
                          {new Date(enq.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          enq.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enq.status === 'New'
                            ? 'bg-rose-100 text-[#9E315A]'
                            : enq.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : enq.status === 'Delivered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Status: {enq.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-base text-[#241B20]">
                          {enq.customerName}
                        </h4>
                        <p className="text-xs text-[#5A4550]">
                          WhatsApp Phone: <strong>{enq.customerPhone}</strong>
                        </p>
                      </div>

                      {/* Items */}
                      <div className="bg-[#FFF8FA] p-3 rounded-2xl text-xs space-y-1.5 border border-rose-100/70">
                        {enq.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[#3E2F37]">
                            <span>• {it.quantity}x {it.productName} {it.size ? `(Size: ${it.size})` : ''}</span>
                            <span className="font-bold text-[#9E315A]">£{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Cancellation Clarification Banner if Cancelled */}
                      {enq.status === 'Cancelled' && (
                        <div className="p-3 rounded-2xl bg-red-50/80 border border-red-200 text-xs text-red-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-red-700">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Lead Cancelled Clarification:</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">
                            {enq.cancelReason || 'Customer did not proceed with the WhatsApp booking.'}
                          </p>
                          {enq.cancelledAt && (
                            <p className="text-[10px] text-red-500 font-mono">
                              Cancelled at: {new Date(enq.cancelledAt).toLocaleString('en-GB')}
                            </p>
                          )}
                        </div>
                      )}

                      {enq.notes && (
                        <p className="text-[11px] text-[#8C5D6C] italic bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                          Note: "{enq.notes}"
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col sm:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-rose-100">
                      
                      {/* Status Selector with confirmation */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#8C5D6C]">Update Status:</span>
                        <select
                          value={enq.status}
                          onChange={(e) => handleRequestEnquiryStatusChange(enq, e.target.value as any)}
                          className="bg-rose-50 border border-rose-200 text-xs font-bold text-[#9E315A] px-3 py-1.5 rounded-xl outline-none cursor-pointer"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Paid">Paid (Generates Invoice)</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-[#8C5D6C] uppercase font-bold">Total Order Value</span>
                        <p className="font-serif font-bold text-2xl text-[#9E315A]">£{enq.total}</p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                        <button
                          onClick={() => setSelectedOrderDetails(enq)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-[#241B20] text-xs font-bold rounded-full transition-all cursor-pointer"
                          title="View Full Order Details & Invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#9E315A]" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => handleDownloadOrderInvoicePdf(enq)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#9E315A] text-xs font-bold rounded-full transition-all cursor-pointer"
                          title="Download Official PDF Invoice"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF Invoice</span>
                        </button>

                        <button
                          onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera from Meera's Fashion regarding your order #${enq.orderNumber}.`)}
                          className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleDeleteEnquiry(enq)}
                          className="p-2 text-rose-400 hover:text-red-700 hover:bg-rose-100 rounded-full transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* --------------------------------------------------------
              TAB: SALES HISTORY & ORDER ARCHIVE (For 100+ Sales Scale)
             -------------------------------------------------------- */}
          {activeTab === 'sales_history' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Sales Overview Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-[#8C5D6C] text-xs">
                    <span>Total Sales &amp; Leads</span>
                    <FileCheck className="w-4 h-4 text-[#9E315A]" />
                  </div>
                  <p className="font-serif font-bold text-2xl text-[#241B20]">{enquiries.length}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">100+ Scale Archive Enabled</p>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-[#8C5D6C] text-xs">
                    <span>Total Sales Value</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="font-serif font-bold text-2xl text-[#9E315A]">
                    £{enquiries.reduce((acc, curr) => acc + (curr.status !== 'Cancelled' ? curr.total : 0), 0)}
                  </p>
                  <p className="text-[10px] text-[#8C5D6C]">Excluding cancelled leads</p>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-[#8C5D6C] text-xs">
                    <span>Paid &amp; Invoiced</span>
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="font-serif font-bold text-2xl text-blue-900">
                    {enquiries.filter(e => e.status === 'Paid' || e.status === 'Delivered').length}
                  </p>
                  <p className="text-[10px] text-blue-700 font-semibold">Completed orders</p>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-[#8C5D6C] text-xs">
                    <span>Cancelled Leads</span>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="font-serif font-bold text-2xl text-red-700">
                    {enquiries.filter(e => e.status === 'Cancelled').length}
                  </p>
                  <p className="text-[10px] text-red-600">With clarified reasons</p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">
                
                {/* Search */}
                <div className="flex items-center gap-2 bg-[#FFF5F8] px-3.5 py-2 rounded-2xl border border-rose-200/80 flex-1">
                  <Search className="w-4 h-4 text-[#9E315A] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by order #, customer name, phone, item name..."
                    value={salesHistorySearch}
                    onChange={(e) => setSalesHistorySearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full placeholder:text-rose-300"
                  />
                  {salesHistorySearch && (
                    <button onClick={() => setSalesHistorySearch('')} className="p-1 text-rose-400 hover:text-rose-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {(['all', 'Paid', 'Delivered', 'in_progress', 'Cancelled'] as const).map((filterType) => {
                    const label =
                      filterType === 'all'
                        ? 'All Records'
                        : filterType === 'in_progress'
                        ? 'In Progress'
                        : filterType;
                    const isActive = salesHistoryStatusFilter === filterType;
                    return (
                      <button
                        key={filterType}
                        onClick={() => {
                          setSalesHistoryStatusFilter(filterType);
                          setSalesHistoryPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                          isActive
                            ? 'bg-[#9E315A] text-white shadow-xs'
                            : 'bg-rose-50 text-[#8C5D6C] hover:bg-rose-100 border border-rose-200/60'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Sales History Data Table Card */}
              <div className="bg-white rounded-3xl border border-rose-100/90 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[850px]">
                    <thead>
                      <tr className="bg-[#FFF5F8] border-b border-rose-100 text-[#8C5D6C] uppercase font-bold text-[10px]">
                        <th className="p-4">Order # &amp; Date</th>
                        <th className="p-4">Customer &amp; Phone</th>
                        <th className="p-4">Items Summary</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Progress Status</th>
                        <th className="p-4">Clarification / Note</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {(() => {
                        const filtered = enquiries.filter(enq => {
                          if (salesHistoryStatusFilter === 'all') return true;
                          if (salesHistoryStatusFilter === 'in_progress') {
                            return ['New', 'Contacted', 'Confirmed', 'Preparing'].includes(enq.status);
                          }
                          return enq.status === salesHistoryStatusFilter;
                        }).filter(enq => {
                          if (!salesHistorySearch) return true;
                          const q = salesHistorySearch.toLowerCase();
                          const matchesOrder = enq.orderNumber.toLowerCase().includes(q);
                          const matchesCust = enq.customerName.toLowerCase().includes(q);
                          const matchesPhone = enq.customerPhone.toLowerCase().includes(q);
                          const matchesItems = enq.items.some(it => it.productName.toLowerCase().includes(q));
                          return matchesOrder || matchesCust || matchesPhone || matchesItems;
                        });

                        const startIdx = (salesHistoryPage - 1) * salesHistoryPerPage;
                        const paged = filtered.slice(startIdx, startIdx + salesHistoryPerPage);

                        if (paged.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="p-10 text-center text-[#8C5D6C]">
                                <FileCheck className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                                <p className="font-serif font-bold text-sm text-[#241B20]">No sales history found</p>
                                <p className="text-xs">Try adjusting your filters or search keywords</p>
                              </td>
                            </tr>
                          );
                        }

                        return paged.map((enq) => (
                          <tr key={enq.id} className="hover:bg-rose-50/40 transition-colors">
                            
                            {/* Order # and Date */}
                            <td className="p-4">
                              <span className="font-mono font-bold text-[#9E315A] block">
                                {enq.orderNumber}
                              </span>
                              <span className="text-[10px] text-[#8C5D6C]">
                                {new Date(enq.createdAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>

                            {/* Customer & Phone */}
                            <td className="p-4">
                              <p className="font-serif font-bold text-[#241B20]">{enq.customerName}</p>
                              <button
                                onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera from Meera's Fashion regarding order #${enq.orderNumber}.`)}
                                className="text-[10px] text-[#25D366] font-bold hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                              >
                                <MessageCircle className="w-3 h-3 fill-[#25D366] text-[#25D366]" />
                                <span>{enq.customerPhone}</span>
                              </button>
                            </td>

                            {/* Items Summary */}
                            <td className="p-4">
                              <span className="font-semibold text-[#241B20] block">
                                {enq.items.length} {enq.items.length === 1 ? 'piece' : 'pieces'}
                              </span>
                              <p className="text-[10px] text-[#8C5D6C] max-w-[200px] truncate" title={enq.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}>
                                {enq.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                              </p>
                            </td>

                            {/* Amount */}
                            <td className="p-4 font-serif font-bold text-sm text-[#9E315A]">
                              £{enq.total}
                            </td>

                            {/* Progress Status */}
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                                enq.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : enq.status === 'Delivered'
                                  ? 'bg-blue-100 text-blue-800'
                                  : enq.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : enq.status === 'New'
                                  ? 'bg-rose-100 text-[#9E315A]'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {enq.status}
                              </span>
                            </td>

                            {/* Clarification or Notes */}
                            <td className="p-4 max-w-[220px]">
                              {enq.status === 'Cancelled' ? (
                                <div className="text-[11px] text-red-700 bg-red-50 p-1.5 rounded-lg border border-red-200">
                                  <strong className="block text-[9px] uppercase tracking-wider text-red-800 font-bold">Cancellation Reason:</strong>
                                  <span className="line-clamp-2" title={enq.cancelReason || 'Cancelled without note'}>
                                    {enq.cancelReason || 'Customer did not complete WhatsApp order.'}
                                  </span>
                                </div>
                              ) : enq.notes ? (
                                <p className="text-[11px] text-[#8C5D6C] italic line-clamp-2" title={enq.notes}>
                                  "{enq.notes}"
                                </p>
                              ) : (
                                <span className="text-[10px] text-gray-400">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* View Full Details Button */}
                                <button
                                  onClick={() => setSelectedOrderDetails(enq)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-[#9E315A] rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  title="View Full Order Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Details</span>
                                </button>

                                {/* Download PDF Invoice */}
                                <button
                                  onClick={() => handleDownloadOrderInvoicePdf(enq)}
                                  className="p-1.5 text-[#9E315A] hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/60"
                                  title="Download Official PDF Invoice"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Reply on WhatsApp */}
                                <button
                                  onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera from Meera's Fashion regarding order #${enq.orderNumber}.`)}
                                  className="p-1.5 text-[#25D366] hover:bg-emerald-50 rounded-xl transition-all cursor-pointer border border-emerald-200"
                                  title="Reply on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>

                              </div>
                            </td>

                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Sales History Pagination Footer (Shows 10 per set) */}
                {(() => {
                  const filtered = enquiries.filter(enq => {
                    if (salesHistoryStatusFilter === 'all') return true;
                    if (salesHistoryStatusFilter === 'in_progress') {
                      return ['New', 'Contacted', 'Confirmed', 'Preparing'].includes(enq.status);
                    }
                    return enq.status === salesHistoryStatusFilter;
                  }).filter(enq => {
                    if (!salesHistorySearch) return true;
                    const q = salesHistorySearch.toLowerCase();
                    const matchesOrder = enq.orderNumber.toLowerCase().includes(q);
                    const matchesCust = enq.customerName.toLowerCase().includes(q);
                    const matchesPhone = enq.customerPhone.toLowerCase().includes(q);
                    const matchesItems = enq.items.some(it => it.productName.toLowerCase().includes(q));
                    return matchesOrder || matchesCust || matchesPhone || matchesItems;
                  });

                  const totalPages = Math.ceil(filtered.length / salesHistoryPerPage) || 1;
                  const startItem = filtered.length === 0 ? 0 : (salesHistoryPage - 1) * salesHistoryPerPage + 1;
                  const endItem = Math.min(salesHistoryPage * salesHistoryPerPage, filtered.length);

                  return (
                    <div className="px-5 py-3.5 bg-[#FFF8FA] border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="text-[#8C5D6C]">
                        Showing <strong className="text-[#241B20]">{startItem}–{endItem}</strong> of <strong className="text-[#241B20]">{filtered.length}</strong> records (10 per set)
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSalesHistoryPage(prev => Math.max(1, prev - 1))}
                            disabled={salesHistoryPage <= 1}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 cursor-pointer transition-all"
                          >
                            Previous Set
                          </button>

                          <div className="flex items-center gap-1 px-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                              <button
                                key={pageNum}
                                onClick={() => setSalesHistoryPage(pageNum)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  salesHistoryPage === pageNum
                                    ? 'bg-[#9E315A] text-white shadow-xs'
                                    : 'bg-white text-[#5A4550] hover:bg-rose-50 border border-rose-200'
                                }`}
                              >
                                {pageNum}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setSalesHistoryPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={salesHistoryPage >= totalPages}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 cursor-pointer transition-all"
                          >
                            Next Set
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* --------------------------------------------------------
              TAB 4: INVOICES & PDF EXPORTER
             -------------------------------------------------------- */}
          {activeTab === 'invoices' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Invoices Search Bar */}
              <div className="flex items-center gap-2 bg-white p-3 sm:p-4 rounded-3xl border border-rose-100 shadow-sm">
                <Search className="w-4 h-4 text-[#9E315A] shrink-0" />
                <input
                  type="text"
                  placeholder="Search invoices by invoice number, customer name, phone..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoices
                  .filter(inv => !invoiceSearch || inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) || inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) || inv.customerPhone.toLowerCase().includes(invoiceSearch.toLowerCase()))
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-xs text-[#9E315A]">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                            {inv.status}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-base text-[#241B20]">
                          {inv.customerName}
                        </h4>
                        <p className="text-xs text-[#8C5D6C] mb-4">
                          Date: {inv.issueDate} • Phone: {inv.customerPhone}
                        </p>

                        <div className="bg-[#FFF8FA] p-3 rounded-2xl text-xs space-y-1.5 mb-4 border border-rose-100">
                          {inv.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{it.quantity}x {it.description}</span>
                              <span className="font-bold text-[#9E315A]">£{it.total}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-baseline pt-2 border-t border-rose-100">
                          <span className="text-xs font-semibold text-[#5A4550]">Total Billed:</span>
                          <span className="font-serif font-bold text-xl text-[#9E315A]">
                            £{Number(inv.total).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleDownloadInvoicePDF(inv)}
                          className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#C94F7C] text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadInvoicePDF(inv)}
                            className="flex items-center gap-1 text-xs text-[#8C5D6C] hover:text-[#241B20] cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>

                          <button
                            onClick={() => handleDeleteInvoice(inv)}
                            className="p-1.5 text-rose-300 hover:text-red-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* --------------------------------------------------------
              TAB 5: IMAGE OPTIMIZER & WEBP COMPRESSOR
             -------------------------------------------------------- */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Drag & Drop Uploader */}
                <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-serif font-bold text-[#241B20]">
                      Image Compression Engine
                    </h3>
                    <p className="text-xs text-[#8C5D6C]">
                      All photos uploaded to boutique products are automatically compressed into optimized WebP formats for lightning-fast page loading.
                    </p>
                  </div>

                  <label className="block border-2 border-dashed border-rose-200 hover:border-[#9E315A] rounded-3xl p-8 text-center cursor-pointer transition-colors bg-rose-50/40">
                    <Upload className="w-10 h-10 text-[#9E315A] mx-auto mb-2" />
                    <span className="font-serif font-bold text-sm text-[#241B20] block">
                      Test Upload &amp; Optimization
                    </span>
                    <span className="text-xs text-[#8C5D6C] block mt-1">
                      Drag &amp; drop or browse high-resolution JPG / PNG / WebP photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Compression Feedback */}
                  <div className="bg-[#FFF5F8] p-4 rounded-2xl border border-rose-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-[#9E315A] font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Compression Analytics</span>
                    </div>
                    <p className="text-[#5A4550] leading-relaxed">{compressionRatio}</p>
                    {isCompressing && (
                      <p className="text-[#9E315A] font-semibold flex items-center gap-1 mt-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Optimizing image resolution &amp; WebP encoding...</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Live Render Preview */}
                <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-[#8C5D6C] uppercase mb-3">
                    Compressed Image Preview
                  </p>

                  <div className="relative w-64 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-rose-200 bg-[#FFF5F8] shadow-sm flex items-center justify-center">
                    <img
                      src={uploadedImagePreview || '/src/assets/images/meera_jewellery_bangles_1788152322855.jpg'}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />

                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      OPTIMIZED WEBP
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* --------------------------------------------------------
              TAB 6: SALES REPORTS & ANALYTICS
             -------------------------------------------------------- */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">
                  <p className="text-xs text-[#8C5D6C] font-semibold">Total Revenue (Verified)</p>
                  <h4 className="text-3xl font-serif font-bold text-[#9E315A] mt-1">£{totalRevenue.toLocaleString()}</h4>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">
                  <p className="text-xs text-[#8C5D6C] font-semibold">Catalog Product Units</p>
                  <h4 className="text-3xl font-serif font-bold text-[#241B20] mt-1">{products.length} Pieces</h4>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">
                  <p className="text-xs text-[#8C5D6C] font-semibold">WhatsApp Conversion Rate</p>
                  <h4 className="text-3xl font-serif font-bold text-emerald-700 mt-1">82.4%</h4>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-lg text-[#241B20]">
                  Revenue by Collection Category
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Kanjivaram &amp; Silk Sarees</span>
                      <span className="text-[#9E315A]">45% (£5,602)</span>
                    </div>
                    <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#9E315A] rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>The Dance Performance Edit (Saree + Temple Sets)</span>
                      <span className="text-[#C94F7C]">30% (£3,735)</span>
                    </div>
                    <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C94F7C] rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Kundan &amp; Temple Bangles</span>
                      <span className="text-[#B76E79]">15% (£1,867)</span>
                    </div>
                    <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B76E79] rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Bridal Lehengas &amp; Shalwar</span>
                      <span className="text-[#E8CFAF]">10% (£1,246)</span>
                    </div>
                    <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E8CFAF] rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------
              TAB 7: BRAND SETTINGS & LOGO UPLOAD
             -------------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl animate-fadeIn">
              
              <form onSubmit={handleSaveBoutiqueSettings} className="space-y-6">
                
                {/* 1. Brand Logo Uploader Section */}
                <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#241B20]">
                        Brand Logo &amp; Visual Identity
                      </h4>
                      <p className="text-xs text-[#8C5D6C]">
                        Upload your custom boutique logo image to appear in navigation, footer, and invoice headers.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Logo Preview Container */}
                    <div className="w-24 h-24 rounded-2xl bg-rose-50 border-2 border-dashed border-rose-200 flex items-center justify-center p-2 relative shrink-0 shadow-2xs overflow-hidden">
                      {localSettings.customLogoUrl ? (
                        <img
                          src={localSettings.customLogoUrl}
                          alt="Custom Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <Logo variant="icon-only" size="sm" />
                          <span className="text-[9px] text-[#8C5D6C] font-semibold block mt-1">Default Logo</span>
                        </div>
                      )}
                    </div>

                    {/* Logo Controls */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Logo Image</span>
                        </button>

                        {localSettings.customLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setLocalSettings(prev => ({ ...prev, customLogoUrl: '' }))}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Reset to Default Artwork
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] text-[#8C5D6C] block mb-1">
                          Or paste logo image URL directly:
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/brand-logo.png"
                          value={localSettings.customLogoUrl || ''}
                          onChange={(e) => setLocalSettings(prev => ({ ...prev, customLogoUrl: e.target.value }))}
                          className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-[#241B20]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Store Information & Contact Details */}
                <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={localSettings.brandName}
                      onChange={(e) => setLocalSettings({ ...localSettings, brandName: e.target.value })}
                      className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                      Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={localSettings.tagline}
                      onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                      className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                        WhatsApp Business Number (digits only with country code)
                      </label>
                      <input
                        type="text"
                        value={localSettings.whatsappNumber}
                        onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                        className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                        Formatted Phone Display
                      </label>
                      <input
                        type="text"
                        value={localSettings.formattedPhone}
                        onChange={(e) => setLocalSettings({ ...localSettings, formattedPhone: e.target.value })}
                        className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                        Official Boutique Email
                      </label>
                      <input
                        type="email"
                        value={localSettings.email}
                        onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                        className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                        Location / Address
                      </label>
                      <input
                        type="text"
                        value={localSettings.address || 'London, United Kingdom'}
                        onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                        className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                        TikTok Handle
                      </label>
                      <input
                        type="text"
                        value={localSettings.tiktokHandle}
                        onChange={(e) => setLocalSettings({ ...localSettings, tiktokHandle: e.target.value })}
                        className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={localSettings.instagramHandle}
                        onChange={(e) => setLocalSettings({ ...localSettings, instagramHandle: e.target.value })}
                        className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                      />
                    </div>
                  </div>

                  {/* Announcement Bar text */}
                  <div>
                    <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1">
                      Top Announcement Bar Notice
                    </label>
                    <input
                      type="text"
                      value={localSettings.announcementText}
                      onChange={(e) => setLocalSettings({ ...localSettings, announcementText: e.target.value })}
                      className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-[#241B20]"
                    />
                  </div>

                  {/* Future Rental Architecture Feature Flag */}
                  <div className="pt-4 border-t border-rose-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#241B20]">
                          Future Capability: Buy + Rent Mode
                        </h4>
                        <p className="text-xs text-[#5A4550]">
                          Architectural switch for bridal rental inquiry workflow.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, enableRentalMode: !localSettings.enableRentalMode })}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          localSettings.enableRentalMode
                            ? 'bg-purple-600 text-white'
                            : 'bg-rose-100 text-[#9E315A]'
                        }`}
                      >
                        {localSettings.enableRentalMode ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Sticky / Dedicated Save Button */}
                <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
                  <div className="text-xs text-[#8C5D6C]">
                    Changes will take effect immediately across all storefront pages.
                  </div>

                  <button
                    type="submit"
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer ${
                      settingsSavedFeedback
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#9E315A] hover:bg-[#832247] text-white'
                    }`}
                  >
                    {settingsSavedFeedback ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{settingsSavedFeedback ? 'Settings Saved Successfully!' : 'Save Changes'}</span>
                  </button>
                </div>

                {/* System & Developer Credits Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#9E315A] text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                      NT
                    </div>
                    <div>
                      <h5 className="font-serif font-bold text-xs text-[#241B20]">
                        Boutique Platform &amp; CMS Engine
                      </h5>
                      <p className="text-[11px] text-[#8C5D6C]">
                        Custom engineered &amp; developed by <strong className="text-[#9E315A]">NeirahTech</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-[#9E315A] bg-white px-2.5 py-1 rounded-full border border-rose-200">
                    NeirahTech Engine v2.4
                  </span>
                </div>

              </form>

            </div>
          )}

        </div>

      </main>

      {/* --------------------------------------------------------
          PRODUCT EDIT/ADD MODAL (With Direct Photo Upload)
         -------------------------------------------------------- */}
      {isEditingProduct && currentEditProduct && (
        <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto border border-rose-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-rose-100">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#241B20]">
                {currentEditProduct.id && products.some(p => p.id === currentEditProduct.id)
                  ? 'Edit Boutique Product'
                  : 'Add New Boutique Piece'}
              </h3>
              <button
                onClick={() => setIsEditingProduct(false)}
                className="p-1.5 rounded-full hover:bg-rose-50 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              
              {/* Product Title */}
              <div>
                <label className="font-bold text-[#9E315A] uppercase block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Maroon Kanjivaram Silk Saree"
                  value={currentEditProduct.name || ''}
                  onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, name: e.target.value })}
                  className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#9E315A] uppercase block mb-1">Category</label>
                  <select
                    value={currentEditProduct.category || 'sarees'}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, category: e.target.value as any })}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                  >
                    <option value="sarees">Sarees</option>
                    <option value="jewellery">Jewellery &amp; Bangles</option>
                    <option value="performance">Dance Performance Edit</option>
                    <option value="lehengas">Lehengas</option>
                    <option value="shalwar">Shalwar</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#9E315A] uppercase block mb-1">Subcategory / Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Kanjivaram Silk, Kundan Bangles"
                    value={currentEditProduct.subcategory || ''}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, subcategory: e.target.value })}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                  />
                </div>
              </div>

              {/* Pricing & Stock Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#9E315A] uppercase block mb-1">Selling Price (£)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 145"
                    value={currentEditProduct.price === 0 ? '' : currentEditProduct.price || ''}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, price: Number(e.target.value) || 0 })}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#9E315A] uppercase block mb-1">Original Price (£)</label>
                  <input
                    type="number"
                    placeholder="e.g. 185"
                    value={currentEditProduct.originalPrice || ''}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#9E315A] uppercase block mb-1">Stock Status</label>
                  <select
                    value={currentEditProduct.stockStatus || 'In Stock'}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, stockStatus: e.target.value as any })}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Pre-Order">Pre-Order</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              {/* Unavailability / Out of Stock Reason (Requirement 1 & 2) */}
              {(currentEditProduct.stockStatus === 'Out of Stock' || currentEditProduct.stockStatus === 'Unavailable' || currentEditProduct.stockStatus === 'Low Stock') && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <Info className="w-3.5 h-3.5" />
                    <span>Stock Status Note / Reason for Customers:</span>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="e.g. Sold Out - Awaiting New Weaving Batch from Kanchipuram"
                    value={currentEditProduct.unavailabilityReason || ''}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, unavailabilityReason: e.target.value })}
                    className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs text-[#241B20]"
                  />

                  {/* Preset quick suggestions */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-amber-800 font-semibold">Quick Presets:</span>
                    {STOCK_UNAVAILABILITY_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentEditProduct({ ...currentEditProduct, unavailabilityReason: preset })}
                        className="text-[10px] bg-white hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  PHOTO UPLOAD SECTION (Direct File Upload & Auto-Compress)
                 ------------------------------------------------------ */}
              <div className="p-5 rounded-2xl bg-[#FFF8FA] border border-rose-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-rose-200/60">
                  <div>
                    <label className="font-bold text-[#9E315A] uppercase text-xs sm:text-sm block">
                      Product Photography &amp; Angles
                    </label>
                    <span className="text-[11px] text-[#8C5D6C]">
                      Upload photos directly from your device. All images are automatically compressed to ultra-fast WebP format and replace directly on your live website.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                    * Main Image Required
                  </span>
                </div>

                {/* Primary Main Image (Mandatory *) */}
                <div className="bg-white p-4 rounded-2xl border-2 border-rose-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider">
                        1. Main Product Photo <span className="text-rose-600">* (Required)</span>
                      </span>
                      {currentEditProduct.images?.main && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{compressionStats['main'] || 'Ready & Compressed'}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8C5D6C]">Primary showcase &amp; thumbnail</span>
                  </div>

                  <input
                    type="file"
                    ref={productMainImgInputRef}
                    accept="image/*"
                    onChange={(e) => handleProductImageUpload(e, 'main')}
                    className="hidden"
                  />

                  {currentEditProduct.images?.main ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FFF8FA] p-3 rounded-xl border border-rose-100">
                      <div className="w-24 h-32 rounded-xl bg-white border border-rose-200 overflow-hidden shrink-0 shadow-sm relative">
                        <img
                          src={currentEditProduct.images.main}
                          alt="Main Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, 'general')}
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                          MAIN
                        </span>
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <p className="text-xs font-semibold text-[#241B20]">
                          Main photo uploaded &amp; live on storefront.
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={() => productMainImgInputRef.current?.click()}
                            className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace Main Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage('main')}
                            className="flex items-center gap-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => productMainImgInputRef.current?.click()}
                      disabled={compressingAngle === 'main'}
                      className="w-full border-2 border-dashed border-rose-300 hover:border-[#9E315A] bg-[#FFF5F8] hover:bg-rose-100/50 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
                    >
                      {compressingAngle === 'main' ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#9E315A]">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Auto-compressing main photo to WebP...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-[#9E315A]">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#9E315A] block">
                              Click to Upload Main Product Photo (Required)
                            </span>
                            <span className="text-[11px] text-[#8C5D6C] block mt-0.5">
                              Supports JPG, PNG, WebP — automatically compressed &amp; resized
                            </span>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Additional Perspective Views Grid */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider">
                      2. Additional Perspective Views (Optional)
                    </span>
                    <span className="text-[10px] text-[#8C5D6C]">Front, Back, Detail &amp; Model</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { key: 'front' as const, label: 'Front Drape View', hint: 'Full-length front presentation' },
                      { key: 'back' as const, label: 'Back / Pallu View', hint: 'Pallu or blouse back detail' },
                      { key: 'detail' as const, label: 'Detail & Craft Close-Up', hint: 'Zari, border or texture close-up' },
                      { key: 'wearing' as const, label: 'Model Drape View', hint: 'Occasion styling or worn look' },
                    ].map(({ key, label, hint }) => {
                      const imageVal = currentEditProduct.images?.[key];
                      const isAngleCompressing = compressingAngle === key;
                      const inputId = `product-file-input-${key}`;

                      return (
                        <div
                          key={key}
                          className="bg-white p-3 rounded-xl border border-rose-200 flex flex-col justify-between space-y-2 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-[#241B20] capitalize">
                                {label}
                              </span>
                              {imageVal && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  ✓ Added
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-[#8C5D6C] line-clamp-1">{hint}</p>
                          </div>

                          <input
                            id={inputId}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProductImageUpload(e, key)}
                            className="hidden"
                          />

                          {imageVal ? (
                            <div className="space-y-2">
                              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-rose-100 bg-[#FFF5F8]">
                                <img
                                  src={imageVal}
                                  alt={label}
                                  className="w-full h-full object-cover"
                                  onError={(e) => handleImageError(e, 'general')}
                                />
                                {compressionStats[key] && (
                                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[7px] px-1 rounded">
                                    {compressionStats[key]}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <label
                                  htmlFor={inputId}
                                  className="flex-1 text-center bg-rose-50 hover:bg-rose-100 text-[#9E315A] text-[10px] font-bold py-1.5 rounded-lg border border-rose-200 cursor-pointer"
                                >
                                  Replace
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductImage(key)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  title="Remove this view"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor={inputId}
                              className="border border-dashed border-rose-200 hover:border-[#9E315A] bg-[#FFF8FA] hover:bg-rose-50/70 aspect-[3/4] rounded-xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors"
                            >
                              {isAngleCompressing ? (
                                <div className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9E315A]">
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Compressing...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-rose-400 mb-1" />
                                  <span className="text-[10px] font-bold text-[#9E315A] block">
                                    Upload {key}
                                  </span>
                                  <span className="text-[8px] text-[#8C5D6C] block mt-0.5">
                                    Browse photo
                                  </span>
                                </>
                              )}
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Validation Notice if Main is missing */}
                {!currentEditProduct.images?.main && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Please upload at least 1 image (Main Photo) above. Products cannot be published to the website without a primary photograph.
                    </span>
                  </div>
                )}
              </div>

              {/* Material & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#9E315A] uppercase block mb-1">Fabric / Material</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Kanjivaram Silk with Zari Border"
                    value={currentEditProduct.material || ''}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, material: e.target.value })}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#9E315A] uppercase block mb-1">Primary Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Peacock Blue &amp; Gold"
                    value={currentEditProduct.color || ''}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, color: e.target.value })}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-[#9E315A] uppercase block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={currentEditProduct.description || ''}
                  onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, description: e.target.value })}
                  className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20] resize-none"
                />
              </div>

              {/* Checkbox Flags */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(currentEditProduct.isPreOrder)}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, isPreOrder: e.target.checked })}
                    className="rounded text-[#9E315A]"
                  />
                  <span>Pre-Order Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(currentEditProduct.isDancePerformance)}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, isDancePerformance: e.target.checked })}
                    className="rounded text-[#9E315A]"
                  />
                  <span>Dance Performance Collection</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(currentEditProduct.isOffer)}
                    onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, isOffer: e.target.checked })}
                    className="rounded text-[#9E315A]"
                  />
                  <span>Special Offer / Sale</span>
                </label>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-rose-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#9E315A] hover:bg-[#832247] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          CANCELLATION REASON CLARIFICATION MODAL
         -------------------------------------------------------- */}
      {cancellationModal && cancellationModal.isOpen && cancellationModal.enquiry && (
        <div className="fixed inset-0 z-[125] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#241B20]">
                  Clarify Cancellation Reason
                </h4>
                <p className="text-xs text-[#8C5D6C]">
                  Order #{cancellationModal.enquiry.orderNumber} • {cancellationModal.enquiry.customerName}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5A4550]">
              To maintain accurate sales history and analytics, please select or specify why this WhatsApp lead was cancelled:
            </p>

            {/* Reason Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9E315A] block">
                Common Cancellation Reasons:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Customer Unresponsive / No WhatsApp Reply',
                  'Customer Changed Mind / Budget Constraint',
                  'Item Out of Stock / Weaving Delay',
                  'Requested Custom Size / Color Not Available',
                  'Event Date Conflict / Shipping Timeline',
                  'Duplicate / Test Inquiry',
                ].map((reasonPreset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCancellationModal({ ...cancellationModal, reason: reasonPreset })}
                    className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                      cancellationModal.reason === reasonPreset
                        ? 'bg-[#9E315A] text-white border-[#9E315A] font-bold'
                        : 'bg-rose-50 hover:bg-rose-100 text-[#5A4550] border-rose-200'
                    }`}
                  >
                    {reasonPreset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes Input */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9E315A] block mb-1">
                Detailed Reason / Notes:
              </label>
              <textarea
                rows={3}
                required
                placeholder="Type additional context or specifics for this cancellation..."
                value={cancellationModal.reason || ''}
                onChange={(e) => setCancellationModal({ ...cancellationModal, reason: e.target.value })}
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-2xl p-3 text-xs text-[#241B20] outline-none focus:border-[#9E315A]"
              />
            </div>

            <div className="pt-3 border-t border-rose-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCancellationModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Keep Active (Do Not Cancel)
              </button>

              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={!(cancellationModal.reason || '').trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer transition-all"
              >
                Confirm Cancellation &amp; Save Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          ORDER FULL DETAILS & INVOICE PREVIEW MODAL
         -------------------------------------------------------- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 max-h-[92vh] overflow-y-auto border border-rose-200 shadow-2xl space-y-5">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-rose-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm bg-rose-50 text-[#9E315A] px-3 py-1 rounded-full border border-rose-200">
                    {selectedOrderDetails.orderNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedOrderDetails.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedOrderDetails.status === 'Delivered'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedOrderDetails.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrderDetails.status}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#241B20] mt-1.5">
                  Order &amp; Customer Profile Details
                </h3>
                <p className="text-xs text-[#8C5D6C]">
                  Received on {new Date(selectedOrderDetails.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-rose-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Card */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E315A]">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#8C5D6C] block">Full Name:</span>
                  <strong className="text-[#241B20]">{selectedOrderDetails.customerName}</strong>
                </div>
                <div>
                  <span className="text-[#8C5D6C] block">WhatsApp / Phone:</span>
                  <strong className="text-[#241B20]">{selectedOrderDetails.customerPhone}</strong>
                </div>
                {selectedOrderDetails.customerEmail && (
                  <div>
                    <span className="text-[#8C5D6C] block">Email Address:</span>
                    <span className="text-[#241B20]">{selectedOrderDetails.customerEmail}</span>
                  </div>
                )}
                {selectedOrderDetails.deliveryCity && (
                  <div>
                    <span className="text-[#8C5D6C] block">Delivery Destination:</span>
                    <span className="text-[#241B20]">{selectedOrderDetails.deliveryCity}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Clarification if Cancelled */}
            {selectedOrderDetails.status === 'Cancelled' && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cancellation Clarification &amp; Data:</span>
                </div>
                <p className="leading-relaxed">
                  {selectedOrderDetails.cancelReason || 'No specific cancellation notes recorded.'}
                </p>
                {selectedOrderDetails.cancelledAt && (
                  <p className="text-[10px] text-red-600 font-mono pt-1">
                    Recorded Date: {new Date(selectedOrderDetails.cancelledAt).toLocaleString('en-GB')}
                  </p>
                )}
              </div>
            )}

            {/* Ordered Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E315A]">
                Curated Items Ordered ({selectedOrderDetails.items.length})
              </h4>
              <div className="border border-rose-100 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF8FA] text-[#8C5D6C] uppercase text-[10px] font-bold border-b border-rose-100">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Size / Spec</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {selectedOrderDetails.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-[#241B20]">{it.productName}</td>
                        <td className="p-3 text-[#8C5D6C]">{it.size || 'Standard'}</td>
                        <td className="p-3 text-center font-bold text-[#241B20]">{it.quantity}</td>
                        <td className="p-3 text-right text-[#5A4550]">£{it.price}</td>
                        <td className="p-3 text-right font-bold text-[#9E315A]">£{it.price * it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-rose-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5A4550]">
                <span>Items Subtotal:</span>
                <span>£{selectedOrderDetails.total}</span>
              </div>
              <div className="flex justify-between text-[#5A4550]">
                <span>Royal Mail 1st Class UK Delivery:</span>
                <span className="text-emerald-700 font-semibold">Complimentary</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-rose-200 text-sm font-bold">
                <span className="text-[#241B20]">Grand Total:</span>
                <span className="font-serif text-xl text-[#9E315A]">£{selectedOrderDetails.total}</span>
              </div>
            </div>

            {/* Customer Notes */}
            {selectedOrderDetails.notes && (
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
                <strong className="text-amber-900 block mb-0.5">Special Instructions / Customer Notes:</strong>
                <p className="text-[#5A4550] italic">"{selectedOrderDetails.notes}"</p>
              </div>
            )}

            {/* Actions Footer with PDF Invoice Download */}
            <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => handleDownloadOrderInvoicePdf(selectedOrderDetails)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#9E315A] hover:bg-[#832247] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Official PDF Invoice</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openWhatsAppChat(selectedOrderDetails.customerPhone || settings.whatsappNumber, `Hello ${selectedOrderDetails.customerName} 🌸 This is Meera from Meera's Fashion regarding order #${selectedOrderDetails.orderNumber}.`)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          CONFIRMATION MODAL DIALOG (Requirement: Confirmations for Updates & Deletes)
         -------------------------------------------------------- */}
      {confirmationModal && confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#9E315A]">
              {confirmationModal.isDestructive ? (
                <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-rose-50 text-[#9E315A] border border-rose-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}

              <div>
                <h4 className="font-serif font-bold text-base text-[#241B20]">
                  {confirmationModal.title}
                </h4>
                <p className="text-xs text-[#8C5D6C]">Please confirm your administrative action</p>
              </div>
            </div>

            <p className="text-xs text-[#5A4550] leading-relaxed">
              {confirmationModal.message}
            </p>

            <div className="pt-3 border-t border-rose-100 flex justify-end gap-2">
              <button
                onClick={() => setConfirmationModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {confirmationModal.cancelLabel || 'Cancel'}
              </button>

              <button
                onClick={() => {
                  confirmationModal.onConfirm();
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all ${
                  confirmationModal.isDestructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#9E315A] hover:bg-[#832247]'
                }`}
              >
                {confirmationModal.confirmLabel || 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          FLOATING TOAST NOTIFICATION
         -------------------------------------------------------- */}
      {toastNotification && toastNotification.show && (
        <div className="fixed bottom-6 right-6 z-[130] bg-[#241B20] text-white rounded-2xl p-4 shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-md">
          <div className="p-2 rounded-xl bg-[#9E315A] text-white shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="font-serif font-bold text-xs text-white">
              {toastNotification.title}
            </h5>
            <p className="text-[11px] text-rose-200/80 line-clamp-1">
              {toastNotification.message}
            </p>
          </div>

          {toastNotification.actionLabel && toastNotification.onAction && (
            <button
              onClick={() => {
                toastNotification.onAction?.();
                setToastNotification(null);
              }}
              className="px-3 py-1 bg-[#9E315A] hover:bg-[#C94F7C] text-white text-[11px] font-bold rounded-lg shrink-0 cursor-pointer"
            >
              {toastNotification.actionLabel}
            </button>
          )}

          <button
            onClick={() => setToastNotification(null)}
            className="p-1 text-rose-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
