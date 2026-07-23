package main

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDatabase() error {
	var err error
	// Open database with concurrency options
	db, err = sql.Open("sqlite", "./keurope.db?cache=shared&mode=rwc&_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool for concurrency
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection
	err = db.Ping()
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Enable WAL mode for better concurrency (if not already set in connection string)
	_, err = db.Exec("PRAGMA journal_mode=WAL;")
	if err != nil {
		return fmt.Errorf("failed to enable WAL mode: %w", err)
	}

	// Set busy timeout to 5 seconds
	_, err = db.Exec("PRAGMA busy_timeout=5000;")
	if err != nil {
		return fmt.Errorf("failed to set busy timeout: %w", err)
	}

	// Create tables if they don't exist
	err = createTables()
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	// Seed initial data if needed
	err = seedData()
	if err != nil {
		return fmt.Errorf("failed to seed data: %w", err)
	}

	fmt.Println("✅ Database connected (WAL mode, 5s timeout, connection pool: 25 max)")
	return nil
}

func getProductsFromDB(category string) ([]Product, error) {
	var query string
	var args []interface{}

	if category != "" {
		query = "SELECT id, title, price, category, image_url FROM products WHERE category = ? ORDER BY id"
		args = append(args, category)
	} else {
		query = "SELECT id, title, price, category, image_url FROM products ORDER BY id"
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(&p.ID, &p.Title, &p.Price, &p.Category, &p.ImageURL)
		if err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}
		products = append(products, p)
	}

	return products, nil
}

func getProductByIDFromDB(id string) (*Product, error) {
	query := "SELECT id, title, price, category, image_url FROM products WHERE id = ?"
	var p Product

	err := db.QueryRow(query, id).Scan(&p.ID, &p.Title, &p.Price, &p.Category, &p.ImageURL)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}

	return &p, nil
}

func getCategoriesFromDB() ([]string, error) {
	query := "SELECT DISTINCT category FROM products ORDER BY category"
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var category string
		err := rows.Scan(&category)
		if err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}
		categories = append(categories, category)
	}

	return categories, nil
}

func createProductInDB(title string, price float64, category string, description string, imageURL string) (*Product, error) {
	// Generate a new ID (simple numeric approach - in production, use UUID)
	var maxID int
	err := db.QueryRow("SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) FROM products WHERE id REGEXP '^[0-9]+$'").Scan(&maxID)
	if err != nil {
		// If query fails, start from a high number to avoid conflicts
		maxID = 1000
	}
	newID := fmt.Sprintf("%d", maxID+1)

	query := "INSERT INTO products (id, title, price, category, image_url, description) VALUES (?, ?, ?, ?, ?, ?)"
	_, err = db.Exec(query, newID, title, price, category, imageURL, description)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	return &Product{
		ID:          newID,
		Title:       title,
		Price:       price,
		Category:    category,
		ImageURL:    imageURL,
		Description: description,
	}, nil
}

func updateProductInDB(id string, title string, price float64, category string, description string, imageURL string) (*Product, error) {
	query := "UPDATE products SET title = ?, price = ?, category = ?, description = ?, image_url = ? WHERE id = ?"
	result, err := db.Exec(query, title, price, category, description, imageURL, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("product not found")
	}

	return &Product{
		ID:          id,
		Title:       title,
		Price:       price,
		Category:    category,
		ImageURL:    imageURL,
		Description: description,
	}, nil
}

func deleteProductFromDB(id string) error {
	query := "DELETE FROM products WHERE id = ?"
	result, err := db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}

