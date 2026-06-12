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
