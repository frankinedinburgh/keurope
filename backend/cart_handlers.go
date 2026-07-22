package main

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

type AddToCartRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

func getCartHandler(w http.ResponseWriter, r *http.Request) {
	claims := getClaimsFromContext(r)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	items, err := getCart(claims.UserID)
	if err != nil {
		http.Error(w, "Failed to get cart: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if items == nil {
		items = []CartItem{}
	}

	// Calculate total
	var total float64
	for _, item := range items {
		if item.Product != nil {
			total += item.Product.Price * float64(item.Quantity)
		}
	}

	response := CartResponse{
		Items: items,
		Total: total,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func addToCartHandler(w http.ResponseWriter, r *http.Request) {
	claims := getClaimsFromContext(r)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req AddToCartRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.ProductID == "" || req.Quantity <= 0 {
		http.Error(w, "Invalid product_id or quantity", http.StatusBadRequest)
		return
	}

	item, err := addToCart(claims.UserID, req.ProductID, req.Quantity)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func removeFromCartHandler(w http.ResponseWriter, r *http.Request) {
	claims := getClaimsFromContext(r)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	cartID := mux.Vars(r)["cartId"]
	if cartID == "" {
		http.Error(w, "Cart ID required", http.StatusBadRequest)
		return
	}

	err := removeFromCart(claims.UserID, cartID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "removed"})
}

func updateCartQuantityHandler(w http.ResponseWriter, r *http.Request) {
	claims := getClaimsFromContext(r)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	cartID := mux.Vars(r)["cartId"]
	if cartID == "" {
		http.Error(w, "Cart ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Quantity int `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	item, err := updateCartQuantity(claims.UserID, cartID, req.Quantity)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, err.Error(), http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	if item == nil {
		// Item was deleted (quantity was <= 0)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "removed"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func clearCartHandler(w http.ResponseWriter, r *http.Request) {
	claims := getClaimsFromContext(r)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err := clearCart(claims.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "cleared"})
}
