package com.keurope.product;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ProductPage(List<Product> items, Pagination pagination) {

    // The API contract uses camelCase here, unlike the rest of the snake_case payloads
    public record Pagination(int page, int limit, int total, @JsonProperty("totalPages") int totalPages) {
    }

    public static ProductPage singlePage(List<Product> items) {
        return new ProductPage(items, new Pagination(1, 100, items.size(), 1));
    }
}
