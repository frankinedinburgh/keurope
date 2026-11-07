package com.keurope.product;

import com.keurope.common.Strings;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ProductRepository {

    // Lists and lookups don't select description, same as the Go queries
    private static final RowMapper<Product> SUMMARY_MAPPER = (rs, i) -> new Product(
            rs.getString("id"),
            rs.getString("title"),
            rs.getDouble("price"),
            rs.getString("category"),
            rs.getString("image_url"),
            null);

    private final JdbcTemplate jdbc;

    public ProductRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Product> findAll(String category) {
        if (!Strings.isEmpty(category)) {
            return jdbc.query(
                    "SELECT id, title, price, category, image_url FROM products WHERE category = ? ORDER BY id",
                    SUMMARY_MAPPER, category);
        }
        return jdbc.query("SELECT id, title, price, category, image_url FROM products ORDER BY id", SUMMARY_MAPPER);
    }

    public Optional<Product> findById(String id) {
        return jdbc.query("SELECT id, title, price, category, image_url FROM products WHERE id = ?", SUMMARY_MAPPER, id)
                .stream()
                .findFirst();
    }

    public List<String> findCategories() {
        return jdbc.queryForList("SELECT DISTINCT category FROM products ORDER BY category", String.class);
    }

    public Product create(ProductRequest req) {
        // Numeric IDs: next after the highest all-digit id
        Integer maxId = jdbc.queryForObject(
                "SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) FROM products WHERE id <> '' AND id NOT GLOB '*[^0-9]*'",
                Integer.class);
        String newId = String.valueOf((maxId == null ? 0 : maxId) + 1);

        Product product = new Product(newId, req.title(), req.price(), req.category(),
                Strings.orEmpty(req.imageUrl()), Strings.orEmpty(req.description()));
        insert(product);
        return product;
    }

    public Optional<Product> update(String id, ProductRequest req) {
        int rows = jdbc.update(
                "UPDATE products SET title = ?, price = ?, category = ?, description = ?, image_url = ? WHERE id = ?",
                req.title(), req.price(), req.category(), Strings.orEmpty(req.description()),
                Strings.orEmpty(req.imageUrl()), id);
        if (rows == 0) {
            return Optional.empty();
        }
        return Optional.of(new Product(id, req.title(), req.price(), req.category(),
                Strings.orEmpty(req.imageUrl()), Strings.orEmpty(req.description())));
    }

    public boolean delete(String id) {
        return jdbc.update("DELETE FROM products WHERE id = ?", id) > 0;
    }

    public void insert(Product p) {
        jdbc.update("INSERT INTO products (id, title, price, category, image_url, description) VALUES (?, ?, ?, ?, ?, ?)",
                p.id(), p.title(), p.price(), p.category(), p.imageUrl(), p.description());
    }

    public long count() {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM products", Long.class);
        return count == null ? 0 : count;
    }

    public String firstImageUrl() {
        return jdbc.queryForList("SELECT image_url FROM products LIMIT 1", String.class)
                .stream()
                .findFirst()
                .orElse(null);
    }

    public void deleteAll() {
        jdbc.update("DELETE FROM products");
    }
}
