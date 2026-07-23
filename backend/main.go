// @title Keurope API
// @version 1.0
// @description Korean Fashion E-commerce Backend API
// @host api.keurope.com
// @basePath /api
// @schemes https http
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description "Type 'Bearer TOKEN'"

package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
	_ "keurope/docs"
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

	// Admin routes (public - but password protected)
	router.HandleFunc("/api/admin/login", adminLogin).Methods("POST")

	// Product routes (public read, admin write)
	router.HandleFunc("/api/products", getProducts).Methods("GET")
	router.HandleFunc("/api/products/{id}", getProduct).Methods("GET")
	router.HandleFunc("/api/categories", getCategories).Methods("GET")

	// User protected routes (require user authentication)
	userProtected := router.PathPrefix("/api").Subrouter()
	userProtected.Use(authMiddleware)

	// Cart routes (user protected)
	userProtected.HandleFunc("/cart", getCartHandler).Methods("GET")
	userProtected.HandleFunc("/cart", addToCartHandler).Methods("POST")
	userProtected.HandleFunc("/cart/clear", clearCartHandler).Methods("DELETE")
	userProtected.HandleFunc("/cart/{cartId}", removeFromCartHandler).Methods("DELETE")
	userProtected.HandleFunc("/cart/{cartId}", updateCartQuantityHandler).Methods("PUT")

	// Order routes (user protected)
	userProtected.HandleFunc("/orders", createOrderHandler).Methods("POST")
	userProtected.HandleFunc("/orders", getOrdersHandler).Methods("GET")

	// Admin protected routes (require admin authentication)
	adminProtected := router.PathPrefix("/api/admin").Subrouter()
	adminProtected.Use(adminMiddleware)

	// Admin product management
	adminProtected.HandleFunc("/products", createProduct).Methods("POST")
	adminProtected.HandleFunc("/products/{id}", updateProduct).Methods("PUT")
	adminProtected.HandleFunc("/products/{id}", deleteProduct).Methods("DELETE")

	// Admin order management
	adminProtected.HandleFunc("/orders", getAdminOrdersHandler).Methods("GET")
	adminProtected.HandleFunc("/orders/status", updateOrderStatusHandler).Methods("PUT")

	// Swagger API documentation (public)
	router.PathPrefix("/docs/").Handler(httpSwagger.WrapHandler)

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
