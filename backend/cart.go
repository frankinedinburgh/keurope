package main

import (
	"fmt"
)

type CartItem struct {
	ID        string   `json:"id"`
	UserID    string   `json:"user_id"`
	ProductID string   `json:"product_id"`
	Quantity  int      `json:"quantity"`
	Size      string   `json:"size"`
	Product   *Product `json:"product,omitempty"`
}

type CartResponse struct {
	Items []CartItem `json:"items"`
	Total float64   `json:"total"`
}

func getCart(userID string) ([]CartItem, error) {
	query := `
		SELECT c.id, c.user_id, c.product_id, c.quantity, c.size
		FROM carts c
		WHERE c.user_id = ?
		ORDER BY c.created_at DESC
	`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query cart: %w", err)
	}
	defer rows.Close()

	var items []CartItem
	for rows.Next() {
		var item CartItem
		err := rows.Scan(&item.ID, &item.UserID, &item.ProductID, &item.Quantity, &item.Size)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cart item: %w", err)
		}

		// Get product details
		product, err := getProductByIDFromDB(item.ProductID)
		if err == nil && product != nil {
			item.Product = product
		}

		items = append(items, item)
	}

	return items, nil
}

func addToCart(userID, productID string, quantity int, size string) (*CartItem, error) {
	// Check if product exists
	product, err := getProductByIDFromDB(productID)
	if err != nil || product == nil {
		return nil, fmt.Errorf("product not found")
	}

	// Check if item with same size already in cart
	var existingID string
	query := "SELECT id FROM carts WHERE user_id = ? AND product_id = ? AND size = ?"
	err = db.QueryRow(query, userID, productID, size).Scan(&existingID)

	if err == nil {
		// Item exists, update quantity
		updateQuery := "UPDATE carts SET quantity = quantity + ? WHERE id = ?"
		_, err := db.Exec(updateQuery, quantity, existingID)
		if err != nil {
			return nil, fmt.Errorf("failed to update cart item: %w", err)
		}

		// Get updated item
		var item CartItem
		getQuery := "SELECT id, user_id, product_id, quantity, size FROM carts WHERE id = ?"
		err = db.QueryRow(getQuery, existingID).Scan(&item.ID, &item.UserID, &item.ProductID, &item.Quantity, &item.Size)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch updated item: %w", err)
		}
		item.Product = product
		return &item, nil
	}

	// Item doesn't exist, create new
	cartID := generateID()
	insertQuery := "INSERT INTO carts (id, user_id, product_id, quantity, size) VALUES (?, ?, ?, ?, ?)"
	_, err = db.Exec(insertQuery, cartID, userID, productID, quantity, size)
	if err != nil {
		return nil, fmt.Errorf("failed to add to cart: %w", err)
	}

	return &CartItem{
		ID:        cartID,
		UserID:    userID,
		ProductID: productID,
		Quantity:  quantity,
		Size:      size,
		Product:   product,
	}, nil
}

func removeFromCart(userID, cartID string) error {
	query := "DELETE FROM carts WHERE id = ? AND user_id = ?"
	result, err := db.Exec(query, cartID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove from cart: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		return fmt.Errorf("cart item not found")
	}

	return nil
}

func updateCartQuantity(userID, cartID string, quantity int) (*CartItem, error) {
	if quantity <= 0 {
		return nil, removeFromCart(userID, cartID)
	}

	query := "UPDATE carts SET quantity = ? WHERE id = ? AND user_id = ?"
	result, err := db.Exec(query, quantity, cartID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to update quantity: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		return nil, fmt.Errorf("cart item not found")
	}

	// Get updated item
	var item CartItem
	getQuery := "SELECT id, user_id, product_id, quantity, size FROM carts WHERE id = ?"
	err = db.QueryRow(getQuery, cartID).Scan(&item.ID, &item.UserID, &item.ProductID, &item.Quantity, &item.Size)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated item: %w", err)
	}

	product, _ := getProductByIDFromDB(item.ProductID)
	item.Product = product
	return &item, nil
}

func clearCart(userID string) error {
	query := "DELETE FROM carts WHERE user_id = ?"
	_, err := db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to clear cart: %w", err)
	}
	return nil
}
