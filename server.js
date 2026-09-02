import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';

dotenv.config();

const { Pool } = pkg;

/* =========================================================
   HELPERS
========================================================= */

const camelCase = (value) => {
  if (typeof value !== 'string') return value;

  return value.replace(/_([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );
};

const normalizeKeys = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeKeys);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        camelCase(key),
        normalizeKeys(item),
      ])
    );
  }

  return value;
};

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : fallback;
};

const normalizeJsonArray = (value) => {
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

const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;

  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
};

const normalizeInvoiceItems = (value) => {
  let items = value;

  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return {
        description: 'Boutique Item',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        productId: null,
        selectedSize: null,
      };
    }

    const normalized = normalizeKeys(item);

    const quantity = toNumber(
      normalized.quantity,
      1
    );

    const unitPrice = toNumber(
      normalized.unitPrice ??
        normalized.price,
      0
    );

    const total = toNumber(
      normalized.total ??
        normalized.lineTotal ??
        quantity * unitPrice,
      quantity * unitPrice
    );

    return {
      ...normalized,

      // Always return React-safe scalar values
      description: safeString(
        normalized.description,
        'Boutique Item'
      ),

      productId:
        normalized.productId !== undefined &&
        normalized.productId !== null
          ? safeString(normalized.productId)
          : null,

      selectedSize:
        normalized.selectedSize !== undefined &&
        normalized.selectedSize !== null
          ? safeString(normalized.selectedSize)
          : null,

      quantity,

      unitPrice,

      total,

      // Prevent nested objects from accidentally being rendered
      category:
        typeof normalized.category === 'string'
          ? normalized.category
          : '',

      color:
        typeof normalized.color === 'string'
          ? normalized.color
          : '',
    };
  });
};

const normalizeProductRow = (row) => {
  const normalized = normalizeKeys(row);

  normalized.price = toNumber(
    normalized.price,
    0
  );

  normalized.originalPrice =
    normalized.originalPrice === null ||
    normalized.originalPrice === undefined
      ? undefined
      : toNumber(
          normalized.originalPrice,
          0
        );

  normalized.discountPercentage =
    normalized.discountPercentage === null ||
    normalized.discountPercentage === undefined
      ? undefined
      : Number(
          normalized.discountPercentage
        );

  normalized.stockQuantity =
    normalized.stockQuantity === null ||
    normalized.stockQuantity === undefined
      ? 0
      : Number(
          normalized.stockQuantity
        );

  normalized.isPreOrder =
    Boolean(normalized.isPreOrder);

  normalized.isFeatured =
    Boolean(normalized.isFeatured);

  normalized.isNewArrival =
    Boolean(normalized.isNewArrival);

  normalized.isOffer =
    Boolean(normalized.isOffer);

  normalized.isDancePerformance =
    Boolean(
      normalized.isDancePerformance
    );

  return normalized;
};

const normalizeSettingRow = (row) => {
  const normalized = normalizeKeys(row);

  normalized.showAnnouncement =
    Boolean(
      normalized.showAnnouncement
    );

  normalized.enableRentalMode =
    Boolean(
      normalized.enableRentalMode
    );

  return normalized;
};

const normalizeArrayResponse = (
  rows,
  customNormalizers = []
) => {
  return rows.map((row) => {
    let normalized = normalizeKeys(row);

    for (const transformer of customNormalizers) {
      normalized = transformer(
        normalized
      );
    }

    return normalized;
  });
};

/* =========================================================
   DATABASE
========================================================= */

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
          ? {
              rejectUnauthorized: false,
            }
          : false,

      max: Number(
        process.env.PGPOOL_MAX || 10
      ),

      idleTimeoutMillis: 30000,

      connectionTimeoutMillis: 10000,
    });
  }

  return new Pool({
    host:
      process.env.PGHOST ||
      '127.0.0.1',

    port: Number(
      process.env.PGPORT || 5432
    ),

    user:
      process.env.PGUSER ||
      'postgres',

    password:
      process.env.PGPASSWORD ||
      'postgres',

    database:
      process.env.PGDATABASE ||
      'meera_fashion',

    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,

    max: Number(
      process.env.PGPOOL_MAX || 10
    ),

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000,
  });
};

/* =========================================================
   CORS
========================================================= */

const isLocalDevelopmentOrigin = (
  origin
) => {
  if (!origin) {
    return true;
  }

  /*
   * Allow:
   *
   * localhost
   * 127.0.0.1
   * 0.0.0.0
   * 10.x.x.x
   * 172.16.x.x - 172.31.x.x
   * 192.168.x.x
   *
   * Example:
   * http://172.20.10.2:3000
   */

  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/i.test(
    origin
  );
};

/* =========================================================
   APP
========================================================= */

