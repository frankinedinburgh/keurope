package com.keurope.config;

import com.keurope.product.Product;
import com.keurope.product.ProductRepository;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/**
 * Creates tables and seeds products before the web server starts accepting requests.
 */
@Component
public class DatabaseInitializer implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final JdbcTemplate jdbc;
    private final ProductRepository products;
    private final ObjectMapper objectMapper;

    public DatabaseInitializer(JdbcTemplate jdbc, ProductRepository products, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.products = products;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterPropertiesSet() throws IOException {
        createTables();
        seedData();
        log.info("✅ Database connected (WAL mode, 5s timeout)");
    }

    private void createTables() {
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    price REAL NOT NULL,
                    category TEXT,
                    image_url TEXT,
                    description TEXT
                )""");

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )""");

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS carts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    size TEXT NOT NULL DEFAULT 'M',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (product_id) REFERENCES products(id),
                    UNIQUE(user_id, product_id, size)
                )""");

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )""");

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    total_price REAL NOT NULL,
                    status TEXT DEFAULT 'pending',
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    address TEXT NOT NULL,
                    city TEXT NOT NULL,
                    postal_code TEXT NOT NULL,
                    country TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )""");

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS order_items (
                    id TEXT PRIMARY KEY,
                    order_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    price REAL NOT NULL,
                    FOREIGN KEY (order_id) REFERENCES orders(id),
                    FOREIGN KEY (product_id) REFERENCES products(id)
                )""");
    }

    private void seedData() throws IOException {
        if (products.count() > 0) {
            // If the first product already has a local image path, don't reseed
            String imageUrl = products.firstImageUrl();
            if (imageUrl != null && imageUrl.startsWith("/")) {
                return;
            }
            // Images are still external (Unsplash), clear and reseed
            products.deleteAll();
        }

        try (InputStream in = new ClassPathResource("seed/products.json").getInputStream()) {
            List<Product> seed = List.of(objectMapper.readValue(in, Product[].class));
            seed.forEach(products::insert);
            log.info("Seeded {} products", seed.size());
        }
    }
}
