import React, { useEffect, useMemo, useState } from 'react';

import {
  TrendingUp,
  ShoppingBag,
  Package,
  MessageCircle,
  RefreshCw,
  ArrowUpRight,
  Loader2,
  Download,
  ClipboardList,
  Boxes,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import {
  loadAnalytics,
  AnalyticsData,
} from '../../../services/api';

interface ReportsPanelProps {
  totalRevenue?: number;
  products?: any[];
  enquiries?: any[];
}

type AnalyticsRange = '7' | '30' | '90' | 'all';

interface TopSellingProduct {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  price: number;
  image: string;
  stockQuantity: number;
  stockStatus: string;
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({
  products = [],
  enquiries = [],
}) => {
  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [range, setRange] =
    useState<AnalyticsRange>('30');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [downloading, setDownloading] =
    useState(false);

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await loadAnalytics(range);

      setAnalytics(data);
    } catch (err) {
      console.error(
        'Failed to load analytics:',
        err
      );

      setError(
        'Unable to load analytics data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (
    value: number
  ) => {
    return `£${Number(value || 0).toLocaleString(
      'en-GB',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatPercentage = (
    value: number
  ) => {
    return `${Number(value || 0).toFixed(1)}%`;
  };

  const formatCategory = (
    category: string
  ) => {
    if (!category) {
      return 'Other';
    }

    return String(category)
      .replace(/[-_]/g, ' ')
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  const normalizeStatus = (
    status: unknown
  ) => {
    return String(status || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, ' ');
  };

  // =========================================================
  // GET IMAGE
  // =========================================================

  const getProductImage = (
    product: any
  ): string => {
    if (!product) {
      return '';
    }

    const images =
      product?.images;

    if (typeof images === 'string') {
      return images;
    }

    return (
      images?.main ||
      images?.thumbnail ||
      images?.url ||
      images?.image ||
      images?.cover ||
      product?.image ||
      product?.imageUrl ||
      product?.image_url ||
      product?.thumbnail ||
      ''
    );
  };

  // =========================================================
  // GET PRODUCT OBJECT FROM ENQUIRY
  // =========================================================

  const getEnquiryProduct = (
    enquiry: any
  ): any | null => {
    if (!enquiry) {
      return null;
    }

    /*
     * Most common structure:
     *
     * enquiry.product
     * enquiry.productDetails
     * enquiry.productData
     * enquiry.selectedProduct
     * enquiry.item
     */

    if (
      enquiry.product &&
      typeof enquiry.product === 'object'
    ) {
      return enquiry.product;
    }

    if (
      enquiry.productDetails &&
      typeof enquiry.productDetails === 'object'
    ) {
      return enquiry.productDetails;
    }

    if (
      enquiry.productData &&
      typeof enquiry.productData === 'object'
    ) {
      return enquiry.productData;
    }

    if (
      enquiry.selectedProduct &&
      typeof enquiry.selectedProduct === 'object'
    ) {
      return enquiry.selectedProduct;
    }

    if (
      enquiry.item &&
      typeof enquiry.item === 'object'
    ) {
      return enquiry.item;
    }

    /*
     * If enquiry contains items[]
     */

    if (
      Array.isArray(enquiry.items) &&
      enquiry.items.length > 0
    ) {
      const firstItem =
        enquiry.items[0];

      if (
        firstItem?.product &&
        typeof firstItem.product === 'object'
      ) {
        return firstItem.product;
      }

      if (
        firstItem?.productDetails &&
        typeof firstItem.productDetails === 'object'
      ) {
        return firstItem.productDetails;
      }

      if (
        firstItem &&
        typeof firstItem === 'object'
      ) {
        return firstItem;
      }
    }

    /*
     * If enquiry contains orderItems[]
     */

    if (
      Array.isArray(enquiry.orderItems) &&
      enquiry.orderItems.length > 0
    ) {
      const firstItem =
        enquiry.orderItems[0];

      if (
        firstItem?.product &&
        typeof firstItem.product === 'object'
      ) {
        return firstItem.product;
      }

      if (
        firstItem?.productDetails &&
        typeof firstItem.productDetails === 'object'
      ) {
        return firstItem.productDetails;
      }

      if (
        firstItem &&
        typeof firstItem === 'object'
      ) {
        return firstItem;
      }
    }

    return null;
  };

  // =========================================================
  // GET PRODUCT ID
  // =========================================================

  const getProductId = (
    enquiry: any,
    product: any
  ): string => {
    return String(
      product?.id ||
      product?.productId ||
      product?.product_id ||
      enquiry?.productId ||
      enquiry?.product_id ||
      enquiry?.productID ||
      enquiry?.selectedProductId ||
      enquiry?.selected_product_id ||
      enquiry?.itemId ||
      enquiry?.item_id ||
      ''
    ).trim();
  };

  // =========================================================
  // GET PRODUCT NAME
  // =========================================================

  const getProductName = (
    enquiry: any,
    product: any
  ): string => {
    return String(
      product?.name ||
      product?.productName ||
      product?.product_name ||
      product?.title ||
      product?.productTitle ||
      enquiry?.productName ||
      enquiry?.product_name ||
      enquiry?.productTitle ||
      enquiry?.product_title ||
      enquiry?.name ||
      ''
    ).trim();
  };

  // =========================================================
  // GET QUANTITY
  // =========================================================

  const getProductQuantity = (
    enquiry: any,
    product: any
  ): number => {
    const rawQuantity =
      product?.quantity ??
      product?.qty ??
      product?.productQuantity ??
      product?.product_quantity ??
      enquiry?.quantity ??
      enquiry?.qty ??
      enquiry?.productQuantity ??
      enquiry?.product_quantity ??
      enquiry?.orderQuantity ??
      enquiry?.order_quantity ??
      enquiry?.itemQuantity ??
      enquiry?.item_quantity;

    const quantity =
      Number(rawQuantity);

    if (
      Number.isFinite(quantity) &&
      quantity > 0
    ) {
      return quantity;
    }

    return 1;
  };

  // =========================================================
  // GET PRICE
  // =========================================================

  const getProductPrice = (
    enquiry: any,
    product: any,
    catalogProduct: any
  ): number => {
    const possiblePrices = [
      product?.price,
      product?.sellingPrice,
      product?.selling_price,
      product?.unitPrice,
      product?.unit_price,

      enquiry?.price,
      enquiry?.sellingPrice,
      enquiry?.selling_price,
      enquiry?.unitPrice,
      enquiry?.unit_price,

      catalogProduct?.price,
      catalogProduct?.sellingPrice,
      catalogProduct?.selling_price,
      catalogProduct?.unitPrice,
      catalogProduct?.unit_price,
    ];

    for (
      const value of possiblePrices
    ) {
      const price =
        Number(value);

      if (
        Number.isFinite(price) &&
        price > 0
      ) {
        return price;
      }
    }

    return 0;
  };

  // =========================================================
  // FIND CATALOG PRODUCT
  // =========================================================

  const findCatalogProduct = (
    enquiry: any,
    enquiryProduct: any
  ): any | null => {
    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return null;
    }

    const productId =
      getProductId(
        enquiry,
        enquiryProduct
      );

    // Match by ID first
    if (productId) {
      const byId =
        products.find(
          (product) =>
            String(
              product?.id || ''
            ).trim() ===
            productId
        );

      if (byId) {
        return byId;
      }
    }

    // Match by name
    const productName =
      getProductName(
        enquiry,
        enquiryProduct
      )
        .toLowerCase()
        .trim();

    if (productName) {
      const byName =
        products.find(
          (product) =>
            String(
              product?.name || ''
            )
              .toLowerCase()
              .trim() ===
            productName
        );

      if (byName) {
        return byName;
      }
    }

    return null;
  };

  // =========================================================
  // PRODUCT ANALYSIS
  // =========================================================

  const productAnalysis =
    useMemo(() => {
      const totalProducts =
        products.length;

      let inStock = 0;
      let lowStock = 0;
      let outOfStock = 0;
      let preOrder = 0;
      let unavailable = 0;
      let totalStockQuantity = 0;

      products.forEach(
        (product) => {
          const quantity =
            Number(
              product?.stockQuantity ?? 0
            );

          totalStockQuantity +=
            quantity;

          const status =
            normalizeStatus(
              product?.stockStatus
            );

          if (
            status === 'pre order'
          ) {
            preOrder++;
          } else if (
            status === 'unavailable'
          ) {
            unavailable++;
          } else if (
            status === 'out of stock' ||
            quantity <= 0
          ) {
            outOfStock++;
          } else if (
            status === 'low stock' ||
            quantity <= 5
          ) {
            lowStock++;
          } else {
            inStock++;
          }
        }
      );

      return {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        preOrder,
        unavailable,
        totalStockQuantity,
      };
    }, [products]);

  // =========================================================
  // ENQUIRY ANALYSIS
  // =========================================================

  const enquiryAnalysis =
    useMemo(() => {
      const totalEnquiries =
        enquiries.length;

      const pendingEnquiries =
        enquiries.filter(
          (enquiry) =>
            normalizeStatus(
              enquiry?.status
            ) === 'new'
        ).length;

      const contactedEnquiries =
        enquiries.filter(
          (enquiry) => {
            const status =
              normalizeStatus(
                enquiry?.status
              );

            return [
              'contacted',
              'in progress',
              'processing',
              'follow up',
              'followup',
            ].includes(status);
          }
        ).length;

      const deliveredEnquiries =
        enquiries.filter(
          (enquiry) =>
            normalizeStatus(
              enquiry?.status
            ) === 'delivered'
        ).length;

      const completedEnquiries =
        enquiries.filter(
          (enquiry) => {
            const status =
              normalizeStatus(
                enquiry?.status
              );

            return [
              'completed',
              'converted',
              'closed',
              'resolved',
              'paid',
              'delivered',
            ].includes(status);
          }
        ).length;

      const cancelledEnquiries =
        enquiries.filter(
          (enquiry) => {
            const status =
              normalizeStatus(
                enquiry?.status
              );

            return [
              'cancelled',
              'canceled',
              'rejected',
            ].includes(status);
          }
        ).length;

      const conversionRate =
        totalEnquiries > 0
          ? (completedEnquiries /
              totalEnquiries) *
            100
          : 0;

      return {
        totalEnquiries,
        pendingEnquiries,
        contactedEnquiries,
        deliveredEnquiries,
        completedEnquiries,
        cancelledEnquiries,
        conversionRate,
      };
    }, [enquiries]);

  // =========================================================
  // TOP SELLING PRODUCTS
  //
  // IMPORTANT:
  // Only enquiries where status = Delivered
  //
  // Product details are taken from the enquiry itself.
  // Catalog data is only used to fill stock information.
  // =========================================================

  const enquiryTopSellingProducts =
    useMemo(() => {
      const salesMap =
        new Map<
          string,
          TopSellingProduct
        >();

      if (
        !Array.isArray(enquiries) ||
        enquiries.length === 0
      ) {
        return [];
      }

      // -------------------------------------------------------
      // FILTER DELIVERED ENQUIRIES
      // -------------------------------------------------------

      const deliveredEnquiries =
        enquiries.filter(
          (enquiry) =>
            normalizeStatus(
              enquiry?.status
            ) === 'delivered'
        );

      console.log(
        'Delivered enquiries:',
        deliveredEnquiries
      );

      // -------------------------------------------------------
      // PROCESS EACH DELIVERED ENQUIRY
      // -------------------------------------------------------

      deliveredEnquiries.forEach(
        (enquiry) => {
          const enquiryProduct =
            getEnquiryProduct(
              enquiry
            );

          const catalogProduct =
            findCatalogProduct(
              enquiry,
              enquiryProduct
            );

          /*
           * IMPORTANT:
           * The product saved inside the enquiry
           * is the primary source.
           *
           * Catalog is secondary.
           */

          const product =
            enquiryProduct ||
            catalogProduct;

          if (!product) {
            console.warn(
              'Skipping delivered enquiry because no product object was found:',
              enquiry
            );

            return;
          }

          const productId =
            getProductId(
              enquiry,
              product
            );

          const productName =
            getProductName(
              enquiry,
              product
            );

          /*
           * If the enquiry product doesn't have a name,
           * try the catalog product.
           */

          const finalName =
            productName ||
            String(
              catalogProduct?.name || ''
            ).trim();

          if (!finalName) {
            console.warn(
              'Skipping delivered enquiry because product name is missing:',
              enquiry
            );

            return;
          }

          const quantity =
            getProductQuantity(
              enquiry,
              product
            );

          const price =
            getProductPrice(
              enquiry,
              product,
              catalogProduct
            );

          const image =
            getProductImage(
              product
            ) ||
            getProductImage(
              catalogProduct
            );

          const category =
            product?.category ||
            product?.subcategory ||
            catalogProduct?.category ||
            catalogProduct?.subcategory ||
            enquiry?.category ||
            'Other';

          /*
           * Use product ID when available.
           * Otherwise use normalized product name.
           */

          const salesKey =
            productId ||
            finalName
              .toLowerCase()
              .trim();

          const existing =
            salesMap.get(
              salesKey
            );

          // ---------------------------------------------------
          // EXISTING PRODUCT
          // ---------------------------------------------------

          if (existing) {
            existing.quantity =
              existing.quantity +
              quantity;

            existing.revenue =
              existing.revenue +
              price * quantity;

            if (
              existing.price <= 0 &&
              price > 0
            ) {
              existing.price =
                price;
            }

            if (
              !existing.image &&
              image
            ) {
              existing.image =
                image;
            }

            if (
              existing.category ===
                'Other' &&
              category
            ) {
              existing.category =
                category;
            }

            return;
          }

          // ---------------------------------------------------
          // NEW PRODUCT
          // ---------------------------------------------------

          salesMap.set(
            salesKey,
            {
              productId:
                productId ||
                salesKey,

              name:
                finalName,

              category:
                String(category),

              quantity:
                quantity,

              revenue:
                price * quantity,

              price:
                price,

              image:
                image,

              stockQuantity:
                Number(
                  catalogProduct?.stockQuantity ??
                  product?.stockQuantity ??
                  0
                ),

              stockStatus:
                catalogProduct?.stockStatus ||
                product?.stockStatus ||
                'Unknown',
            }
          );
        }
      );

      // -------------------------------------------------------
      // SORT
      // -------------------------------------------------------

      const result =
        Array.from(
          salesMap.values()
        )
          .sort(
            (a, b) =>
              b.quantity -
                a.quantity ||
              b.revenue -
                a.revenue
          )
          .slice(0, 10);

      console.log(
        'Top selling delivered products:',
        result
      );

      return result;
    }, [
      enquiries,
      products,
    ]);

  // =========================================================
  // CSV HELPER
  // =========================================================

  const escapeCsvValue = (
    value: unknown
  ) => {
    const stringValue =
      value === null ||
      value === undefined
        ? ''
        : String(value);

    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  };

  // =========================================================
  // DOWNLOAD REPORT
  // =========================================================

  const downloadReport = () => {
    if (!analytics) {
      return;
    }

    try {
      setDownloading(true);

      const {
        summary,
        revenueByCategory,
      } = analytics;

      const reportRows: string[][] =
        [];

      const periodLabel =
        range === '7'
          ? 'Last 7 Days'
          : range === '30'
          ? 'Last 30 Days'
          : range === '90'
          ? 'Last 90 Days'
          : 'All Time';

      reportRows.push([
        'MEERA FASHION - BUSINESS ANALYSIS REPORT',
      ]);

      reportRows.push([
        `Report Period: ${periodLabel}`,
      ]);

      reportRows.push([
        `Generated: ${new Date().toLocaleString(
          'en-GB'
        )}`,
      ]);

      reportRows.push([]);

      // =====================================================
      // EXECUTIVE SUMMARY
      // =====================================================

      reportRows.push([
        'EXECUTIVE SUMMARY',
      ]);

      reportRows.push([
        'Metric',
        'Value',
      ]);

      reportRows.push([
        'Verified Revenue',
        formatCurrency(
          summary.totalRevenue
        ),
      ]);

      reportRows.push([
        'Total Invoice Orders',
        String(
          summary.totalOrders
        ),
      ]);

      reportRows.push([
        'Verified Invoice Orders',
        String(
          summary.paidOrders
        ),
      ]);

      reportRows.push([
        'Pending Orders',
        String(
          enquiryAnalysis.pendingEnquiries
        ),
      ]);

      reportRows.push([
        'Delivered Orders',
        String(
          enquiryAnalysis.deliveredEnquiries
        ),
      ]);

      reportRows.push([
        'Total Products',
        String(
          productAnalysis.totalProducts
        ),
      ]);

      reportRows.push([
        'Total Stock Quantity',
        String(
          productAnalysis.totalStockQuantity
        ),
      ]);

      reportRows.push([
        'In Stock Products',
        String(
          productAnalysis.inStock
        ),
      ]);

      reportRows.push([
        'Low Stock Products',
        String(
          productAnalysis.lowStock
        ),
      ]);

      reportRows.push([
        'Out of Stock Products',
        String(
          productAnalysis.outOfStock
        ),
      ]);

      reportRows.push([
        'Pre-Order Products',
        String(
          productAnalysis.preOrder
        ),
      ]);

      reportRows.push([
        'Unavailable Products',
        String(
          productAnalysis.unavailable
        ),
      ]);

      reportRows.push([
        'Total Enquiries',
        String(
          enquiryAnalysis.totalEnquiries
        ),
      ]);

      reportRows.push([
        'Pending Enquiries (New)',
        String(
          enquiryAnalysis.pendingEnquiries
        ),
      ]);

      reportRows.push([
        'Delivered Enquiries',
        String(
          enquiryAnalysis.deliveredEnquiries
        ),
      ]);

      reportRows.push([
        'Contacted Enquiries',
        String(
          enquiryAnalysis.contactedEnquiries
        ),
      ]);

      reportRows.push([
        'Completed / Converted Enquiries',
        String(
          enquiryAnalysis.completedEnquiries
        ),
      ]);

      reportRows.push([
        'Cancelled / Rejected Enquiries',
        String(
          enquiryAnalysis.cancelledEnquiries
        ),
      ]);

      reportRows.push([
        'Enquiry Conversion Rate',
        formatPercentage(
          enquiryAnalysis.conversionRate
        ),
      ]);

      reportRows.push([
        'Invoice Conversion Rate',
        formatPercentage(
          summary.conversionRate
        ),
      ]);

      reportRows.push([]);

      // =====================================================
      // INVENTORY
      // =====================================================

      reportRows.push([
        'INVENTORY ANALYSIS',
      ]);

      reportRows.push([
        'Stock Status',
        'Product Count',
      ]);

      reportRows.push([
        'In Stock',
        String(
          productAnalysis.inStock
        ),
      ]);

      reportRows.push([
        'Low Stock',
        String(
          productAnalysis.lowStock
        ),
      ]);

      reportRows.push([
        'Out of Stock',
        String(
          productAnalysis.outOfStock
        ),
      ]);

      reportRows.push([
        'Pre-Order',
        String(
          productAnalysis.preOrder
        ),
      ]);

      reportRows.push([
        'Unavailable',
        String(
          productAnalysis.unavailable
        ),
      ]);

      reportRows.push([]);

      // =====================================================
      // ENQUIRY ANALYSIS
      // =====================================================

      reportRows.push([
        'ENQUIRY ANALYSIS',
      ]);

      reportRows.push([
        'Enquiry Status',
        'Count',
      ]);

      reportRows.push([
        'New / Pending',
        String(
          enquiryAnalysis.pendingEnquiries
        ),
      ]);

      reportRows.push([
        'Contacted',
        String(
          enquiryAnalysis.contactedEnquiries
        ),
      ]);

      reportRows.push([
        'Delivered',
        String(
          enquiryAnalysis.deliveredEnquiries
        ),
      ]);

      reportRows.push([
        'Completed / Converted',
        String(
          enquiryAnalysis.completedEnquiries
        ),
      ]);

      reportRows.push([
        'Cancelled / Rejected',
        String(
          enquiryAnalysis.cancelledEnquiries
        ),
      ]);

      reportRows.push([]);

      // =====================================================
      // REVENUE BY COLLECTION
      // =====================================================

      reportRows.push([
        'REVENUE BY COLLECTION',
      ]);

      reportRows.push([
        'Category',
        'Revenue',
        'Percentage',
      ]);

      revenueByCategory.forEach(
        (item) => {
          reportRows.push([
            formatCategory(
              item.category
            ),
            formatCurrency(
              item.revenue
            ),
            formatPercentage(
              item.percentage
            ),
          ]);
        }
      );

      reportRows.push([]);

      // =====================================================
      // TOP SELLING PRODUCTS
      // =====================================================

      reportRows.push([
        'TOP SELLING PRODUCTS',
      ]);

      reportRows.push([
        'Product',
        'Category',
        'Units Sold',
        'Price',
        'Revenue',
        'Current Stock',
        'Stock Status',
      ]);

      enquiryTopSellingProducts.forEach(
        (product) => {
          reportRows.push([
            product.name,

            formatCategory(
              product.category
            ),

            String(
              product.quantity
            ),

            formatCurrency(
              product.price
            ),

            formatCurrency(
              product.revenue
            ),

            String(
              product.stockQuantity
            ),

            product.stockStatus,
          ]);
        }
      );

      reportRows.push([]);

      // =====================================================
      // PRODUCT CATALOG
      // =====================================================

      reportRows.push([
        'PRODUCT CATALOG ANALYSIS',
      ]);

      reportRows.push([
        'Product',
        'Category',
        'Stock Quantity',
        'Stock Status',
        'Selling Price',
      ]);

      products.forEach(
        (product) => {
          reportRows.push([
            product?.name ||
              'Unnamed Product',

            formatCategory(
              product?.category
            ),

            String(
              Number(
                product?.stockQuantity ??
                  0
              )
            ),

            product?.stockStatus ||
              'Unknown',

            formatCurrency(
              Number(
                product?.price ??
                  0
              )
            ),
          ]);
        }
      );

      // =====================================================
      // CREATE CSV
      // =====================================================

      const csvContent =
        reportRows
          .map(
            (row) =>
              row
                .map(
                  escapeCsvValue
                )
                .join(',')
          )
          .join('\n');

      const blob =
        new Blob(
          [csvContent],
          {
            type: 'text/csv;charset=utf-8;',
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          'a'
        );

      link.href = url;

      link.download =
        `meera-fashion-business-report-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );
    } catch (err) {
      console.error(
        'Failed to generate report:',
        err
      );
    } finally {
      setDownloading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading &&
    !analytics
  ) {
    return (
      <div className="space-y-6 animate-fadeIn">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-xl font-serif font-bold text-[#241B20]">
              Analytics & Reports
            </h3>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Loading real-time business analytics...
            </p>

          </div>

          <Loader2 className="w-5 h-5 text-[#9E315A] animate-spin" />

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-32 rounded-3xl bg-white border border-rose-100 animate-pulse"
              />
            )
          )}

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="space-y-6">

        <div className="bg-white border border-rose-100 rounded-3xl p-8 text-center shadow-sm">

          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-3">

            <TrendingUp className="w-5 h-5 text-[#9E315A]" />

          </div>

          <h3 className="font-serif font-bold text-[#241B20]">
            Analytics Unavailable
          </h3>

          <p className="text-xs text-[#8C5D6C] mt-1">
            {error}
          </p>

          <button
            onClick={
              fetchAnalytics
            }
            className="mt-4 inline-flex items-center gap-2 bg-[#9E315A] hover:bg-[#832247] text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>

        </div>

      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    summary,
    revenueByCategory,
  } = analytics;

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div>

          <h3 className="text-xl font-serif font-bold text-[#241B20]">
            Analytics & Reports
          </h3>

          <p className="text-xs text-[#8C5D6C] mt-1">
            Real-time business analysis from
            products, enquiries and invoices.
          </p>

        </div>

        <div className="flex items-center gap-2 flex-wrap">

          <select
            value={range}
            onChange={(e) =>
              setRange(
                e.target.value as AnalyticsRange
              )
            }
            className="bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#3E2F37] outline-none"
          >
            <option value="7">
              Last 7 Days
            </option>

            <option value="30">
              Last 30 Days
            </option>

            <option value="90">
              Last 90 Days
            </option>

            <option value="all">
              All Time
            </option>
          </select>

          <button
            onClick={
              downloadReport
            }
            disabled={
              downloading ||
              !analytics
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#9E315A] hover:bg-[#832247] disabled:opacity-50 text-white text-xs font-bold transition-colors"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}

            {downloading
              ? 'Preparing...'
              : 'Download Report'}
          </button>

          <button
            onClick={
              fetchAnalytics
            }
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-rose-200 text-[#9E315A] hover:bg-rose-50"
            title="Refresh Analytics"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </button>

        </div>

      </div>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Verified Revenue
              </p>

              <h4 className="text-2xl font-serif font-bold text-[#9E315A] mt-1">
                {formatCurrency(
                  summary.totalRevenue
                )}
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-rose-50">
              <TrendingUp className="w-4 h-4 text-[#9E315A]" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            From verified / completed invoices
          </p>

        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Total Orders
              </p>

              <h4 className="text-2xl font-serif font-bold text-[#241B20] mt-1">
                {summary.totalOrders}
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-rose-50">
              <ShoppingBag className="w-4 h-4 text-[#9E315A]" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            Invoices created during period
          </p>

        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Catalog Products
              </p>

              <h4 className="text-2xl font-serif font-bold text-[#241B20] mt-1">
                {productAnalysis.totalProducts}
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-rose-50">
              <Package className="w-4 h-4 text-[#9E315A]" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            Products currently in database
          </p>

        </div>

        <div className="p-5 rounded-3xl bg-white border border-amber-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Pending Orders
              </p>

              <h4 className="text-2xl font-serif font-bold text-amber-700 mt-1">
                {
                  enquiryAnalysis.pendingEnquiries
                }
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-amber-50">
              <MessageCircle className="w-4 h-4 text-amber-700" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            Enquiries with status "New"
          </p>

        </div>

      </div>

      {/* =====================================================
          STOCK CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white rounded-3xl border border-rose-100 p-5">

          <div className="flex items-center gap-2">

            <div className="p-2 rounded-xl bg-emerald-50">
              <Boxes className="w-4 h-4 text-emerald-700" />
            </div>

            <p className="text-xs text-[#8C5D6C]">
              Total Stock
            </p>

          </div>

          <p className="text-2xl font-serif font-bold text-[#241B20] mt-2">
            {
              productAnalysis.totalStockQuantity
            }
          </p>

          <p className="text-[11px] text-[#8C5D6C] mt-1">
            Units currently available
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-amber-100 p-5">

          <div className="flex items-center gap-2">

            <div className="p-2 rounded-xl bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>

            <p className="text-xs text-[#8C5D6C]">
              Low Stock
            </p>

          </div>

          <p className="text-2xl font-serif font-bold text-amber-700 mt-2">
            {
              productAnalysis.lowStock
            }
          </p>

          <p className="text-[11px] text-[#8C5D6C] mt-1">
            Products requiring attention
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-red-100 p-5">

          <div className="flex items-center gap-2">

            <div className="p-2 rounded-xl bg-red-50">
              <Package className="w-4 h-4 text-red-700" />
            </div>

            <p className="text-xs text-[#8C5D6C]">
              Out of Stock
            </p>

          </div>

          <p className="text-2xl font-serif font-bold text-red-700 mt-2">
            {
              productAnalysis.outOfStock
            }
          </p>

          <p className="text-[11px] text-[#8C5D6C] mt-1">
            Products with zero quantity
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-emerald-100 p-5">

          <div className="flex items-center gap-2">

            <div className="p-2 rounded-xl bg-emerald-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>

            <p className="text-xs text-[#8C5D6C]">
              Delivered Orders
            </p>

          </div>

          <p className="text-2xl font-serif font-bold text-emerald-700 mt-2">
            {
              enquiryAnalysis.deliveredEnquiries
            }
          </p>

          <p className="text-[11px] text-[#8C5D6C] mt-1">
            Enquiries with status "Delivered"
          </p>

        </div>

      </div>

      {/* =====================================================
          ENQUIRY ANALYSIS
      ===================================================== */}

      <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h4 className="font-serif font-bold text-lg text-[#241B20]">
              Enquiry Analysis
            </h4>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Real-time analysis from customer enquiries database.
            </p>

          </div>

          <ClipboardList className="w-5 h-5 text-[#9E315A]" />

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">

          <div className="rounded-2xl bg-rose-50 p-4">

            <p className="text-[11px] text-[#8C5D6C]">
              Total
            </p>

            <p className="text-xl font-bold text-[#241B20] mt-1">
              {
                enquiryAnalysis.totalEnquiries
              }
            </p>

          </div>

          <div className="rounded-2xl bg-amber-50 p-4">

            <p className="text-[11px] text-[#8C5D6C]">
              New / Pending
            </p>

            <p className="text-xl font-bold text-amber-700 mt-1">
              {
                enquiryAnalysis.pendingEnquiries
              }
            </p>

          </div>

          <div className="rounded-2xl bg-blue-50 p-4">

            <p className="text-[11px] text-[#8C5D6C]">
              Contacted
            </p>

            <p className="text-xl font-bold text-blue-700 mt-1">
              {
                enquiryAnalysis.contactedEnquiries
              }
            </p>

          </div>

          <div className="rounded-2xl bg-emerald-50 p-4">

            <p className="text-[11px] text-[#8C5D6C]">
              Delivered
            </p>

            <p className="text-xl font-bold text-emerald-700 mt-1">
              {
                enquiryAnalysis.deliveredEnquiries
              }
            </p>

          </div>

          <div className="rounded-2xl bg-green-50 p-4">

            <p className="text-[11px] text-[#8C5D6C]">
              Converted
            </p>

            <p className="text-xl font-bold text-green-700 mt-1">
              {
                enquiryAnalysis.completedEnquiries
              }
            </p>

          </div>

        </div>

        <div className="mt-6">

          <div className="flex justify-between items-center mb-2">

            <span className="text-xs font-semibold text-[#3E2F37]">
              Enquiry Conversion
            </span>

            <span className="text-xs font-bold text-emerald-700">
              {formatPercentage(
                enquiryAnalysis.conversionRate
              )}
            </span>

          </div>

          <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  enquiryAnalysis.conversionRate,
                  100
                )}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          BUSINESS OVERVIEW
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-3xl border border-rose-100 p-5">

          <p className="text-xs text-[#8C5D6C]">
            Verified Invoice Orders
          </p>

          <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">
            {
              summary.paidOrders
            }
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-amber-100 p-5">

          <p className="text-xs text-[#8C5D6C]">
            Pending Orders
          </p>

          <p className="text-2xl font-serif font-bold text-amber-700 mt-1">
            {
              enquiryAnalysis.pendingEnquiries
            }
          </p>

          <p className="text-[11px] text-[#8C5D6C] mt-1">
            Based on New enquiries
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-rose-100 p-5">

          <p className="text-xs text-[#8C5D6C]">
            Customer Enquiries
          </p>

          <p className="text-2xl font-serif font-bold text-[#9E315A] mt-1">
            {
              enquiryAnalysis.totalEnquiries
            }
          </p>

        </div>

      </div>

      {/* =====================================================
          REVENUE BY COLLECTION
      ===================================================== */}

      <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h4 className="font-serif font-bold text-lg text-[#241B20]">
              Revenue by Collection
            </h4>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Calculated from actual verified invoice items.
            </p>

          </div>

          <ArrowUpRight className="w-5 h-5 text-[#9E315A]" />

        </div>

        {revenueByCategory.length ===
        0 ? (

          <div className="py-10 text-center text-xs text-[#8C5D6C]">
            No verified revenue available
            for this period.
          </div>

        ) : (

          <div className="space-y-4">

            {revenueByCategory.map(
              (item) => (

                <div
                  key={
                    item.category
                  }
                >

                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">

                    <span className="text-[#3E2F37]">
                      {formatCategory(
                        item.category
                      )}
                    </span>

                    <span className="text-[#9E315A]">
                      {formatPercentage(
                        item.percentage
                      )}{' '}
                      (
                      {formatCurrency(
                        item.revenue
                      )}
                      )
                    </span>

                  </div>

                  <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#9E315A] rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          item.percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================================
          TOP SELLING PRODUCTS
      ===================================================== */}

      <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h4 className="font-serif font-bold text-lg text-[#241B20]">
              Top Selling Products
            </h4>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Based only on products from enquiries
              with status "Delivered".
            </p>

          </div>

          <ShoppingBag className="w-5 h-5 text-[#9E315A]" />

        </div>

        {enquiryTopSellingProducts.length ===
        0 ? (

          <div className="py-10 text-center">

            <ShoppingBag className="w-8 h-8 mx-auto text-rose-200 mb-3" />

            <p className="text-xs text-[#8C5D6C]">
              No delivered product sales available.
            </p>

            <p className="text-[11px] text-[#B18A98] mt-1">
              Products will appear here when an enquiry
              is marked as Delivered.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-rose-100">

                  <th className="text-left py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Product
                  </th>

                  <th className="text-left py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Category
                  </th>

                  <th className="text-center py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Units
                  </th>

                  <th className="text-right py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Price
                  </th>

                  <th className="text-right py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Revenue
                  </th>

                </tr>

              </thead>

              <tbody>

                {enquiryTopSellingProducts.map(
                  (
                    product,
                    index
                  ) => (

                    <tr
                      key={
                        product.productId
                      }
                      className="border-b border-rose-50 last:border-0"
                    >

                      {/* PRODUCT */}

                      <td className="py-4">

                        <div className="flex items-center gap-3">

                          <span className="w-7 h-7 shrink-0 rounded-lg bg-rose-50 flex items-center justify-center text-[10px] font-bold text-[#9E315A]">
                            {index + 1}
                          </span>

                          {product.image ? (

                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              className="w-11 h-11 rounded-xl object-cover border border-rose-100"
                              onError={(
                                e
                              ) => {
                                e.currentTarget.style.display =
                                  'none';
                              }}
                            />

                          ) : (

                            <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">

                              <Package className="w-4 h-4 text-[#9E315A]" />

                            </div>

                          )}

                          <div className="min-w-0">

                            <p className="text-xs font-semibold text-[#241B20] truncate max-w-[180px]">
                              {
                                product.name
                              }
                            </p>

                            <p className="text-[10px] text-[#8C5D6C] mt-0.5">
                              Stock:{' '}
                              {
                                product.stockQuantity
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CATEGORY */}

                      <td className="py-4">

                        <span className="inline-flex px-2.5 py-1 rounded-full bg-rose-50 text-[10px] font-semibold text-[#9E315A]">
                          {formatCategory(
                            product.category
                          )}
                        </span>

                      </td>

                      {/* UNITS */}

                      <td className="py-4 text-center">

                        <span className="text-xs font-bold text-[#3E2F37]">
                          {
                            product.quantity
                          }
                        </span>

                      </td>

                      {/* PRICE */}

                      <td className="py-4 text-right text-xs font-semibold text-[#5A4550]">

                        {formatCurrency(
                          product.price
                        )}

                      </td>

                      {/* REVENUE */}

                      <td className="py-4 text-right text-xs font-bold text-[#9E315A]">

                        {formatCurrency(
                          product.revenue
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};