export function createApp() {
  const app = express();

  const pool = createPool();

  /* -------------------------------------------------------
     ALLOWED ORIGINS
  ------------------------------------------------------- */

  const envOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VITE_API_BASE_URL,
    process.env.ALLOWED_ORIGINS,
  ]
    .flatMap((value) =>
      typeof value === 'string'
        ? value.split(',')
        : []
    )
    .map((value) =>
      value.trim()
    )
    .filter(Boolean);

  const allowedOrigins =
    new Set(envOrigins);

  /*
   * IMPORTANT:
   * If frontend is running at:
   *
   * http://172.20.10.2:3000
   *
   * it will now be accepted.
   */

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.has(origin) ||
          isLocalDevelopmentOrigin(origin)
        ) {
          callback(null, true);
          return;
        }

        console.warn(
          `Blocked CORS origin: ${origin}`
        );

        callback(
          new Error(
            'Not allowed by CORS'
          )
        );
      },

      credentials: true,

      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],

      /*
       * IMPORTANT:
       * x-device-id was missing before.
       */

      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'x-device-id',
        'x-session-id',
        'x-client-id',
      ],

      exposedHeaders: [
        'Content-Length',
        'Content-Type',
      ],

      optionsSuccessStatus: 204,
    })
  );

  /*
   * Explicitly handle preflight requests.
   */

  app.options(
    '*',
    cors()
  );

  /* -------------------------------------------------------
     BODY PARSER
  ------------------------------------------------------- */

  app.use(
    express.json({
      limit: '10mb',
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: '10mb',
    })
  );

  /* =======================================================
     HEALTH
  ======================================================= */

  app.get(
    '/api/health',
    async (req, res) => {
      try {
        const result =
          await pool.query(
            'SELECT 1 AS ok'
          );

        return res.json({
          status: 'ok',
          database: 'postgres',
          postgres:
            result.rows[0]?.ok === 1
              ? 'connected'
              : 'unknown',
        });
      } catch (error) {
        console.error(
          'Database health check failed:',
          error
        );

        return res.json({
          status: 'ok',
          database: 'postgres',
          postgres: 'not_connected',

          message:
            'PostgreSQL/Neon is not connected yet. The backend is ready and will connect when the database is available.',
        });
      }
    }
  );

  /* =======================================================
     ANALYTICS
  ======================================================= */

  app.get(
    '/api/analytics',
    async (req, res) => {
      try {
        const range = String(
          req.query.range || '30'
        );

        const now = new Date();

        const startDate =
          new Date(now);

        if (range === '7') {
          startDate.setDate(
            now.getDate() - 7
          );
        } else if (range === '90') {
          startDate.setDate(
            now.getDate() - 90
          );
        } else {
          startDate.setDate(
            now.getDate() - 30
          );
        }

        /* -------------------------------------------------
           PRODUCTS
        ------------------------------------------------- */

        const productsResult =
          await pool.query(`
            SELECT
              id,
              name,
              category,
              price
            FROM products
          `);

        const products =
          productsResult.rows;

        /* -------------------------------------------------
           INVOICES
        ------------------------------------------------- */

        const invoicesResult =
          await pool.query(
            `
              SELECT *
              FROM invoices
              WHERE created_at >= $1
              ORDER BY created_at DESC
            `,
            [startDate]
          );

        const invoices =
          invoicesResult.rows;

        /* -------------------------------------------------
           ENQUIRIES
        ------------------------------------------------- */

        const enquiriesResult =
          await pool.query(
            `
              SELECT
                id,
                status,
                created_at,
                total
              FROM enquiries
              WHERE created_at >= $1
              ORDER BY created_at DESC
            `,
            [startDate]
          );

        const enquiries =
          enquiriesResult.rows;

        /* -------------------------------------------------
           PAID INVOICES
        ------------------------------------------------- */

        const paidInvoices =
          invoices.filter(
            (invoice) => {
              const status =
                String(
                  invoice.status || ''
                ).toLowerCase();

              return [
                'paid',
                'completed',
                'confirmed',
                'verified',
              ].includes(status);
            }
          );

        /* -------------------------------------------------
           REVENUE
        ------------------------------------------------- */

        const totalRevenue =
          paidInvoices.reduce(
            (sum, invoice) =>
              sum +
              Number(
                invoice.total || 0
              ),
            0
          );

        /* -------------------------------------------------
           ORDERS
        ------------------------------------------------- */

        const totalOrders =
          invoices.length;

        const paidOrders =
          paidInvoices.length;

        const pendingOrders =
          invoices.filter(
            (invoice) => {
              const status =
                String(
                  invoice.status || ''
                ).toLowerCase();

              return [
                'draft',
                'pending',
                'unpaid',
              ].includes(status);
            }
          ).length;

        /* -------------------------------------------------
           ENQUIRIES
        ------------------------------------------------- */

        const totalEnquiries =
          enquiries.length;

        const conversionRate =
          totalEnquiries > 0
            ? (paidOrders /
                totalEnquiries) *
              100
            : 0;

        /* -------------------------------------------------
           CATEGORY REVENUE
        ------------------------------------------------- */

        const categoryRevenue = {};

        for (const invoice of paidInvoices) {
          const items =
            normalizeJsonArray(
              invoice.items
            );

          for (const item of items) {
            const productId =
              item.productId ||
              item.product_id ||
              item.id;

            const product =
              products.find(
                (p) =>
                  String(p.id) ===
                  String(productId)
              );

            const category =
              product?.category ||
              item.category ||
              'Other';

            const quantity =
              Number(
                item.quantity || 1
              );

            const unitPrice =
              Number(
                item.unitPrice ||
                  item.unit_price ||
                  item.price ||
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
            (sum, value) =>
              sum + Number(value),
            0
          );

        const revenueByCategory =
          Object.entries(
            categoryRevenue
          )
            .map(
              ([category, revenue]) => ({
                category,
                revenue:
                  Number(revenue),

                percentage:
                  totalCategoryRevenue >
                  0
                    ? (Number(revenue) /
                        totalCategoryRevenue) *
                      100
                    : 0,
              })
            )
            .sort(
              (a, b) =>
                b.revenue -
                a.revenue
            );

        /* -------------------------------------------------
           TOP PRODUCTS
        ------------------------------------------------- */

        const productSales = {};

        for (const invoice of paidInvoices) {
          const items =
            normalizeJsonArray(
              invoice.items
            );

          for (const item of items) {
            const productId =
              item.productId ||
              item.product_id ||
              item.id;

            if (!productId) {
              continue;
            }

            const key =
              String(productId);

            const quantity =
              Number(
                item.quantity || 1
              );

            const unitPrice =
              Number(
                item.unitPrice ||
                  item.unit_price ||
                  item.price ||
                  0
              );

            if (!productSales[key]) {
              productSales[key] = {
                quantity: 0,
                revenue: 0,
              };
            }

            productSales[key]
              .quantity += quantity;

            productSales[key]
              .revenue +=
              quantity *
              unitPrice;
          }
        }

        const topProducts =
          Object.entries(
            productSales
          )
            .map(
              ([productId, data]) => {
                const product =
                  products.find(
                    (p) =>
                      String(p.id) ===
                      String(productId)
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

        return res.json({
          success: true,

          period: range,

          summary: {
            totalRevenue,
            totalOrders,
            paidOrders,
            pendingOrders,
            totalEnquiries,
            conversionRate,
            productCount:
              products.length,
          },

          revenueByCategory,

          topProducts,
        });
      } catch (error) {
        console.error(
          'Analytics error:',
          error
        );

        return res.status(500).json({
          success: false,

          message:
            'Failed to load analytics.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  /* =======================================================
     PRODUCTS
  ======================================================= */

  app.get(
    '/api/products',
    async (req, res) => {
      try {
        const result =
          await pool.query(`
            SELECT *
            FROM products
            ORDER BY
              "updatedAt" DESC,
              id DESC
          `);

        return res.json(
          result.rows.map(
            normalizeProductRow
          )
        );
      } catch (error) {
        console.error(
          'Failed to load products:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to load products.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  app.post(
    '/api/products',
    async (req, res) => {
      try {
        const toTimestamp = (
          value,
          fallback = new Date().toISOString()
        ) => {
          if (
            value === undefined ||
            value === null ||
            value === '' ||
            typeof value !== 'string'
          ) {
            return fallback;
          }

          const date = new Date(value);

          if (Number.isNaN(date.getTime())) {
            return fallback;
          }

          return date.toISOString();
        };
        const items =
          Array.isArray(req.body)
            ? req.body
            : req.body
              ? [req.body]
              : [];

        for (const product of items) {
          const values = [
            product.id ||
              `prod-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

            product.name || '',

            product.slug || '',

            product.category ||
              'sarees',

            product.subcategory || '',

            toNumber(
              product.price,
              0
            ),

            product.originalPrice ===
                undefined ||
            product.originalPrice ===
                null
              ? null
              : toNumber(
                  product.originalPrice,
                  0
                ),

            product.discountPercentage ===
                undefined ||
            product.discountPercentage ===
                null
              ? null
              : Number(
                  product.discountPercentage
                ),

            product.description || '',

            product.shortDescription ||
              '',

            product.material || '',

            product.color || '',

            product.stockStatus ||
              'In Stock',

            product.stockQuantity ===
                undefined ||
            product.stockQuantity ===
                null
              ? 0
              : Number(
                  product.stockQuantity
                ),

            Boolean(
              product.isPreOrder
            ),

            Boolean(
              product.isFeatured
            ),

            Boolean(
              product.isNewArrival
            ),

            Boolean(
              product.isOffer
            ),

            Boolean(
              product.isDancePerformance
            ),

            JSON.stringify(
              product.images ?? {}
            ),

            toTimestamp(product.createdAt),
            toTimestamp(product.updatedAt),
          ];

          await pool.query(
            `
              INSERT INTO products (
                id,
                name,
                slug,
                category,
                subcategory,
                price,
                "originalPrice",
                "discountPercentage",
                description,
                "shortDescription",
                material,
                color,
                "stockStatus",
                "stockQuantity",
                "isPreOrder",
                "isFeatured",
                "isNewArrival",
                "isOffer",
                "isDancePerformance",
                images,
                "createdAt",
                "updatedAt"
              )
              VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,
                $9,$10,$11,$12,$13,$14,$15,
                $16,$17,$18,$19,$20,$21,$22
              )

              ON CONFLICT (id)
              DO UPDATE SET
                name = EXCLUDED.name,
                slug = EXCLUDED.slug,
                category = EXCLUDED.category,
                subcategory = EXCLUDED.subcategory,
                price = EXCLUDED.price,
                "originalPrice" =
                  EXCLUDED."originalPrice",
                "discountPercentage" =
                  EXCLUDED."discountPercentage",
                description =
                  EXCLUDED.description,
                "shortDescription" =
                  EXCLUDED."shortDescription",
                material =
                  EXCLUDED.material,
                color =
                  EXCLUDED.color,
                "stockStatus" =
                  EXCLUDED."stockStatus",
                "stockQuantity" =
                  EXCLUDED."stockQuantity",
                "isPreOrder" =
                  EXCLUDED."isPreOrder",
                "isFeatured" =
                  EXCLUDED."isFeatured",
                "isNewArrival" =
                  EXCLUDED."isNewArrival",
                "isOffer" =
                  EXCLUDED."isOffer",
                "isDancePerformance" =
                  EXCLUDED."isDancePerformance",
                images =
                  EXCLUDED.images,
                "updatedAt" =
                  EXCLUDED."updatedAt"
            `,
            values
          );
        }

        return res.json({
          ok: true,
          count: items.length,
        });
      } catch (error) {
        console.error(
          'Failed to save products:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to save products.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  /* =======================================================
     SELECTION
  ======================================================= */

  app.get(
    '/api/selection',
    async (req, res) => {
      try {
        const sessionId =
          req.headers['x-device-id'] ||
          req.headers['x-session-id'] ||
          'default';

        const result =
          await pool.query(
            `
              SELECT *
              FROM selection_items
              WHERE session_id = $1
              ORDER BY added_at DESC
            `,
            [String(sessionId)]
          );

        return res.json(
          result.rows.map((row) => {
            const normalized =
              normalizeKeys(row);

            normalized.product =
              normalized.product &&
              typeof normalized.product ===
                'object'
                ? normalized.product
                : {};

            normalized.quantity =
              Number(
                normalized.quantity || 1
              );

            normalized.unitPrice =
              toNumber(
                normalized.unitPrice,
                0
              );

            return normalized;
          })
        );
      } catch (error) {
        console.error(
          'Failed to load selection:',
          error
        );

        return res.status(200).json([]);
      }
    }
  );

  app.post(
    '/api/selection',
    async (req, res) => {
      try {
        const items =
          Array.isArray(req.body)
            ? req.body
            : [];

        const sessionId =
          req.headers['x-device-id'] ||
          req.headers['x-session-id'] ||
          'default';

        const session =
          String(sessionId);

        await pool.query(
          `
            DELETE FROM selection_items
            WHERE session_id = $1
          `,
          [session]
        );

        for (const item of items) {
          const values = [
            item.id ||
              `sel-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

            session,

            item.productId ||
              item.product?.id ||
              '',

            JSON.stringify(
              item.product || {}
            ),

            item.selectedSize ||
              null,

            Number(
              item.quantity || 1
            ),

            toNumber(
              item.unitPrice,
              0
            ),

            item.addedAt ||
              new Date().toISOString(),
          ];

          await pool.query(
            `
              INSERT INTO selection_items (
                id,
                session_id,
                product_id,
                product,
                selected_size,
                quantity,
                unit_price,
                added_at,
                updated_at
              )
              VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,NOW()
              )
            `,
            values
          );
        }

        return res.json({
          ok: true,
          count: items.length,
        });
      } catch (error) {
        console.error(
          'Failed to save selection:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to save selection.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  /* =======================================================
     WISHLIST
  ======================================================= */

  app.get(
    '/api/wishlist',
    async (req, res) => {
      try {
        const sessionId =
          req.headers['x-device-id'] ||
          req.headers['x-session-id'] ||
          'default';

        const result =
          await pool.query(
            `
              SELECT *
              FROM wishlist_items
              WHERE session_id = $1
              ORDER BY created_at DESC
            `,
            [String(sessionId)]
          );

        return res.json(
          result.rows.map(
            (row) =>
              normalizeKeys(row)
                .productId
          )
        );
      } catch (error) {
        console.error(
          'Failed to load wishlist:',
          error
        );

        return res.status(200).json([]);
      }
    }
  );

  app.post(
    '/api/wishlist',
    async (req, res) => {
      try {
        const ids =
          Array.isArray(req.body)
            ? req.body
            : [];

        const sessionId =
          req.headers['x-device-id'] ||
          req.headers['x-session-id'] ||
          'default';

        const session =
          String(sessionId);

        await pool.query(
          `
            DELETE FROM wishlist_items
            WHERE session_id = $1
          `,
          [session]
        );

        for (const productId of ids) {
          if (!productId) {
            continue;
          }

          await pool.query(
            `
              INSERT INTO wishlist_items (
                id,
                session_id,
                product_id,
                created_at
              )
              VALUES (
                $1,$2,$3,$4
              )
            `,
            [
              `wish-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

              session,

              productId,

              new Date().toISOString(),
            ]
          );
        }

        return res.json({
          ok: true,
          count: ids.length,
        });
      } catch (error) {
        console.error(
          'Failed to save wishlist:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to save wishlist.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  /* =======================================================
     SETTINGS
  ======================================================= */

  app.get(
    '/api/settings',
    async (req, res) => {
      try {
        const result =
          await pool.query(`
            SELECT *
            FROM settings
            ORDER BY id ASC
            LIMIT 1
          `);

        return res.json(
          result.rows[0]
            ? normalizeSettingRow(
                result.rows[0]
              )
            : null
        );
      } catch (error) {
        console.error(
          'Failed to load settings:',
          error
        );

        return res.status(200).json(null);
      }
    }
  );

  app.post(
    '/api/settings',
    async (req, res) => {
      try {
        const settings =
          req.body || {};

        const row =
          await pool.query(`
            SELECT id
            FROM settings
            ORDER BY id ASC
            LIMIT 1
          `);

        const values = [
          settings.brandName ||
            "Meera's Fashion",

          settings.tagline ||
            'Traditional Clothing And Jewelleries',

          settings.phone ||
            '00447463151533',

          settings.formattedPhone ||
            '+44 7463 151533',

          settings.whatsappNumber ||
            '447463151533',

          settings.email ||
            'meerasfashion26@gmail.com',

          settings.address ||
            'London, United Kingdom',

          settings.customLogoUrl ||
            '',

          settings.instagramHandle ||
            '@meere_f21',

          settings.instagramUrl ||
            'https://www.instagram.com/meere_f21',

          settings.tiktokHandle ||
            '@mf202126',

          settings.tiktokUrl ||
            'https://www.tiktok.com/@mf202126',

          settings.facebookUrl ||
            'https://facebook.com/meerasfashion',

          settings.announcementText ||
            '🌸 Welcome to Meera Fashion Boutique — Free UK Royal Mail Delivery on Orders over £100 | WhatsApp Concierge Available',

          settings.showAnnouncement !==
          undefined
            ? Boolean(
                settings.showAnnouncement
              )
            : true,

          settings.enableRentalMode !==
          undefined
            ? Boolean(
                settings.enableRentalMode
              )
            : false,

          settings.currencySymbol ||
            '£',

          settings.currencyCode ||
            'GBP',
        ];

        /* -------------------------------------------------
           INSERT
        ------------------------------------------------- */

        if (row.rows.length === 0) {
          await pool.query(
            `
              INSERT INTO settings (
                brand_name,
                tagline,
                phone,
                formatted_phone,
                whatsapp_number,
                email,
                address,
                custom_logo_url,
                instagram_handle,
                instagram_url,
                tiktok_handle,
                tiktok_url,
                facebook_url,
                announcement_text,
                show_announcement,
                enable_rental_mode,
                currency_symbol,
                currency_code,
                created_at,
                updated_at
              )
              VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,
                $9,$10,$11,$12,$13,$14,$15,
                $16,$17,$18,NOW(),NOW()
              )
            `,
            values
          );
        }

        /* -------------------------------------------------
           UPDATE
        ------------------------------------------------- */

        else {
          await pool.query(
            `
              UPDATE settings
              SET
                brand_name = $1,
                tagline = $2,
                phone = $3,
                formatted_phone = $4,
                whatsapp_number = $5,
                email = $6,
                address = $7,
                custom_logo_url = $8,
                instagram_handle = $9,
                instagram_url = $10,
                tiktok_handle = $11,
                tiktok_url = $12,
                facebook_url = $13,
                announcement_text = $14,
                show_announcement = $15,
                enable_rental_mode = $16,
                currency_symbol = $17,
                currency_code = $18,
                updated_at = NOW()
              WHERE id = $19
            `,
            [
              ...values,
              row.rows[0].id,
            ]
          );
        }

        return res.json({
          ok: true,
        });
      } catch (error) {
        console.error(
          'Failed to save settings:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to save settings.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  /* =======================================================
     ENQUIRIES
  ======================================================= */

  app.get(
    '/api/enquiries',
    async (req, res) => {
      try {
        const result = await pool.query(`
          SELECT
            id,
            order_number,
            customer_name,
            customer_phone,
            customer_email,
            items,
            subtotal,
            discount,
            total,
            status,
            notes,
            source,

            /*
            * IMPORTANT:
            * Convert PostgreSQL timestamps into plain strings.
            * This prevents pg / Date objects from reaching React.
            */

            TO_CHAR(
              created_at,
              'YYYY-MM-DD HH24:MI:SS.MS'
            ) AS created_at,

            TO_CHAR(
              status_updated_at,
              'YYYY-MM-DD HH24:MI:SS.MS'
            ) AS status_updated_at

          FROM enquiries

          ORDER BY created_at DESC
        `);

        const enquiries =
          normalizeArrayResponse(
            result.rows,
            [
              (item) => {
                /*
                * --------------------------------------------------
                * NUMBERS
                * --------------------------------------------------
                */

                item.subtotal = toNumber(
                  item.subtotal,
                  0
                );

                item.discount = toNumber(
                  item.discount,
                  0
                );

                item.total = toNumber(
                  item.total,
                  0
                );

                /*
                * --------------------------------------------------
                * ITEMS
                * --------------------------------------------------
                */

                item.items =
                  normalizeJsonArray(
                    item.items
                  );

                /*
                * --------------------------------------------------
                * DATES
                *
                * These are ALREADY strings because of TO_CHAR()
                *
                * Example:
                * "2026-09-01 08:08:56.801"
                * --------------------------------------------------
                */

                item.created_at =
                  item.created_at || null;

                item.status_updated_at =
                  item.status_updated_at ||
                  null;

                return item;
              },
            ]
          );

        /*
        * --------------------------------------------------------
        * DEBUG
        * --------------------------------------------------------
        *
        * This should now show strings, NOT { ... } objects.
        */

        console.log(
          '=========================================='
        );

        console.log(
          '📅 ENQUIRIES API DATE DEBUG'
        );

        if (enquiries.length > 0) {
          console.log({
            id: enquiries[0].id,

            createdAt:
              enquiries[0].createdAt,

            createdAtType:
              typeof enquiries[0].createdAt,

            statusUpdatedAt:
              enquiries[0].statusUpdatedAt,

            statusUpdatedAtType:
              typeof enquiries[0]
                .statusUpdatedAt,
          });
        }

        console.log(
          '=========================================='
        );

        return res.json(enquiries);

      } catch (error) {
        console.error(
          '❌ Failed to load enquiries:',
          error
        );

        return res.status(500).json({
          ok: false,
          message:
            'Failed to load enquiries.',
          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );


  app.post(
    '/api/enquiries',
    async (req, res) => {
      try {
        const items =
          Array.isArray(req.body)
            ? req.body
            : req.body
              ? [req.body]
              : [];

        for (const enquiry of items) {
          const id =
            enquiry.id ||
            `enq-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`;

          const orderNumber =
            enquiry.orderNumber ||
            id;

          const customerName =
            enquiry.customerName ||
            '';

          const customerPhone =
            enquiry.customerPhone ||
            '';

          const customerEmail =
            enquiry.customerEmail ||
            '';

          const notes =
            enquiry.notes ||
            '';

          const status =
            enquiry.status ||
            'New';

          const total =
            toNumber(
              enquiry.total,
              0
            );

          const source =
            enquiry.source ||
            'Web';

          const subtotal =
            toNumber(
              enquiry.subtotal,
              total
            );

          const discount =
            toNumber(
              enquiry.discount,
              0
            );

          const createdAt =
            enquiry.createdAt ||
            new Date().toISOString();
          
          const statusUpdatedAt =
            enquiry.statusUpdatedAt ||
            new Date().toISOString();

          await pool.query(
            `
              INSERT INTO enquiries (
                id,
                order_number,
                customer_name,
                customer_phone,
                customer_email,
                items,
                subtotal,
                discount,
                notes,
                status,
                total,
                source,
                created_at
                status_updated_at
              )
              VALUES (
                $1,$2,$3,$4,$5,$6,$7,
                $8,$9,$10,$11,$12,$13,$14
              )

              ON CONFLICT (id)
              DO UPDATE SET
                order_number =
                  EXCLUDED.order_number,

                customer_name =
                  EXCLUDED.customer_name,

                customer_phone =
                  EXCLUDED.customer_phone,

                customer_email =
                  EXCLUDED.customer_email,

                items =
                  EXCLUDED.items,

                subtotal =
                  EXCLUDED.subtotal,

                discount =
                  EXCLUDED.discount,

                notes =
                  EXCLUDED.notes,

                status =
                  EXCLUDED.status,

                total =
                  EXCLUDED.total,

                source =
                  EXCLUDED.source
            `,
            [
              id,
              orderNumber,
              customerName,
              customerPhone,
              customerEmail,
              JSON.stringify(
                enquiry.items || []
              ),
              subtotal,
              discount,
              notes,
              status,
              total,
              source,
              createdAt,
              status_updated_at
            ]
          );
        }

        return res.json({
          ok: true,
          count: items.length,
        });
      } catch (error) {
        console.error(
          'Failed to save enquiries:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to save enquiries.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  app.delete(
    '/api/enquiries/:id',
    async (req, res) => {
      try {
        const { id } = req.params;

        if (!id) {
          return res.status(400).json({
            ok: false,
            message: 'Enquiry ID is required.',
          });
        }

        const result = await pool.query(
          `
            DELETE FROM enquiries
            WHERE id = $1
            RETURNING id
          `,
          [id]
        );

        if (result.rowCount === 0) {
          return res.status(404).json({
            ok: false,
            message: 'Enquiry or invoice not found.',
          });
        }

        return res.json({
          ok: true,
          message: 'Enquiry deleted successfully.',
          deletedId: id,
        });
      } catch (error) {
        console.error(
          'Failed to delete enquiry:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to delete enquiry.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  app.get('/api/enquiries/:id', async (req, res) => {
    try {
      const { id } = req.params;

      console.log('📄 Fetching enquiry for invoice:', id);

      const result = await pool.query(
        `
          SELECT
            id,
            order_number,
            customer_name,
            customer_phone,
            customer_email,
            items,
            subtotal,
            discount,
            total,
            status,
            notes,
            created_at,
            status_updated_at,
            source
          FROM enquiries
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: 'Enquiry not found.',
        });
      }

      const enquiry = result.rows[0];

      enquiry.subtotal = toNumber(
        enquiry.subtotal,
        0
      );

      enquiry.discount = toNumber(
        enquiry.discount,
        0
      );

      enquiry.total = toNumber(
        enquiry.total,
        0
      );

      enquiry.items = normalizeJsonArray(
        enquiry.items
      );

      const normalizedEnquiry =
        normalizeKeys(enquiry);

      console.log(
        '✅ Invoice enquiry dates:',
        {
          id: normalizedEnquiry.id,
          createdAt:
            normalizedEnquiry.createdAt,
          statusUpdatedAt:
            normalizedEnquiry.statusUpdatedAt,
        }
      );

      return res.json({
        ok: true,
        enquiry: normalizedEnquiry,
      });
    } catch (error) {
      console.error(
        '❌ Failed to fetch enquiry for invoice:',
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          'Failed to fetch enquiry for invoice.',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  });

  /* =======================================================
    UPDATE ENQUIRY STATUS
  ======================================================= */

  app.patch('/api/enquiries/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      console.log('🔄 Updating enquiry status:', {
        id,
        status,
      });

      const validStatuses = [
        'New',
        'Contacted',
        'Confirmed',
        'Paid',
        'Preparing',
        'Delivered',
        'Cancelled',
      ];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid enquiry status.',
        });
      }

      const result = await pool.query(
        `
          UPDATE enquiries
          SET
            status = $1,
            status_updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: 'Enquiry not found.',
        });
      }

      const updatedEnquiry = normalizeKeys(result.rows[0]);

      updatedEnquiry.subtotal = toNumber(
        updatedEnquiry.subtotal,
        0
      );

      updatedEnquiry.discount = toNumber(
        updatedEnquiry.discount,
        0
      );

      updatedEnquiry.total = toNumber(
        updatedEnquiry.total,
        0
      );

      updatedEnquiry.items = normalizeJsonArray(
        updatedEnquiry.items
      );

      console.log('✅ Enquiry status updated:', {
        id: updatedEnquiry.id,
        status: updatedEnquiry.status,
        statusUpdatedAt: updatedEnquiry.statusUpdatedAt,
      });

      return res.json({
        ok: true,
        enquiry: updatedEnquiry,
      });
    } catch (error) {
      console.error(
        '❌ Failed to update enquiry status:',
        error
      );

      return res.status(500).json({
        ok: false,
        message: 'Failed to update enquiry status.',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  });


  /* =======================================================
     INVOICES
  ======================================================= */

  app.get('/api/invoices', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM invoices ORDER BY created_at DESC'
      );

      const invoices = result.rows.map((row) => {
        const normalized = normalizeKeys(row);

        return {
          id: safeString(normalized.id),

          invoiceNumber: safeString(
            normalized.invoiceNumber,
            'N/A'
          ),

          enquiryId:
            normalized.enquiryId !== undefined &&
            normalized.enquiryId !== null
              ? safeString(normalized.enquiryId)
              : null,

          customerName: safeString(
            normalized.customerName,
            'Walk-in Customer'
          ),

          customerPhone: safeString(
            normalized.customerPhone
          ),

          customerEmail: safeString(
            normalized.customerEmail
          ),

          customerAddress: safeString(
            normalized.customerAddress
          ),

          items: normalizeInvoiceItems(
            normalized.items
          ),

          subtotal: toNumber(
            normalized.subtotal,
            0
          ),

          discount: toNumber(
            normalized.discount,
            0
          ),

          shipping: toNumber(
            normalized.shipping,
            0
          ),

          total: toNumber(
            normalized.total,
            0
          ),

          status: safeString(
            normalized.status,
            'Draft'
          ),

          issueDate:
            normalized.issueDate !== undefined &&
            normalized.issueDate !== null
              ? safeString(normalized.issueDate)
              : null,

          dueDate:
            normalized.dueDate !== undefined &&
            normalized.dueDate !== null
              ? safeString(normalized.dueDate)
              : null,

          paymentMethod:
            normalized.paymentMethod !== undefined &&
            normalized.paymentMethod !== null
              ? safeString(
                  normalized.paymentMethod
                )
              : null,

          createdAt:
            normalized.createdAt !== undefined &&
            normalized.createdAt !== null
              ? safeString(normalized.createdAt)
              : null,
        };
      });

      console.log(
        `✅ Loaded ${invoices.length} invoices`
      );

      return res.json(invoices);

    } catch (error) {
      console.error(
        '❌ Failed to load invoices:',
        error
      );

      return res.status(500).json({
        ok: false,
        message: 'Failed to load invoices.',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  });

  app.post(
    '/api/invoices',
    async (req, res) => {
      try {
        const items =
          Array.isArray(req.body)
            ? req.body
            : req.body
              ? [req.body]
              : [];

        for (const invoice of items) {
          const id =
            invoice.id ||
            `inv-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`;

          const invoiceNumber =
            invoice.invoiceNumber ||
            `INV-${Date.now()}`;

          const values = [
            id,

            invoiceNumber,

            invoice.enquiryId ||
              null,

            invoice.customerName ||
              '',

            invoice.customerPhone ||
              '',

            invoice.customerEmail ||
              '',

            invoice.customerAddress ||
              '',

            JSON.stringify(
              invoice.items || []
            ),

            toNumber(
              invoice.subtotal,
              0
            ),

            toNumber(
              invoice.discount,
              0
            ),

            toNumber(
              invoice.shipping,
              0
            ),

            toNumber(
              invoice.total,
              0
            ),

            invoice.status ||
              'Draft',

            invoice.issueDate ||
              new Date().toISOString(),

            invoice.dueDate ||
              new Date().toISOString(),

            invoice.paymentMethod ||
              null,

            invoice.createdAt ||
              new Date().toISOString(),
          ];

          await pool.query(
            `
              INSERT INTO invoices (
                id,
                invoice_number,
                enquiry_id,
                customer_name,
                customer_phone,
                customer_email,
                customer_address,
                items,
                subtotal,
                discount,
                shipping,
                total,
                status,
                issue_date,
                due_date,
                payment_method,
                created_at
              )
              VALUES (
                $1,$2,$3,$4,$5,$6,$7,
                $8,$9,$10,$11,$12,$13,
                $14,$15,$16,$17
              )

              ON CONFLICT (id)
              DO UPDATE SET
                invoice_number =
                  EXCLUDED.invoice_number,

                enquiry_id =
                  EXCLUDED.enquiry_id,

                customer_name =
                  EXCLUDED.customer_name,

                customer_phone =
                  EXCLUDED.customer_phone,

                customer_email =
                  EXCLUDED.customer_email,

                customer_address =
                  EXCLUDED.customer_address,

                items =
                  EXCLUDED.items,

                subtotal =
                  EXCLUDED.subtotal,

                discount =
                  EXCLUDED.discount,

                shipping =
                  EXCLUDED.shipping,

                total =
                  EXCLUDED.total,

                status =
                  EXCLUDED.status,

                issue_date =
                  EXCLUDED.issue_date,

                due_date =
                  EXCLUDED.due_date,

                payment_method =
                  EXCLUDED.payment_method
            `,
            values
          );
        }

        return res.json({
          ok: true,
          count: items.length,
        });
      } catch (error) {
        console.error(
          'Failed to save invoices:',
          error
        );

        return res.status(500).json({
          ok: false,

          message:
            'Failed to save invoices.',

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  );

  /* =======================================================
     CORS ERROR HANDLER
  ======================================================= */

  app.use(
    (error, req, res, next) => {
      if (
        error &&
        error.message ===
          'Not allowed by CORS'
      ) {
        return res.status(403).json({
          ok: false,

          message:
            'CORS origin is not allowed.',

          origin:
            req.headers.origin ||
            null,
        });
      }

      return next(error);
    }
  );

  /* =======================================================
     GENERAL ERROR HANDLER
  ======================================================= */

  app.use(
    (error, req, res, next) => {
      console.error(
        'Unhandled server error:',
        error
      );

      return res.status(500).json({
        ok: false,

        message:
          'Internal server error.',

        details:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  );

  return {
    app,
    pool,
  };
}

/* =========================================================
   DIRECT EXECUTION
========================================================= */

const isDirectExecution =
  process.argv[1] &&
  import.meta.url ===
    pathToFileURL(
      process.argv[1]
    ).href;

if (isDirectExecution) {
  const { app, pool } =
    createApp();

  const port = Number(
    process.env.PORT || 4004
  );

  /*
   * 0.0.0.0 is important when accessing
   * the frontend/API from another device
   * on the same Wi-Fi/hotspot.
   */

  const host =
    process.env.HOST ||
    '0.0.0.0';

  app.listen(
    port,
    host,
    () => {
      console.log('');
      console.log(
        '========================================'
      );
      console.log(
        '🌸 Meera Fashion API'
      );
      console.log(
        '========================================'
      );
      console.log(
        `🚀 Server: http://localhost:${port}`
      );
      console.log(
        `📡 Network: http://0.0.0.0:${port}`
      );
      console.log(
        `❤️ Health: http://localhost:${port}/api/health`
      );
      console.log(
        `🛍️ Products: http://localhost:${port}/api/products`
      );
      console.log(
        `📊 Analytics: http://localhost:${port}/api/analytics`
      );
      console.log(
        '========================================'
      );
      console.log('');
    }
  );

  /*
   * Graceful shutdown
   */

  const shutdown = async () => {
    console.log(
      '\nShutting down server...'
    );

    try {
      await pool.end();

      console.log(
        'Database pool closed.'
      );

      process.exit(0);
    } catch (error) {
      console.error(
        'Shutdown error:',
        error
      );

      process.exit(1);
    }
  };

  process.on(
    'SIGINT',
    shutdown
  );

  process.on(
    'SIGTERM',
    shutdown
  );
}