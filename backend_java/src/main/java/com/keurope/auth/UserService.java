package com.keurope.auth;

import com.keurope.common.Ids;
import com.keurope.common.InvalidInputException;
import com.keurope.common.Timestamps;
import java.util.Optional;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    // Cost 10 matches Go's bcrypt.DefaultCost, so existing hashes keep working
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    public User register(String email, String password) {
        PasswordPolicy.validate(password);

        String userId = Ids.generate();
        try {
            users.insert(userId, email, passwordEncoder.encode(password));
        } catch (DataAccessException e) {
            throw new InvalidInputException("failed to register user: " + e.getMostSpecificCause().getMessage());
        }

        // Go returned the zero value for created_at here
        return new User(userId, email, "");
    }

    public Optional<User> authenticate(String email, String password) {
        return users.findByEmail(email)
                .filter(c -> passwordEncoder.matches(password, c.passwordHash()))
                .map(UserRepository.UserCredentials::user);
    }

    public Optional<User> findById(String id) {
        return users.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return users.findByEmail(email).map(UserRepository.UserCredentials::user);
    }

    /** Stores a random reset token valid for 1 hour and returns it. */
    public String createResetToken(String userId) {
        String token = Ids.randomHex(32);
        users.insertResetToken(Ids.generate(), userId, token, Timestamps.utcPlusHours(1));
        return token;
    }

    public Optional<String> validateResetToken(String token) {
        return users.findUserIdByValidResetToken(token);
    }

    @Transactional
    public void updatePassword(String userId, String newPassword) {
        PasswordPolicy.validate(newPassword);
        users.updatePasswordHash(userId, passwordEncoder.encode(newPassword));
        users.deleteResetTokens(userId);
    }
}
