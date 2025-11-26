package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.repository.OrderRepository;
import com.microtech.microtechsmartmgmt.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;

    @Override
    public Order createOrder(Order order) {
        Client client = clientRepository.findById(order.getClient().getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        order.setClient(client);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        return orderRepository.save(order);
    }

    @Override
    public Optional<Order> getOrdersForAdmin(Long adminId) {
        return orderRepository.findById(adminId);
    }

    @Override
    public Optional<Order> getOrder(Long orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }


}
