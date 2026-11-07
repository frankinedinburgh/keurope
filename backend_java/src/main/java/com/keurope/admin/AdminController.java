package com.keurope.admin;

import com.keurope.auth.JwtService;
import com.keurope.common.ApiResponse;
import com.keurope.common.Responses;
import com.keurope.common.Strings;
import com.keurope.config.KeuropeProperties;
import com.keurope.order.OrderService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin")
public class AdminController {

    public record AdminLoginRequest(String password) {
    }

    public record AdminLoginResponse(String status, String token) {
    }

    public record UpdateOrderStatusRequest(String status) {
    }

    private final JwtService jwtService;
    private final OrderService orderService;
    private final byte[] adminPassword;

    public AdminController(JwtService jwtService, OrderService orderService, KeuropeProperties properties) {
        this.jwtService = jwtService;
        this.orderService = orderService;
        this.adminPassword = properties.adminPassword().getBytes(StandardCharsets.UTF_8);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody AdminLoginRequest req) {
        byte[] given = Strings.orEmpty(req.password()).getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(given, adminPassword)) {
            return Responses.simpleError(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        return ResponseEntity.ok(new AdminLoginResponse("success", jwtService.generateAdminToken()));
    }

    @SecurityRequirement(name = "BearerAuth")
    @GetMapping("/orders")
    public ApiResponse getOrders() {
        return ApiResponse.success(orderService.getAllOrders());
    }

    @SecurityRequirement(name = "BearerAuth")
    @PutMapping("/orders/status")
    public ResponseEntity<Object> updateOrderStatus(@RequestParam(required = false) String id,
                                                    @RequestBody UpdateOrderStatusRequest req) {
        if (Strings.isEmpty(id)) {
            return Responses.simpleError(HttpStatus.BAD_REQUEST, "Order ID required");
        }
        if (Strings.isEmpty(req.status())) {
            return Responses.simpleError(HttpStatus.BAD_REQUEST, "Status required");
        }

        try {
            if (!orderService.updateStatus(id, req.status())) {
                return Responses.simpleError(HttpStatus.NOT_FOUND, "Order not found");
            }
        } catch (DataAccessException e) {
            return Responses.simpleError(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to update order: " + e.getMostSpecificCause().getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of("status", req.status())));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleInvalidBody() {
        return Responses.simpleError(HttpStatus.BAD_REQUEST, "Invalid request");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Object> handleDatabaseError(DataAccessException e) {
        return Responses.apiError(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", e.getMostSpecificCause().getMessage());
    }
}
