package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize database
	err := initDatabase()
	if err != nil {
		fmt.Println("❌ Database error:", err)
		return
	}

	router := mux.NewRouter()

	// Auth routes (public)
	router.HandleFunc("/api/auth/register", register).Methods("POST")
	router.HandleFunc("/api/auth/login", login).Methods("POST")
	router.HandleFunc("/api/auth/me", getMe).Methods("GET")
	router.HandleFunc("/api/auth/forgot-password", forgotPassword).Methods("POST")
	router.HandleFunc("/api/auth/reset-password", resetPassword).Methods("POST")

	// Product routes (public)
	router.HandleFunc("/api/products", getProducts).Methods("GET")
	router.HandleFunc("/api/products", createProduct).Methods("POST")
	router.HandleFunc("/api/products/{id}", getProduct).Methods("GET")
	router.HandleFunc("/api/products/{id}", updateProduct).Methods("PUT")
	router.HandleFunc("/api/products/{id}", deleteProduct).Methods("DELETE")
	router.HandleFunc("/api/categories", getCategories).Methods("GET")

	// Protected routes (require authentication)
	protected := router.PathPrefix("/api").Subrouter()
	protected.Use(authMiddleware)

	// Cart routes (protected)
	protected.HandleFunc("/cart", getCartHandler).Methods("GET")
	protected.HandleFunc("/cart", addToCartHandler).Methods("POST")
	protected.HandleFunc("/cart/clear", clearCartHandler).Methods("DELETE")
	protected.HandleFunc("/cart/{cartId}", removeFromCartHandler).Methods("DELETE")
	protected.HandleFunc("/cart/{cartId}", updateCartQuantityHandler).Methods("PUT")

	// Order routes (protected)
	protected.HandleFunc("/orders", createOrderHandler).Methods("POST")
	protected.HandleFunc("/orders", getOrdersHandler).Methods("GET")
	protected.HandleFunc("/orders/all", getAllOrdersHandler).Methods("GET")

	// Apply CORS middleware to all routes
	handler := corsMiddleware(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	fmt.Printf("🚀 Keurope Go API running on http://localhost:%s\n", port)
	fmt.Printf("Try: curl http://localhost:%s/api/products\n", port)

	http.ListenAndServe(":" + port, handler)

}
