import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';

dotenv.config();

const { Pool } = pkg;

const camelCase = (value) => value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const normalizeKeys = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeKeys);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [camelCase(key), normalizeKeys(item)])
    );
  }

  return value;
};

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const toISOString = (value) => {
  if (typeof value === 'string' && value.length > 0) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      // Fall through
    }
  }
  return new Date().toISOString();
};

const normalizeJsonArray = (value) => (Array.isArray(value) ? value : []);

const normalizeInvoiceItems = (value) => normalizeJsonArray(value).map((item) => ({
  ...item,
  description: typeof item?.description === 'string' ? item.description : 'Boutique Item',
  quantity: toNumber(item?.quantity, 1),
  unitPrice: toNumber(item?.unitPrice, 0),
  total: toNumber(item?.total, 0),
}));

const normalizeProductRow = (row) => {
  const normalized = normalizeKeys(row);
  normalized.price = toNumber(normalized.price, 0);
  normalized.originalPrice = normalized.originalPrice === null || normalized.originalPrice === undefined ? undefined : toNumber(normalized.originalPrice, 0);
  normalized.discountPercentage = normalized.discountPercentage === null || normalized.discountPercentage === undefined ? undefined : Number(normalized.discountPercentage);
  normalized.stockQuantity = normalized.stockQuantity === null || normalized.stockQuantity === undefined ? 0 : Number(normalized.stockQuantity);
  normalized.isPreOrder = Boolean(normalized.isPreOrder);
  normalized.isFeatured = Boolean(normalized.isFeatured);
  normalized.isNewArrival = Boolean(normalized.isNewArrival);
  normalized.isOffer = Boolean(normalized.isOffer);
  normalized.isDancePerformance = Boolean(normalized.isDancePerformance);
  normalized.createdAt = toISOString(normalized.createdAt);
  normalized.updatedAt = toISOString(normalized.updatedAt);
  return normalized;
};

const normalizeSettingRow = (row) => {
  const normalized = normalizeKeys(row);
  normalized.showAnnouncement = Boolean(normalized.showAnnouncement);
  normalized.enableRentalMode = Boolean(normalized.enableRentalMode);
  return normalized;
};

const normalizeArrayResponse = (rows, customNormalizers = []) =>
  rows.map((row) => {
    let normalized = normalizeKeys(row);
    for (const transformer of customNormalizers) {
      normalized = transformer(normalized);
    }
    return normalized;
  });

