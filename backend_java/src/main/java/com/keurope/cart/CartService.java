package com.keurope.cart;

import com.keurope.common.Ids;
import com.keurope.common.InvalidInputException;
import com.keurope.common.NotFoundException;
import com.keurope.product.Product;
import com.keurope.product.ProductRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    public record CartResponse(List<CartItem> items, double total) {
    }

    private final CartRepository carts;
    private final ProductRepository products;

    public CartService(CartRepository carts, ProductRepository products) {
        this.carts = carts;
        this.products = products;
    }

    public CartResponse getCart(String userId) {
        List<CartItem> items = carts.findByUserId(userId).stream()
                .map(item -> item.withProduct(products.findById(item.productId()).orElse(null)))
                .toList();

        double total = items.stream()
                .filter(item -> item.product() != null)
                .mapToDouble(item -> item.product().price() * item.quantity())
                .sum();

        return new CartResponse(items, total);
    }

    /** Adds the product, or bumps the quantity if the same product and size is already in the cart. */
    @Transactional
    public CartItem addToCart(String userId, String productId, int quantity, String size) {
        Product product = products.findById(productId)
                .orElseThrow(() -> new InvalidInputException("product not found"));

        Optional<String> existingId = carts.findIdByProductAndSize(userId, productId, size);
        if (existingId.isPresent()) {
            carts.incrementQuantity(existingId.get(), quantity);
            return carts.findById(existingId.get())
                    .orElseThrow(() -> new IllegalStateException("failed to fetch updated item"))
                    .withProduct(product);
        }

        CartItem item = new CartItem(Ids.generate(), userId, productId, quantity, size, product);
        carts.insert(item);
        return item;
    }

    public void removeFromCart(String userId, String cartId) {
        if (!carts.delete(userId, cartId)) {
            throw new NotFoundException("cart item not found");
        }
    }

    /** Returns the updated item, or empty if quantity <= 0 and the item was removed. */
    public Optional<CartItem> updateQuantity(String userId, String cartId, int quantity) {
        if (quantity <= 0) {
            removeFromCart(userId, cartId);
            return Optional.empty();
        }

        if (!carts.updateQuantity(userId, cartId, quantity)) {
            throw new NotFoundException("cart item not found");
        }

        CartItem item = carts.findById(cartId)
                .orElseThrow(() -> new NotFoundException("cart item not found"));
        return Optional.of(item.withProduct(products.findById(item.productId()).orElse(null)));
    }

    public void clearCart(String userId) {
        carts.deleteAllForUser(userId);
    }
}
