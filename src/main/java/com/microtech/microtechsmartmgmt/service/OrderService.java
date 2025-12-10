package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.dto.request.CreateOrderRequest;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;

import java.util.List;
import java.util.Optional;

public interface OrderService {

    Order createOrder(CreateOrderRequest request);

    Order createOrder(Order order);
    // admin only
    List<Order> getAllOrdersForAdmin();
     // with ownership validation
    Optional<Order> getOrderForClient(Long orderId, Long clientId);

    List<Order> getOrdersForClient(Long clientId);

    Optional<Order> getOrder(Long orderId);

    Order updateOrder(Order order);

    void deleteOrder(Long orderId);
    // admin only
    Order updateOrderStatus(Long orderId, OrderStatus newStatus);

    Order cancelOrder(Long orderId, Long clientId);
}