const createPool = () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

  if (connectionString) {
    return new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  return new Pool({
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'meera_fashion',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
};

export function createApp() {
  const app = express();
  const pool = createPool();

  const envOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VITE_API_BASE_URL,
    process.env.ALLOWED_ORIGINS,
  ]
    .flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
    .map((value) => value.trim())
    .filter(Boolean);

  const allowedOrigins = new Set(envOrigins);

  const isLocalDevelopmentOrigin = (origin) => {
    if (!origin) return true;

    return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
  };

  app.use((req, res, next) => {
    console.log('CORS DEBUG:', {
      method: req.method,
      origin: req.headers.origin,
      requestedHeaders: req.headers['access-control-request-headers'],
      path: req.path,
    });

    next();
  });

  app.use(cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        isLocalDevelopmentOrigin(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
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

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Device-Id',
    ],

    optionsSuccessStatus: 204,
  }));

  // Explicitly handle browser preflight requests
  app.options('*', cors());

  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', async (req, res) => {
    try {
      const result = await pool.query('SELECT 1 AS ok');
      res.json({
        status: 'ok',
        database: 'postgres',
        postgres: result.rows[0]?.ok === 1 ? 'connected' : 'unknown',
      });
    } catch (error) {
      res.json({
        status: 'ok',
        database: 'postgres',
        postgres: 'not_connected',
        message: 'PostgreSQL/Neon is not connected yet. The backend is ready and will connect when the database is available.',
      });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY "updatedAt" DESC, id DESC');
      res.json(result.rows.map(normalizeProductRow));
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Failed to load products.', details: String(error.message || error) });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body ? [req.body] : [];

      for (const product of items) {
        const values = [
          product.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          product.name || '',
          product.slug || '',
          product.category || 'sarees',
          product.subcategory || '',
          toNumber(product.price, 0),
          product.originalPrice === undefined || product.originalPrice === null ? null : toNumber(product.originalPrice, 0),
          product.discountPercentage === undefined || product.discountPercentage === null ? null : Number(product.discountPercentage),
          product.description || '',
          product.shortDescription || '',
          product.material || '',
          product.color || '',
          product.stockStatus || 'In Stock',
          product.stockQuantity === undefined || product.stockQuantity === null ? 0 : Number(product.stockQuantity),
          Boolean(product.isPreOrder),
          Boolean(product.isFeatured),
          Boolean(product.isNewArrival),
          Boolean(product.isOffer),
          Boolean(product.isDancePerformance),
          JSON.stringify(product.images ?? {}),
          product.createdAt || new Date().toISOString(),
          product.updatedAt || new Date().toISOString(),
        ];

        await pool.query(
          `INSERT INTO products (
            id, name, slug, category, subcategory, price, "originalPrice", "discountPercentage",
            description, "shortDescription", material, color, "stockStatus", "stockQuantity",
            "isPreOrder", "isFeatured", "isNewArrival", "isOffer", "isDancePerformance", images,
            "createdAt", "updatedAt"
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            price = EXCLUDED.price,
            "originalPrice" = EXCLUDED."originalPrice",
            "discountPercentage" = EXCLUDED."discountPercentage",
            description = EXCLUDED.description,
            "shortDescription" = EXCLUDED."shortDescription",
            material = EXCLUDED.material,
            color = EXCLUDED.color,
            "stockStatus" = EXCLUDED."stockStatus",
            "stockQuantity" = EXCLUDED."stockQuantity",
            "isPreOrder" = EXCLUDED."isPreOrder",
            "isFeatured" = EXCLUDED."isFeatured",
            "isNewArrival" = EXCLUDED."isNewArrival",
            "isOffer" = EXCLUDED."isOffer",
            "isDancePerformance" = EXCLUDED."isDancePerformance",
            images = EXCLUDED.images,
            "updatedAt" = EXCLUDED."updatedAt"`,
          values
        );
      }

      res.json({ ok: true, count: items.length });
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Failed to save products.', details: String(error.message || error) });
    }
  });

  app.get('/api/selection', async (req, res) => {
    try {
      const deviceId = req.get('x-device-id') || 'default';
      const result = await pool.query('SELECT * FROM selection_items WHERE session_id = $1 ORDER BY added_at DESC', [deviceId]);
      res.json(
        result.rows.map((row) => {
          const normalized = normalizeKeys(row);
          normalized.product = normalized.product && typeof normalized.product === 'object' ? normalized.product : {};
          if (normalized.product.createdAt) {
            normalized.product.createdAt = toISOString(normalized.product.createdAt);
          }
          if (normalized.product.updatedAt) {
            normalized.product.updatedAt = toISOString(normalized.product.updatedAt);
          }
          normalized.quantity = Number(normalized.quantity || 1);
          normalized.unitPrice = toNumber(normalized.unitPrice, 0);
          normalized.addedAt = toISOString(normalized.addedAt);
          return normalized;
        })
      );
    } catch (error) {
      res.status(200).json([]);
    }
  });

  app.post('/api/selection', async (req, res) => {
    try {
      const deviceId = req.get('x-device-id') || 'default';
      const items = Array.isArray(req.body) ? req.body : [];
      await pool.query('DELETE FROM selection_items WHERE session_id = $1', [deviceId]);

      for (const item of items) {
        let productToStore = item.product || {};
        if (productToStore && typeof productToStore === 'object') {
          productToStore = {
            ...productToStore,
            createdAt: toISOString(productToStore.createdAt),
            updatedAt: toISOString(productToStore.updatedAt),
          };
        }
        const values = [
          item.id || `sel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          deviceId,
          item.productId || item.product?.id || '',
          JSON.stringify(productToStore),
          item.selectedSize || null,
          Number(item.quantity || 1),
          toNumber(item.unitPrice, 0),
          toISOString(item.addedAt),
        ];

        await pool.query(
          `INSERT INTO selection_items (id, session_id, product_id, product, selected_size, quantity, unit_price, added_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          values
        );
      }

      res.json({ ok: true, count: items.length });
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Failed to save selection.', details: String(error.message || error) });
    }
  });

  app.get('/api/wishlist', async (req, res) => {
    try {
      const deviceId = req.get('x-device-id') || 'default';
      const result = await pool.query('SELECT * FROM wishlist_items WHERE session_id = $1 ORDER BY created_at DESC', [deviceId]);
      res.json(result.rows.map((row) => normalizeKeys(row).productId));
    } catch (error) {
      res.status(200).json([]);
    }
  });

  app.post('/api/wishlist', async (req, res) => {
    try {
      const deviceId = req.get('x-device-id') || 'default';
      const ids = Array.isArray(req.body) ? req.body : [];
      await pool.query('DELETE FROM wishlist_items WHERE session_id = $1', [deviceId]);

      for (const productId of ids) {
        if (!productId) continue;
        await pool.query(
          `INSERT INTO wishlist_items (id, session_id, product_id, created_at) VALUES ($1, $2, $3, $4)`,
          [`wish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, deviceId, productId, new Date().toISOString()]
        );
      }

      res.json({ ok: true, count: ids.length });
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Failed to save wishlist.' });
    }
  });

  app.get('/api/settings', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
      res.json(result.rows[0] ? normalizeSettingRow(result.rows[0]) : null);
    } catch (error) {
      res.status(200).json(null);
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const settings = req.body || {};
      const row = await pool.query('SELECT id FROM settings ORDER BY id ASC LIMIT 1');
      const values = [
        settings.brandName || "Meera's Fashion",
        settings.tagline || 'Traditional Clothing And Jewelleries',
        settings.phone || '00447463151533',
        settings.formattedPhone || '+44 7463 151533',
        settings.whatsappNumber || '447463151533',
        settings.email || 'meerasfashion26@gmail.com',
        settings.address || 'London, United Kingdom',
        settings.customLogoUrl || '',
        settings.instagramHandle || '@meere_f21',
        settings.instagramUrl || 'https://www.instagram.com/meere_f21',
        settings.tiktokHandle || '@mf202126',
        settings.tiktokUrl || 'https://www.tiktok.com/@mf202126',
        settings.facebookUrl || 'https://facebook.com/meerasfashion',
        settings.announcementText || '🌸 Welcome to Meera Fashion Boutique — Free UK Royal Mail Delivery on Orders over £100 | WhatsApp Concierge Available',
        settings.showAnnouncement !== undefined ? Boolean(settings.showAnnouncement) : true,
        settings.enableRentalMode !== undefined ? Boolean(settings.enableRentalMode) : false,
        settings.currencySymbol || '£',
        settings.currencyCode || 'GBP',
      ];

      if (row.rows.length === 0) {
        await pool.query(
          `INSERT INTO settings (
            brand_name, tagline, phone, formatted_phone, whatsapp_number, email, address, custom_logo_url,
            instagram_handle, instagram_url, tiktok_handle, tiktok_url, facebook_url,
            announcement_text, show_announcement, enable_rental_mode, currency_symbol, currency_code,
            created_at, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),NOW())`,
          values
        );
      } else {
        await pool.query(
          `UPDATE settings SET
            brand_name = $1, tagline = $2, phone = $3, formatted_phone = $4, whatsapp_number = $5,
            email = $6, address = $7, custom_logo_url = $8, instagram_handle = $9, instagram_url = $10,
            tiktok_handle = $11, tiktok_url = $12, facebook_url = $13, announcement_text = $14,
            show_announcement = $15, enable_rental_mode = $16, currency_symbol = $17, currency_code = $18,
            updated_at = NOW()
           WHERE id = $19`,
          [...values, row.rows[0].id]
        );
      }

      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Failed to save settings.', details: String(error.message || error) });
    }
  });

  app.get('/api/enquiries', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
      res.json(
        normalizeArrayResponse(result.rows, [
          (item) => {
            item.subtotal = toNumber(item.subtotal, 0);
            item.discount = toNumber(item.discount, 0);
            item.total = toNumber(item.total, 0);
            item.createdAt = toISOString(item.createdAt);
            return item;
          },
        ])
      );
    } catch (error) {
      res.status(200).json([]);
    }
  });

  app.post('/api/enquiries', async (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body ? [req.body] : [];

      for (const enquiry of items) {
        const values = [
          enquiry.id || `enq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          enquiry.customerName || '',
          enquiry.customerPhone || '',
          enquiry.customerEmail || '',
          enquiry.notes || '',
          enquiry.status || 'New',
          toNumber(enquiry.total, 0),
          enquiry.source || 'Web',
          toISOString(enquiry.createdAt),
        ];

        await pool.query(
          `INSERT INTO enquiries (
            id, order_number, customer_name, customer_phone, customer_email, items, subtotal, discount,
            notes, status, total, source, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO UPDATE SET
             order_number = EXCLUDED.order_number,
             customer_name = EXCLUDED.customer_name,
             customer_phone = EXCLUDED.customer_phone,
             customer_email = EXCLUDED.customer_email,
             items = EXCLUDED.items,
             subtotal = EXCLUDED.subtotal,
             discount = EXCLUDED.discount,
             notes = EXCLUDED.notes,
             status = EXCLUDED.status,
             total = EXCLUDED.total,
             source = EXCLUDED.source`,
          [
            values[0],
            enquiry.orderNumber || values[0],
            values[1],
            values[2],
            values[3],
            JSON.stringify(enquiry.items || []),
            toNumber(enquiry.subtotal, enquiry.total),
            toNumber(enquiry.discount, 0),
            values[4],
            values[5],
            values[6],
            values[7],
            values[8],
          ]
        );
      }

      res.json({ ok: true, count: items.length });
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Failed to save enquiries.', details: String(error.message || error) });
    }
  });

  app.get('/api/invoices', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
      res.json(
        normalizeArrayResponse(result.rows, [
          (item) => {
            item.items = normalizeInvoiceItems(item.items);
            item.subtotal = toNumber(item.subtotal, 0);
            item.discount = toNumber(item.discount, 0);
            item.shipping = toNumber(item.shipping, 0);
            item.total = toNumber(item.total, 0);
            item.issueDate = toISOString(item.issueDate);
            item.dueDate = toISOString(item.dueDate);
            item.createdAt = toISOString(item.createdAt);
            return item;
          },
        ])
      );
    } catch (error) {
      res.status(200).json([]);
    }
  });

  app.post('/api/invoices', async (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body ? [req.body] : [];

      for (const invoice of items) {
        const values = [
          invoice.id || `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          invoice.invoiceNumber || `INV-${Date.now()}`,
          invoice.enquiryId || null,
          invoice.customerName || '',
          invoice.customerPhone || '',
          invoice.customerEmail || '',
          invoice.customerAddress || '',
          JSON.stringify(invoice.items || []),
          toNumber(invoice.subtotal, 0),
          toNumber(invoice.discount, 0),
          toNumber(invoice.shipping, 0),
          toNumber(invoice.total, 0),
          invoice.status || 'Draft',
          toISOString(invoice.issueDate),
          toISOString(invoice.dueDate),
          invoice.paymentMethod || null,
          toISOString(invoice.createdAt),
        ];

        await pool.query(
          `INSERT INTO invoices (
            id, invoice_number, enquiry_id, customer_name, customer_phone, customer_email,
            customer_address, items, subtotal, discount, shipping, total, status, issue_date,
            due_date, payment_method, created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
           ON CONFLICT (id) DO UPDATE SET
             invoice_number = EXCLUDED.invoice_number,
             enquiry_id = EXCLUDED.enquiry_id,
             customer_name = EXCLUDED.customer_name,
             customer_phone = EXCLUDED.customer_phone,
             customer_email = EXCLUDED.customer_email,
             customer_address = EXCLUDED.customer_address,
             items = EXCLUDED.items,
             subtotal = EXCLUDED.subtotal,
             discount = EXCLUDED.discount,
             shipping = EXCLUDED.shipping,
             total = EXCLUDED.total,
             status = EXCLUDED.status,
             issue_date = EXCLUDED.issue_date,
             due_date = EXCLUDED.due_date,
             payment_method = EXCLUDED.payment_method`,
          values
        );
      }

      res.json({ ok: true, count: items.length });
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Failed to save invoices.', details: String(error.message || error) });
    }
  });

  return { app, pool };
}

const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  const app = createApp().app;
  const port = Number(process.env.PORT || 4000);

  app.listen(port, () => {
    console.log(`Meera Fashion API running on http://localhost:${port}`);
  });
}
