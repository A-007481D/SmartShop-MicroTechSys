package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.dto.request.CreateOrderRequest;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.exception.ResourceNotFoundException;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import com.microtech.microtechsmartmgmt.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// admin order ops controller

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrdersForAdmin();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        Order order = orderService.getOrder(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId));
        return ResponseEntity.ok(order);
    }

    @PostMapping
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Order> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        Order createdOrder = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @PutMapping("/{orderId}/status")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        Order updatedOrder = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{orderId}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Order> updateOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody Order order) {
        order.setId(orderId);
        Order updatedOrder = orderService.updateOrder(order);
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/{orderId}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/client/{clientId}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<List<Order>> getOrdersByClient(@PathVariable Long clientId) {
        List<Order> orders = orderService.getOrdersForClient(clientId);
        return ResponseEntity.ok(orders);
    }
}
