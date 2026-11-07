package com.keurope.cart;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.keurope.product.Product;

public record CartItem(
        String id,
        String userId,
        String productId,
        int quantity,
        String size,
        @JsonInclude(JsonInclude.Include.NON_NULL) Product product) {

    public CartItem withProduct(Product product) {
        return new CartItem(id, userId, productId, quantity, size, product);
    }
}
