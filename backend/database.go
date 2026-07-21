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

func createTables() error {
    query := `
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        image_url TEXT
    )
    `
    // TODO: Execute the query
	db.Exec(query)
    return nil
}


func seedData() error {
    // Check if products table already has data
    var count int
    err := db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
    if err != nil {
        return fmt.Errorf("failed to check products: %w", err)
    }
    
    // If products already exist, don't seed again
    if count > 0 {
        return nil
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

