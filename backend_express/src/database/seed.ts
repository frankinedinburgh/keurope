import db from './connection.js';
import { runMigrations } from './migrations.js';

const dummyProducts = [
  {
    id: 'prod_001',
    title: 'Silk Hanbok Dress',
    price: 89.99,
    description: 'Traditional Korean hanbok-inspired dress in premium silk',
    category: 'dresses',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['red', 'navy', 'black']),
    image_url: '/images/bach-tran.jpg',
    stock_quantity: 15,
  },
  {
    id: 'prod_002',
    title: 'Linen Wide Leg Pants',
    price: 64.99,
    description: 'Comfortable linen pants with wide leg cut',
    category: 'trousers',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['cream', 'beige', 'charcoal']),
    image_url: '/images/frank-ching.jpg',
    stock_quantity: 20,
  },
  {
    id: 'prod_003',
    title: 'Oversized Linen Shirt',
    price: 59.99,
    description: 'Loose-fitting linen shirt perfect for summer',
    category: 'tops',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify(['white', 'sage', 'dusty pink']),
    image_url: '/images/muhammad-rahim-ali.jpg',
    stock_quantity: 25,
  },
  {
    id: 'prod_004',
    title: 'Maxi Skirt with Slit',
    price: 74.99,
    description: 'Elegant maxi skirt with high slit detail',
    category: 'dresses',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['black', 'burgundy', 'olive']),
    image_url: '/images/ooneiroslyl.jpg',
    stock_quantity: 12,
  },
  {
    id: 'prod_005',
    title: 'Linen Wrap Blouse',
    price: 72.0,
    description: 'Minimalist wrap blouse in natural linen',
    category: 'tops',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['white', 'natural', 'charcoal']),
    image_url: '/images/linen-blouse.jpg',
    stock_quantity: 18,
  },
  {
    id: 'prod_006',
    title: 'Minimal Midi Dress',
    price: 115.0,
    description: 'Clean lines, sophisticated cut',
    category: 'dresses',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['black', 'white', 'navy']),
    image_url: '/images/midi-dress.jpg',
    stock_quantity: 10,
  },
];

async function seedDatabase() {
  try {
    // Run migrations first
    console.log('Running migrations...');
    await runMigrations();

    // Clear existing products
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM products', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Cleared existing products');

    // Insert dummy products
    const insertPromises = dummyProducts.map(
      (product) =>
        new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO products (
              id, title, price, description, category, sizes, colors,
              image_url, stock_quantity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product.id,
              product.title,
              product.price,
              product.description,
              product.category,
              product.sizes,
              product.colors,
              product.image_url,
              product.stock_quantity,
            ],
            (err) => {
              if (err) {
                console.error('Error inserting product:', err);
                reject(err);
              } else {
                resolve();
              }
            }
          );
        })
    );

    await Promise.all(insertPromises);

    console.log(`✓ Seeded ${dummyProducts.length} products`);
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        process.exit(1);
      } else {
        console.log('Database seeded successfully!');
        process.exit(0);
      }
    });
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
