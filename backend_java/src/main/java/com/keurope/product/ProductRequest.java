package com.keurope.product;

import com.keurope.common.Strings;

public record ProductRequest(String title, double price, String category, String description, String imageUrl) {

    public boolean isValid() {
        return !Strings.isEmpty(title) && price > 0 && !Strings.isEmpty(category);
    }
}
