import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import db from './database/connection.js';
import productsRouter from './routes/products.js';
import { AppError } from './utils/errors.js';
import type { ApiResponse } from './types/api.js';


const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        sizes TEXT,
        colors TEXT,
        image_url TEXT,
        stock_quantity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart items table
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        price_at_time REAL NOT NULL,
        FOREIGN KEY (session_id) REFERENCES cart_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        customer_phone TEXT,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        price_at_purchase REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Newsletter subscribers table
    db.run(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        unsubscribed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database schema initialized');
  });
}

initializeDatabase();

// Routes
app.use('/api/products', productsRouter);

app.post('/api/orders', (req: Request, res: Response<ApiResponse<any>>) => {
  const { customer_name, customer_email, customer_address, items, total_price } = req.body;

  if (!customer_name || !customer_email || !customer_address || !items || !total_price) {
    res.status(400).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
    });
    return;
  }

  const orderId = `order_${Date.now()}`;

  db.run(
    'INSERT INTO orders (id, customer_name, customer_email, customer_address, total_price) VALUES (?, ?, ?, ?, ?)',
    [orderId, customer_name, customer_email, customer_address, total_price],
    function (err: Error | null) {
      if (err) {
        res.status(500).json({ status: 'error', error: { code: 'DB_ERROR', message: err.message } });
        return;
      }

      let completed = 0;
      items.forEach((item: any) => {
        const itemId = `item_${Date.now()}_${Math.random()}`;
        db.run(
          'INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)',
          [itemId, orderId, item.product_id, item.quantity, item.price],
          (_err: Error | null) => {
            completed++;
            if (completed === items.length) {
              res.json({
                status: 'success',
                data: { order_id: orderId, total_price, created_at: new Date().toISOString() },
              });
            }
          }
        );
      });
    }
  );
});

app.get('/api/orders/:id', (req: Request, res: Response<ApiResponse<any>>) => {
  const { id } = req.params;

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err: Error | null, order: any) => {
    if (err) {
      res.status(500).json({ status: 'error', error: { code: 'DB_ERROR', message: err.message } });
      return;
    }
    if (!order) {
      res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Order not found' } });
      return;
    }

    db.all('SELECT * FROM order_items WHERE order_id = ?', [id], (err: Error | null, items: any[]) => {
      if (err) {
        res.status(500).json({ status: 'error', error: { code: 'DB_ERROR', message: err.message } });
        return;
      }

      res.json({ status: 'success', data: { ...order, items } });
    });
  });
});

// Error handler middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  } else {
    res.status(500).json({
      status: 'error',
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
