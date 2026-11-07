package com.keurope.order;

import com.keurope.auth.AuthInterceptor;
import com.keurope.auth.UserClaims;
import com.keurope.common.ApiResponse;
import com.keurope.common.Responses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders")
@SecurityRequirement(name = "BearerAuth")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create Order", description = "Create a new order with shipping information")
    @PostMapping
    public ResponseEntity<ApiResponse> createOrder(@RequestAttribute(AuthInterceptor.CLAIMS_ATTRIBUTE) UserClaims claims,
                                                   @RequestBody CreateOrderRequest req) {
        String orderId = orderService.createOrder(claims.userId(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(Map.of("order_id", orderId)));
    }

    @Operation(summary = "Get User Orders")
    @GetMapping
    public ApiResponse getOrders(@RequestAttribute(AuthInterceptor.CLAIMS_ATTRIBUTE) UserClaims claims) {
        return ApiResponse.success(orderService.getOrdersForUser(claims.userId()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleInvalidBody() {
        return Responses.apiError(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Invalid request body");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Object> handleDatabaseError(DataAccessException e) {
        return Responses.apiError(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", e.getMostSpecificCause().getMessage());
    }
}
