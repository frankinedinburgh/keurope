package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

// CORS middleware to allow requests from frontend
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

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

	// Cart routes (protected)
	router.HandleFunc("/api/cart", getCartHandler).Methods("GET")
	router.HandleFunc("/api/cart", addToCartHandler).Methods("POST")
	router.HandleFunc("/api/cart/clear", clearCartHandler).Methods("DELETE")
	router.HandleFunc("/api/cart/{cartId}", removeFromCartHandler).Methods("DELETE")
	router.HandleFunc("/api/cart/{cartId}", updateCartQuantityHandler).Methods("PUT")

	// Order routes (protected)
	router.HandleFunc("/api/orders", createOrderHandler).Methods("POST")
	router.HandleFunc("/api/orders", getOrdersHandler).Methods("GET")
	router.HandleFunc("/api/orders/all", getAllOrdersHandler).Methods("GET")

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
