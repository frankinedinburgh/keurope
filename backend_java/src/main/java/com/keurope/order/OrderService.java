package com.keurope.order;

import com.keurope.cart.CartItem;
import com.keurope.common.Strings;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orders;

    public OrderService(OrderRepository orders) {
        this.orders = orders;
    }

    /** Creates the order and its items in one transaction and returns the new order id. */
    @Transactional
    public String createOrder(String userId, CreateOrderRequest req) {
        String orderId = "order_%d_%d".formatted(Instant.now().getEpochSecond(), ThreadLocalRandom.current().nextInt(10000));

        orders.insert(new Order(orderId, userId,
                Strings.orEmpty(req.firstName()), Strings.orEmpty(req.lastName()), Strings.orEmpty(req.email()),
                Strings.orEmpty(req.address()), Strings.orEmpty(req.city()), Strings.orEmpty(req.postalCode()),
                Strings.orEmpty(req.country()), req.totalPrice(), "pending", null));

        List<CartItem> items = req.items() == null ? List.of() : req.items();
        for (int i = 0; i < items.size(); i++) {
            CartItem item = items.get(i);
            double price = item.product() != null ? item.product().price() : 0.0;
            orders.insertItem("item_%s_%d".formatted(orderId, i), orderId,
                    Strings.orEmpty(item.productId()), item.quantity(), price);
        }

        return orderId;
    }

    public List<Order> getOrdersForUser(String userId) {
        return orders.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orders.findAll();
    }

    public boolean updateStatus(String orderId, String status) {
        return orders.updateStatus(orderId, status);
    }
}
