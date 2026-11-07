package com.keurope.cart;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class CartRepository {

    private static final RowMapper<CartItem> MAPPER = (rs, i) -> new CartItem(
            rs.getString("id"),
            rs.getString("user_id"),
            rs.getString("product_id"),
            rs.getInt("quantity"),
            rs.getString("size"),
            null);

    private final JdbcTemplate jdbc;

    public CartRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<CartItem> findByUserId(String userId) {
        return jdbc.query("""
                SELECT id, user_id, product_id, quantity, size
                FROM carts
                WHERE user_id = ?
                ORDER BY created_at DESC""", MAPPER, userId);
    }

    public Optional<CartItem> findById(String id) {
        return jdbc.query("SELECT id, user_id, product_id, quantity, size FROM carts WHERE id = ?", MAPPER, id)
                .stream()
                .findFirst();
    }

    public Optional<String> findIdByProductAndSize(String userId, String productId, String size) {
        return jdbc.queryForList("SELECT id FROM carts WHERE user_id = ? AND product_id = ? AND size = ?",
                        String.class, userId, productId, size)
                .stream()
                .findFirst();
    }

    public void insert(CartItem item) {
        jdbc.update("INSERT INTO carts (id, user_id, product_id, quantity, size) VALUES (?, ?, ?, ?, ?)",
                item.id(), item.userId(), item.productId(), item.quantity(), item.size());
    }

    public void incrementQuantity(String id, int amount) {
        jdbc.update("UPDATE carts SET quantity = quantity + ? WHERE id = ?", amount, id);
    }

    public boolean updateQuantity(String userId, String id, int quantity) {
        return jdbc.update("UPDATE carts SET quantity = ? WHERE id = ? AND user_id = ?", quantity, id, userId) > 0;
    }

    public boolean delete(String userId, String id) {
        return jdbc.update("DELETE FROM carts WHERE id = ? AND user_id = ?", id, userId) > 0;
    }

    public void deleteAllForUser(String userId) {
        jdbc.update("DELETE FROM carts WHERE user_id = ?", userId);
    }
}
