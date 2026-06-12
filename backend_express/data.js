const sqlite3 = require('sqlite3').verbose();

const dummyProducts = [
  {
    id: 'prod_001',
    title: 'Silk Hanbok Dress',
    price: 89.99,
    description: 'Traditional Korean hanbok-inspired dress in premium silk',
    category: 'dresses',
    sizes: '["XS", "S", "M", "L", "XL"]',
    colors: '["red", "navy", "black"]',
    image_url: '/images/bach-tran.jpg'
  },
  {
    id: 'prod_002',
    title: 'Linen Wide Leg Pants',
    price: 64.99,
    description: 'Comfortable linen pants with wide leg cut',
    category: 'pants',
    sizes: '["XS", "S", "M", "L", "XL"]',
    colors: '["cream", "beige", "charcoal"]',
    image_url: '/images/frank-ching.jpg'
  },
  {
    id: 'prod_003',
    title: 'Oversized Linen Shirt',
    price: 59.99,
    description: 'Loose-fitting linen shirt perfect for summer',
    category: 'tops',
    sizes: '["XS", "S", "M", "L", "XL", "XXL"]',
    colors: '["white", "sage", "dusty pink"]',
    image_url: '/images/muhammad-rahim-ali.jpg'
  },
  {
    id: 'prod_004',
    title: 'Maxi Skirt with Slit',
    price: 74.99,
    description: 'Elegant maxi skirt with high slit detail',
    category: 'skirts',
    sizes: '["XS", "S", "M", "L", "XL"]',
    colors: '["black", "burgundy", "olive"]',
    image_url: '/images/ooneiroslyl.jpg'
  }
];

function seedDatabase() {
  const db = new sqlite3.Database('./keurope.db', (err) => {
    if (err) {
      console.error('Database connection error:', err);
      return;
    }

    db.serialize(() => {
      // Create tables first
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

      // Clear existing products
      db.run('DELETE FROM products', (err) => {
        if (err) console.error('Error clearing products:', err);

        // Insert dummy products
        dummyProducts.forEach(product => {
          db.run(
            'INSERT INTO products (id, title, price, description, category, sizes, colors, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [product.id, product.title, product.price, product.description, product.category, product.sizes, product.colors, product.image_url],
            (err) => {
              if (err) console.error('Error inserting product:', err);
            }
          );
        });

        console.log('Database seeded with dummy products');
        db.close();
      });
    });
  });
}

seedDatabase();
