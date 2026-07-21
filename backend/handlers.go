package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func getProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get category query parameter if provided
	category := r.URL.Query().Get("category")

	products, err := getProductsFromDB(category)
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
		Data: map[string]interface{}{
			"items": products,
			"pagination": map[string]int{
				"page":        1,
				"limit":       100,
				"total":       len(products),
				"totalPages":  1,
			},
		},
	}

	json.NewEncoder(w).Encode(response)
}

func getProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	product, err := getProductByIDFromDB(id)
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

	if product == nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ApiResponse{
			Status: "error",
			Error: ErrorResponse{
				Code:    "NOT_FOUND",
				Message: "Product not found",
			},
		})
		return
	}

	response := ApiResponse{
		Status: "success",
		Data:   product,
	}
	json.NewEncoder(w).Encode(response)
}

func getCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	categories, err := getCategoriesFromDB()
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
		Data:   categories,
	}
	json.NewEncoder(w).Encode(response)
}

func createProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Title       string  `json:"title"`
		Price       float64 `json:"price"`
		Category    string  `json:"category"`
		Description string  `json:"description"`
		ImageURL    string  `json:"image_url"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{
			Status: "error",
			Error: ErrorResponse{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
			},
		})
		return
	}

	if req.Title == "" || req.Price <= 0 || req.Category == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{
			Status: "error",
			Error: ErrorResponse{
				Code:    "INVALID_REQUEST",
				Message: "Title, price, and category are required",
			},
		})
		return
	}

	product, err := createProductInDB(req.Title, req.Price, req.Category, req.Description, req.ImageURL)
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

	w.WriteHeader(http.StatusCreated)
	response := ApiResponse{
		Status: "success",
		Data:   product,
	}
	json.NewEncoder(w).Encode(response)
}

func updateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	var req struct {
		Title       string  `json:"title"`
		Price       float64 `json:"price"`
		Category    string  `json:"category"`
		Description string  `json:"description"`
		ImageURL    string  `json:"image_url"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{
			Status: "error",
			Error: ErrorResponse{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
			},
		})
		return
	}

	if req.Title == "" || req.Price <= 0 || req.Category == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{
			Status: "error",
			Error: ErrorResponse{
				Code:    "INVALID_REQUEST",
				Message: "Title, price, and category are required",
			},
		})
		return
	}

	product, err := updateProductInDB(id, req.Title, req.Price, req.Category, req.Description, req.ImageURL)
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
		Data:   product,
	}
	json.NewEncoder(w).Encode(response)
}

func deleteProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	err := deleteProductFromDB(id)
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
		Data: map[string]string{
			"message": "Product deleted successfully",
		},
	}
	json.NewEncoder(w).Encode(response)
}
