package com.keurope.product;

import com.keurope.common.ApiResponse;
import com.keurope.common.Responses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Products")
public class ProductController {

    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @Operation(summary = "List Products", description = "Get all products with optional category filter")
    @GetMapping("/products")
    public ApiResponse getProducts(@RequestParam(required = false) String category) {
        return ApiResponse.success(ProductPage.singlePage(products.findAll(category)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Object> getProduct(@PathVariable String id) {
        return products.findById(id)
                .<ResponseEntity<Object>>map(p -> ResponseEntity.ok(ApiResponse.success(p)))
                .orElseGet(() -> Responses.apiError(HttpStatus.NOT_FOUND, "NOT_FOUND", "Product not found"));
    }

    @GetMapping("/categories")
    public ApiResponse getCategories() {
        return ApiResponse.success(products.findCategories());
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Object> handleDatabaseError(DataAccessException e) {
        return Responses.apiError(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", e.getMostSpecificCause().getMessage());
    }
}
