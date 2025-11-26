package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.repository.OrderRepository;
import com.microtech.microtechsmartmgmt.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;

    @Override
    public Order createOrder(Order order) {
        // Validate client exists
        Client client = clientRepository.findById(order.getClient().getId())
                .orElseThrow(() -> new BusinessException("Client not found", HttpStatus.NOT_FOUND));

        // Set order details
        order.setClient(client);
        order.setStatus(OrderStatus.PENDING);

        // Save and return
        Order savedOrder = orderRepository.save(order);

        // Update client statistics
        client.updateStats(savedOrder.getTotalTTC());
        clientRepository.save(client);

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersForAdmin() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrderForClient(Long orderId, Long clientId) {
        return orderRepository.findById(orderId)
                .filter(order -> order.getClient().getId().equals(clientId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersForClient(Long clientId) {
        // ✅ FIXED: Only return orders for THIS client
        return orderRepository.findByClientId(clientId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrder(Long orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public Order updateOrder(Order order) {
        // Validate order exists
        orderRepository.findById(order.getId())
                .orElseThrow(() -> new BusinessException("Order not found", HttpStatus.NOT_FOUND));

        return orderRepository.save(order);
    }

    @Override
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new BusinessException("Order not found with id: " + orderId, HttpStatus.NOT_FOUND);
        }
        orderRepository.deleteById(orderId);
    }

    @Override
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", HttpStatus.NOT_FOUND));

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    @Override
    public Order cancelOrder(Long orderId, Long clientId) {
        // Get order with ownership validation
        Order order = getOrderForClient(orderId, clientId)
                .orElseThrow(() -> new BusinessException(
                        "Order not found or you don't have permission to cancel this order",
                        HttpStatus.FORBIDDEN
                ));

        // Validate order can be cancelled
        if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException(
                    "Cannot cancel order with status: " + order.getStatus(),
                    HttpStatus.BAD_REQUEST
            );
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
}
