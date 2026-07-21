package main

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDatabase() error {
	var err error
	db, err = sql.Open("sqlite", "./keurope.db")
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	err = db.Ping()
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
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


	fmt.Println("✅ Database connected")
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
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id),
		FOREIGN KEY (product_id) REFERENCES products(id),
		UNIQUE(user_id, product_id)
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
            "INSERT INTO products (id, title, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
            product.ID, product.Title, product.Price, product.Category, product.ImageURL,
        )
        if err != nil {
            return fmt.Errorf("failed to insert product: %w", err)
        }
    }
    
    return nil
}

