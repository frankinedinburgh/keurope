package com.keurope.cart;

import com.keurope.auth.AuthInterceptor;
import com.keurope.auth.UserClaims;
import com.keurope.common.InvalidInputException;
import com.keurope.common.NotFoundException;
import com.keurope.common.Responses;
import com.keurope.common.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart")
@SecurityRequirement(name = "BearerAuth")
public class CartController {

    public record AddToCartRequest(String productId, int quantity, String size) {
    }

    public record UpdateQuantityRequest(int quantity) {
    }

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @Operation(summary = "Get Shopping Cart")
    @GetMapping
    public CartService.CartResponse getCart(@RequestAttribute(AuthInterceptor.CLAIMS_ATTRIBUTE) UserClaims claims) {
        return cartService.getCart(claims.userId());
    }

    @Operation(summary = "Add to Cart")
    @PostMapping
    public ResponseEntity<Object> addToCart(@RequestAttribute(AuthInterceptor.CLAIMS_ATTRIBUTE) UserClaims claims,
                                            @RequestBody AddToCartRequest req) {
        if (Strings.isEmpty(req.productId()) || req.quantity() <= 0 || Strings.isEmpty(req.size())) {
            return Responses.plainError(HttpStatus.BAD_REQUEST, "Invalid product_id, quantity, or size");
        }

        try {
            return ResponseEntity.ok(cartService.addToCart(claims.userId(), req.productId(), req.quantity(), req.size()));
        } catch (InvalidInputException e) {
            return Responses.plainError(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/clear")
    public Map<String, String> clearCart(@RequestAttribute(AuthInterceptor.CLAIMS_ATTRIBUTE) UserClaims claims) {
        cartService.clearCart(claims.userId());
        return Map.of("status", "cleared");
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Object> removeFromCart(@RequestAttribute(AuthInterceptor.CLAIMS_ATTRIBUTE) UserClaims claims,
                                                 @PathVariable String cartId) {
        cartService.removeFromCart(claims.userId(), cartId);
        return ResponseEntity.ok(Map.of("status", "removed"));
    }

    @PutMapping("/{cartId}")
    public ResponseEntity<Object> updateQuantity(@RequestAttribute(AuthInterceptor.CLAIMS_ATTRIBUTE) UserClaims claims,
                                                 @PathVariable String cartId,
                                                 @RequestBody UpdateQuantityRequest req) {
        return cartService.updateQuantity(claims.userId(), cartId, req.quantity())
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Map.of("status", "removed")));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Object> handleNotFound(NotFoundException e) {
        return Responses.plainError(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleInvalidBody() {
        return Responses.plainError(HttpStatus.BAD_REQUEST, "Invalid request");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Object> handleDatabaseError(DataAccessException e) {
        return Responses.plainError(HttpStatus.INTERNAL_SERVER_ERROR, e.getMostSpecificCause().getMessage());
    }
}
