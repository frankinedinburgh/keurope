package com.keurope.auth;

import com.keurope.common.InvalidInputException;
import com.keurope.common.Responses;
import com.keurope.common.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth")
public class AuthController {

    public record AuthRequest(String email, String password) {
    }

    public record AuthResponse(String token, User user) {
    }

    public record ForgotPasswordRequest(String email) {
    }

    public record ForgotPasswordResponse(String message, String token) {
    }

    public record ResetPasswordRequest(String token, String newPassword) {
    }

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @Operation(summary = "User Registration", description = "Create a new user account with email and password")
    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody AuthRequest req) {
        if (Strings.isEmpty(req.email()) || Strings.isEmpty(req.password())) {
            return Responses.plainError(HttpStatus.BAD_REQUEST, "Email and password required");
        }

        User user;
        try {
            user = userService.register(req.email(), req.password());
        } catch (InvalidInputException e) {
            return Responses.plainError(HttpStatus.CONFLICT, "Failed to register: " + e.getMessage());
        }

        return ResponseEntity.ok(new AuthResponse(jwtService.generateUserToken(user), user));
    }

    @Operation(summary = "User Login", description = "Authenticate user with email and password, returns JWT token")
    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody AuthRequest req) {
        Optional<User> user = userService.authenticate(Strings.orEmpty(req.email()), Strings.orEmpty(req.password()));
        if (user.isEmpty()) {
            return Responses.plainError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return ResponseEntity.ok(new AuthResponse(jwtService.generateUserToken(user.get()), user.get()));
    }

    @Operation(summary = "Get Current User")
    @SecurityRequirement(name = "BearerAuth")
    @GetMapping("/me")
    public ResponseEntity<Object> getMe(HttpServletRequest request) {
        String token = BearerToken.extract(request);
        Optional<UserClaims> claims = token.isEmpty() ? Optional.empty() : jwtService.verifyUserToken(token);
        if (claims.isEmpty()) {
            return Responses.plainError(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return userService.findById(claims.get().userId())
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> Responses.plainError(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Operation(summary = "Forgot Password")
    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (Strings.isEmpty(req.email())) {
            return Responses.plainError(HttpStatus.BAD_REQUEST, "Email required");
        }

        Optional<User> user = userService.findByEmail(req.email());
        if (user.isEmpty()) {
            // Don't reveal if email exists
            return ResponseEntity.ok(new ForgotPasswordResponse(
                    "If an account with this email exists, a reset token has been sent", ""));
        }

        String token = userService.createResetToken(user.get().id());
        return ResponseEntity.ok(new ForgotPasswordResponse(
                "Reset token generated. In production, this would be sent via email.", token));
    }

    @Operation(summary = "Reset Password")
    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (Strings.isEmpty(req.token()) || Strings.isEmpty(req.newPassword())) {
            return Responses.plainError(HttpStatus.BAD_REQUEST, "Token and new password required");
        }

        Optional<String> userId = userService.validateResetToken(req.token());
        if (userId.isEmpty()) {
            return Responses.plainError(HttpStatus.UNAUTHORIZED, "invalid or expired token");
        }

        try {
            userService.updatePassword(userId.get(), req.newPassword());
        } catch (InvalidInputException e) {
            return Responses.plainError(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        Map<String, String> body = new LinkedHashMap<>();
        body.put("status", "success");
        body.put("message", "Password has been reset successfully");
        return ResponseEntity.ok(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleInvalidBody() {
        return Responses.plainError(HttpStatus.BAD_REQUEST, "Invalid request");
    }
}
