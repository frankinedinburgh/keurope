package com.keurope.order;

import com.keurope.cart.CartItem;
import java.util.List;

public record CreateOrderRequest(
        String firstName,
        String lastName,
        String email,
        String address,
        String city,
        String postalCode,
        String country,
        List<CartItem> items,
        double totalPrice) {
}
