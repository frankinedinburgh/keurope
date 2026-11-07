package com.keurope.product;

import com.keurope.common.ApiResponse;
import com.keurope.common.Responses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@Tag(name = "Admin")
@SecurityRequirement(name = "BearerAuth")
public class AdminProductController {

    private static final String REQUIRED_FIELDS = "Title, price, and category are required";

    private final ProductRepository products;

    public AdminProductController(ProductRepository products) {
        this.products = products;
    }

    @PostMapping
    public ResponseEntity<Object> createProduct(@RequestBody ProductRequest req) {
        if (!req.isValid()) {
            return Responses.apiError(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", REQUIRED_FIELDS);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(products.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateProduct(@PathVariable String id, @RequestBody ProductRequest req) {
        if (!req.isValid()) {
            return Responses.apiError(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", REQUIRED_FIELDS);
        }
        return products.update(id, req)
                .<ResponseEntity<Object>>map(p -> ResponseEntity.ok(ApiResponse.success(p)))
                .orElseGet(() -> Responses.apiError(HttpStatus.NOT_FOUND, "NOT_FOUND", "product not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteProduct(@PathVariable String id) {
        if (!products.delete(id)) {
            return Responses.apiError(HttpStatus.NOT_FOUND, "NOT_FOUND", "product not found");
        }
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Product deleted successfully")));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleInvalidBody() {
        return Responses.apiError(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Invalid request body");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Object> handleDatabaseError(DataAccessException e) {
        return Responses.apiError(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", e.getMostSpecificCause().getMessage());
    }
}
