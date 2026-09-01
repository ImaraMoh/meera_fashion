// routes/analytics.ts

import { Router, Request, Response } from 'express';
import pkg from 'pg';

const { Pool } = pkg;

const router = Router();

/**
 * Analytics uses the same PostgreSQL environment
 * as the main server.
 */
const createPool = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    '';

  if (connectionString) {
    return new Pool({
      connectionString,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });
  }

  return new Pool({
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database:
      process.env.PGDATABASE || 'meera_fashion',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });
};

const pool = createPool();

/**
 * Safely convert values to numbers.
 */
const toNumber = (
  value: unknown,
  fallback = 0
): number => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : fallback;
};

/**
 * Convert PostgreSQL snake_case keys
 * to frontend camelCase keys.
 */
const camelCase = (value: string): string =>
  value.replace(
    /_([a-z])/g,
    (_, letter: string) =>
      letter.toUpperCase()
  );

const normalizeKeys = (
  value: any
): any => {
  if (Array.isArray(value)) {
    return value.map(normalizeKeys);
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, item]) => [
          camelCase(key),
          normalizeKeys(item),
        ]
      )
    );
  }

  return value;
};

/**
 * Safely parse invoice items.
 */
const getInvoiceItems = (
  value: unknown
): any[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
};

/**
 * GET /api/analytics?range=7
 * GET /api/analytics?range=30
 * GET /api/analytics?range=90
 */
