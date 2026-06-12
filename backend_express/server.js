const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./keurope.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        category TEXT,
        sizes TEXT,
        colors TEXT,
        image_url TEXT
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        total_price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OrderItems table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price_at_purchase REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    console.log('Database schema initialized');
  });
}

initializeDatabase();

// Routes
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_address, items, total_price } = req.body;

  if (!customer_name || !customer_email || !customer_address || !items || !total_price) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const orderId = `order_${Date.now()}`;

  db.run(
    'INSERT INTO orders (id, customer_name, customer_email, customer_address, total_price) VALUES (?, ?, ?, ?, ?)',
    [orderId, customer_name, customer_email, customer_address, total_price],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Insert order items
      let completed = 0;
      items.forEach(item => {
        const itemId = `item_${Date.now()}_${Math.random()}`;
        db.run(
          'INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)',
          [itemId, orderId, item.product_id, item.quantity, item.price],
          (err) => {
            completed++;
            if (completed === items.length) {
              res.json({ order_id: orderId, total_price, created_at: new Date().toISOString() });
            }
          }
        );
      });
    }
  );
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    db.all('SELECT * FROM order_items WHERE order_id = ?', [id], (err, items) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ ...order, items });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
