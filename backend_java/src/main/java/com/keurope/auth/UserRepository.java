package com.keurope.auth;

import com.keurope.common.Timestamps;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    public record UserCredentials(User user, String passwordHash) {
    }

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(String id, String email, String passwordHash) {
        jdbc.update("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", id, email, passwordHash);
    }

    public Optional<UserCredentials> findByEmail(String email) {
        return jdbc.query("SELECT id, email, password_hash, created_at FROM users WHERE email = ?",
                        (rs, i) -> new UserCredentials(
                                new User(rs.getString("id"), rs.getString("email"),
                                        Timestamps.toRfc3339(rs.getString("created_at"))),
                                rs.getString("password_hash")),
                        email)
                .stream()
                .findFirst();
    }

    public Optional<User> findById(String id) {
        return jdbc.query("SELECT id, email, created_at FROM users WHERE id = ?",
                        (rs, i) -> new User(rs.getString("id"), rs.getString("email"),
                                Timestamps.toRfc3339(rs.getString("created_at"))),
                        id)
                .stream()
                .findFirst();
    }

    public void updatePasswordHash(String userId, String passwordHash) {
        jdbc.update("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, userId);
    }

    public void insertResetToken(String id, String userId, String token, String expiresAt) {
        jdbc.update("INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
                id, userId, token, expiresAt);
    }

    public Optional<String> findUserIdByValidResetToken(String token) {
        return jdbc.queryForList(
                        "SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > datetime('now')",
                        String.class, token)
                .stream()
                .findFirst();
    }

    public void deleteResetTokens(String userId) {
        jdbc.update("DELETE FROM password_reset_tokens WHERE user_id = ?", userId);
    }
}
