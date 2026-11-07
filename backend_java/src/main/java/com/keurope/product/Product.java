package com.keurope.product;

import com.fasterxml.jackson.annotation.JsonInclude;

public record Product(
        String id,
        String title,
        double price,
        String category,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) String imageUrl,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) String description) {
}
