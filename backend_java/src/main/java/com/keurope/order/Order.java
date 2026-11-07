package com.keurope.order;

public record Order(
        String id,
        String userId,
        String firstName,
        String lastName,
        String email,
        String address,
        String city,
        String postalCode,
        String country,
        double totalPrice,
        String status,
        String createdAt) {
}
