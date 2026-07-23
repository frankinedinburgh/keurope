package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AdminLoginRequest struct {
	Password string `json:"password"`
}

type AdminLoginResponse struct {
	Status string `json:"status"`
	Token  string `json:"token"`
}

type AdminClaims struct {
	jwt.RegisteredClaims
	IsAdmin bool `json:"is_admin"`
}

func adminLogin(w http.ResponseWriter, r *http.Request) {
	var req AdminLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "admin123" // Default for development
	}

	if req.Password != adminPassword {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, AdminClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		IsAdmin: true,
	})

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create token"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AdminLoginResponse{
		Status: "success",
		Token:  tokenString,
	})
}

func adminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing authorization header"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid authorization header format"})
			return
		}

		claims := &AdminClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid || !claims.IsAdmin {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid or expired token"})
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getAdminOrdersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	orders, err := getAllOrders()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ApiResponse{
			Status: "error",
			Error: ErrorResponse{
				Code:    "DATABASE_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	response := ApiResponse{
		Status: "success",
		Data:   orders,
	}
	json.NewEncoder(w).Encode(response)
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

func updateOrderStatusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	orderID := r.URL.Query().Get("id")
	if orderID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Order ID required"})
		return
	}

	var req UpdateOrderStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	if req.Status == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Status required"})
		return
	}

	query := "UPDATE orders SET status = ? WHERE id = ?"
	result, err := db.Exec(query, req.Status, orderID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Failed to update order: %v", err)})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Order not found"})
		return
	}

	json.NewEncoder(w).Encode(ApiResponse{
		Status: "success",
		Data:   map[string]string{"status": req.Status},
	})
}