func createTables() error {
	productsQuery := `
	CREATE TABLE IF NOT EXISTS products (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		price REAL NOT NULL,
		category TEXT,
		image_url TEXT,
		description TEXT
	)
	`
	_, err := db.Exec(productsQuery)
	if err != nil {
		return fmt.Errorf("failed to create products table: %w", err)
	}

	usersQuery := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
	`
	_, err = db.Exec(usersQuery)
	if err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	cartQuery := `
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
	)
	`
	_, err = db.Exec(cartQuery)
	if err != nil {
		return fmt.Errorf("failed to create carts table: %w", err)
	}

	passwordResetQuery := `
	CREATE TABLE IF NOT EXISTS password_reset_tokens (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		token TEXT UNIQUE NOT NULL,
		expires_at DATETIME NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id)
	)
	`
	_, err = db.Exec(passwordResetQuery)
	if err != nil {
		return fmt.Errorf("failed to create password_reset_tokens table: %w", err)
	}

	ordersQuery := `
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
	)
	`
	_, err = db.Exec(ordersQuery)
	if err != nil {
		return fmt.Errorf("failed to create orders table: %w", err)
	}

	orderItemsQuery := `
	CREATE TABLE IF NOT EXISTS order_items (
		id TEXT PRIMARY KEY,
		order_id TEXT NOT NULL,
		product_id TEXT NOT NULL,
		quantity INTEGER NOT NULL,
		price REAL NOT NULL,
		FOREIGN KEY (order_id) REFERENCES orders(id),
		FOREIGN KEY (product_id) REFERENCES products(id)
	)
	`
	_, err = db.Exec(orderItemsQuery)
	if err != nil {
		return fmt.Errorf("failed to create order_items table: %w", err)
	}

	return nil
}


func seedData() error {
    // Check if products table already has data
    var count int
    err := db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
    if err != nil {
        return fmt.Errorf("failed to check products: %w", err)
    }

    // Always reseed to ensure latest product data (check if image URLs are local)
    if count > 0 {
        var imageURL string
        err := db.QueryRow("SELECT image_url FROM products LIMIT 1").Scan(&imageURL)
        if err == nil && imageURL != "" {
            // If first product already has local path, don't reseed
            if imageURL[0:1] == "/" {
                return nil
            }
        }
        // If images are still external (Unsplash), clear and reseed
        deleteQuery := "DELETE FROM products"
        db.Exec(deleteQuery)
    }

    // Insert initial products
    for _, product := range products {  // Use the mock products from data.go
        _, err := db.Exec(
            "INSERT INTO products (id, title, price, category, image_url, description) VALUES (?, ?, ?, ?, ?, ?)",
            product.ID, product.Title, product.Price, product.Category, product.ImageURL, product.Description,
        )
        if err != nil {
            return fmt.Errorf("failed to insert product: %w", err)
        }
    }

    return nil
}

func createOrder(userID string, firstName string, lastName string, email string, address string, city string, postalCode string, country string, totalPrice float64, items []CartItem) (string, error) {
	orderID := fmt.Sprintf("order_%d_%d", time.Now().Unix(), rand.Intn(10000))

	query := "INSERT INTO orders (id, user_id, first_name, last_name, email, address, city, postal_code, country, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	_, err := db.Exec(query, orderID, userID, firstName, lastName, email, address, city, postalCode, country, totalPrice, "pending")
	if err != nil {
		return "", fmt.Errorf("failed to create order: %w", err)
	}

	// Insert order items
	for i, item := range items {
		itemID := fmt.Sprintf("item_%s_%d", orderID, i)
		price := 0.0
		if item.Product != nil {
			price = item.Product.Price
		}
		itemQuery := "INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)"
		_, err := db.Exec(itemQuery, itemID, orderID, item.ProductID, item.Quantity, price)
		if err != nil {
			return "", fmt.Errorf("failed to insert order item: %w", err)
		}
	}

	return orderID, nil
}

func getOrdersByUserID(userID string) ([]Order, error) {
	query := "SELECT id, user_id, first_name, last_name, email, address, city, postal_code, country, total_price, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC"
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		err := rows.Scan(&o.ID, &o.UserID, &o.FirstName, &o.LastName, &o.Email, &o.Address, &o.City, &o.PostalCode, &o.Country, &o.TotalPrice, &o.Status, &o.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}
		orders = append(orders, o)
	}

	return orders, nil
}

func getAllOrders() ([]Order, error) {
	query := "SELECT id, user_id, first_name, last_name, email, address, city, postal_code, country, total_price, status, created_at FROM orders ORDER BY created_at DESC"
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		err := rows.Scan(&o.ID, &o.UserID, &o.FirstName, &o.LastName, &o.Email, &o.Address, &o.City, &o.PostalCode, &o.Country, &o.TotalPrice, &o.Status, &o.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}
		orders = append(orders, o)
	}

	return orders, nil
}