router.get(
  '/analytics',
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const range = String(
        req.query.range || '30'
      );

      const now = new Date();

      let startDate: Date | null = null;

      if (range === '7') {
        startDate = new Date(now);
        startDate.setDate(
          now.getDate() - 7
        );
      } else if (range === '30') {
        startDate = new Date(now);
        startDate.setDate(
          now.getDate() - 30
        );
      } else if (range === '90') {
        startDate = new Date(now);
        startDate.setDate(
          now.getDate() - 90
        );
      }

      console.log(
        '📊 Analytics request:',
        {
          range,
          startDate,
        }
      );

      // -------------------------------------------------------
      // PRODUCTS
      // -------------------------------------------------------

      const productsResult =
        await pool.query(`
          SELECT
            id,
            category,
            name,
            price
          FROM products
        `);

      const products =
        productsResult.rows.map(
          normalizeKeys
        );

      const productCount =
        products.length;

      // -------------------------------------------------------
      // INVOICES
      // -------------------------------------------------------

      let invoiceQuery = `
        SELECT *
        FROM invoices
      `;

      const invoiceParams: any[] = [];

      if (startDate) {
        invoiceQuery += `
          WHERE created_at >= $1
        `;

        invoiceParams.push(
          startDate
        );
      }

      invoiceQuery += `
        ORDER BY created_at DESC
      `;

      const invoicesResult =
        await pool.query(
          invoiceQuery,
          invoiceParams
        );

      const invoices =
        invoicesResult.rows.map(
          normalizeKeys
        );

      // -------------------------------------------------------
      // ENQUIRIES
      // -------------------------------------------------------

      let enquiryQuery = `
        SELECT
          id,
          status,
          created_at,
          total
        FROM enquiries
      `;

      const enquiryParams: any[] = [];

      if (startDate) {
        enquiryQuery += `
          WHERE created_at >= $1
        `;

        enquiryParams.push(
          startDate
        );
      }

      enquiryQuery += `
        ORDER BY created_at DESC
      `;

      const enquiriesResult =
        await pool.query(
          enquiryQuery,
          enquiryParams
        );

      const enquiries =
        enquiriesResult.rows.map(
          normalizeKeys
        );

      // -------------------------------------------------------
      // PAID INVOICES
      // -------------------------------------------------------

      const paidStatuses = [
        'paid',
        'completed',
        'confirmed',
        'verified',
      ];

      const paidInvoices =
        invoices.filter(
          (invoice: any) => {
            const status =
              String(
                invoice.status || ''
              ).toLowerCase();

            return paidStatuses.includes(
              status
            );
          }
        );

      // -------------------------------------------------------
      // REVENUE
      // -------------------------------------------------------

      const totalRevenue =
        paidInvoices.reduce(
          (
            sum: number,
            invoice: any
          ) => {
            return (
              sum +
              toNumber(
                invoice.total,
                0
              )
            );
          },
          0
        );

      // -------------------------------------------------------
      // ORDERS
      // -------------------------------------------------------

      const totalOrders =
        invoices.length;

      const paidOrders =
        paidInvoices.length;

      const pendingStatuses = [
        'draft',
        'pending',
        'unpaid',
      ];

      const pendingOrders =
        invoices.filter(
          (invoice: any) => {
            const status =
              String(
                invoice.status || ''
              ).toLowerCase();

            return pendingStatuses.includes(
              status
            );
          }
        ).length;

      // -------------------------------------------------------
      // ENQUIRIES
      // -------------------------------------------------------

      const totalEnquiries =
        enquiries.length;

      const conversionRate =
        totalEnquiries > 0
          ? Number(
              (
                (paidOrders /
                  totalEnquiries) *
                100
              ).toFixed(2)
            )
          : 0;

      // -------------------------------------------------------
      // CATEGORY REVENUE
      // -------------------------------------------------------

      const categoryRevenue: Record<
        string,
        number
      > = {};

      for (const invoice of paidInvoices) {
        const items =
          getInvoiceItems(
            invoice.items
          );

        for (const item of items) {
          const productId =
            item?.productId ||
            item?.product_id ||
            item?.id;

          const product =
            products.find(
              (product: any) =>
                String(product.id) ===
                String(productId)
            );

          const category =
            product?.category ||
            item?.category ||
            'Other';

          const quantity =
            toNumber(
              item?.quantity,
              1
            );

          const unitPrice =
            toNumber(
              item?.unitPrice ??
                item?.unit_price ??
                item?.price,
              0
            );

          const revenue =
            quantity * unitPrice;

          categoryRevenue[
            category
          ] =
            (categoryRevenue[
              category
            ] || 0) + revenue;
        }
      }

      const totalCategoryRevenue =
        Object.values(
          categoryRevenue
        ).reduce(
          (
            sum,
            value
          ) => sum + value,
          0
        );

      const revenueByCategory =
        Object.entries(
          categoryRevenue
        )
          .map(
            ([
              category,
              revenue,
            ]) => ({
              category,
              revenue,
              percentage:
                totalCategoryRevenue >
                0
                  ? Number(
                      (
                        (revenue /
                          totalCategoryRevenue) *
                        100
                      ).toFixed(2)
                    )
                  : 0,
            })
          )
          .sort(
            (a, b) =>
              b.revenue -
              a.revenue
          );

      // -------------------------------------------------------
      // TOP PRODUCTS
      // -------------------------------------------------------

      const productSales: Record<
        string,
        {
          quantity: number;
          revenue: number;
        }
      > = {};

      for (const invoice of paidInvoices) {
        const items =
          getInvoiceItems(
            invoice.items
          );

        for (const item of items) {
          const productId =
            item?.productId ||
            item?.product_id ||
            item?.id;

          if (!productId) {
            continue;
          }

          const quantity =
            toNumber(
              item?.quantity,
              1
            );

          const unitPrice =
            toNumber(
              item?.unitPrice ??
                item?.unit_price ??
                item?.price,
              0
            );

          const key =
            String(productId);

          if (!productSales[key]) {
            productSales[key] = {
              quantity: 0,
              revenue: 0,
            };
          }

          productSales[key].quantity +=
            quantity;

          productSales[key].revenue +=
            quantity * unitPrice;
        }
      }

      const topProducts =
        Object.entries(
          productSales
        )
          .map(
            ([
              productId,
              data,
            ]) => {
              const product =
                products.find(
                  (item: any) =>
                    String(
                      item.id
                    ) ===
                    String(
                      productId
                    )
                );

              return {
                productId,
                name:
                  product?.name ||
                  'Unknown Product',
                quantity:
                  data.quantity,
                revenue:
                  data.revenue,
              };
            }
          )
          .sort(
            (a, b) =>
              b.revenue -
              a.revenue
          )
          .slice(0, 10);

      // -------------------------------------------------------
      // RESPONSE
      // -------------------------------------------------------

      const response = {
        success: true,

        period: range,

        summary: {
          totalRevenue,
          totalOrders,
          paidOrders,
          pendingOrders,
          totalEnquiries,
          conversionRate,
          productCount,
        },

        revenueByCategory,

        topProducts,
      };

      console.log(
        '✅ Analytics loaded:',
        {
          totalRevenue,
          totalOrders,
          paidOrders,
          totalEnquiries,
          productCount,
        }
      );

      return res.json(
        response
      );
    } catch (error) {
      console.error(
        '❌ Analytics error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to load analytics',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }
);

export default router;