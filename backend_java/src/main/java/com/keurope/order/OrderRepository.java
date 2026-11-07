package com.keurope.order;

import com.keurope.common.Timestamps;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class OrderRepository {

    private static final String SELECT_ORDERS = """
            SELECT id, user_id, first_name, last_name, email, address, city, postal_code, country,
                   total_price, status, created_at
            FROM orders""";

    private static final RowMapper<Order> MAPPER = (rs, i) -> new Order(
            rs.getString("id"),
            rs.getString("user_id"),
            rs.getString("first_name"),
            rs.getString("last_name"),
            rs.getString("email"),
            rs.getString("address"),
            rs.getString("city"),
            rs.getString("postal_code"),
            rs.getString("country"),
            rs.getDouble("total_price"),
            rs.getString("status"),
            Timestamps.toRfc3339(rs.getString("created_at")));

    private final JdbcTemplate jdbc;

    public OrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(Order o) {
        jdbc.update("""
                INSERT INTO orders (id, user_id, first_name, last_name, email, address, city, postal_code,
                                    country, total_price, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                o.id(), o.userId(), o.firstName(), o.lastName(), o.email(), o.address(), o.city(),
                o.postalCode(), o.country(), o.totalPrice(), o.status());
    }

    public void insertItem(String id, String orderId, String productId, int quantity, double price) {
        jdbc.update("INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)",
                id, orderId, productId, quantity, price);
    }

    public List<Order> findByUserId(String userId) {
        return jdbc.query(SELECT_ORDERS + " WHERE user_id = ? ORDER BY created_at DESC", MAPPER, userId);
    }

    public List<Order> findAll() {
        return jdbc.query(SELECT_ORDERS + " ORDER BY created_at DESC", MAPPER);
    }

    public boolean updateStatus(String id, String status) {
        return jdbc.update("UPDATE orders SET status = ? WHERE id = ?", status, id) > 0;
    }
}
