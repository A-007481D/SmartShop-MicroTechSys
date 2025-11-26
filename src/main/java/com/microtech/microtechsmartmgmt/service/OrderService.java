package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.entity.Order;

import java.util.Optional;

public interface OrderService {
    Order createOrder(Order order);

    Optional<Order> getOrdersForAdmin(Long orderId);


    Optional<Order> getOrder(Long orderId);

    Order updateOrder(Order order);
}
