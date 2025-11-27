package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.dto.request.CreateOrderRequest;
import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.entity.OrderItem;
import com.microtech.microtechsmartmgmt.entity.Product;
import com.microtech.microtechsmartmgmt.enums.CustomerTier;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.repository.OrderRepository;
import com.microtech.microtechsmartmgmt.repository.ProductRepository;
import com.microtech.microtechsmartmgmt.service.OrderService;
import com.microtech.microtechsmartmgmt.util.MoneyUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;

    @Value("${app.vat.rate:0.20}")
    private BigDecimal vatRate;

    @Override
    public Order createOrder(CreateOrderRequest request) {
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new BusinessException("Client not found", HttpStatus.NOT_FOUND));

        Order order = Order.builder()
                .client(client)
                .promoCode(request.promoCode())
                .items(new java.util.ArrayList<>())
                .build();

        for (var itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new BusinessException("Product not found: " + itemRequest.productId(), HttpStatus.NOT_FOUND));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .order(order)
                    .build();

            order.getItems().add(orderItem);
        }

        return createOrder(order);
    }

    @Override
    public Order createOrder(Order order) {
        Client client = clientRepository.findById(order.getClient().getId())
                .orElseThrow(() -> new BusinessException("Client not found", HttpStatus.NOT_FOUND));

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new BusinessException("Order must contain at least one item", HttpStatus.BAD_REQUEST);
        }

        // Set product info and prices for each item (stock validation happens at confirmation, not creation)
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new BusinessException("Product not found: " + item.getProduct().getId(), HttpStatus.NOT_FOUND));


            item.setProduct(product);
            item.setUnitPrice(product.getPrice());
            item.setOrder(order);
        }

        BigDecimal subtotalHT = order.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        subtotalHT = MoneyUtil.round(subtotalHT);

        BigDecimal loyaltyDiscount = calculateLoyaltyDiscount(client.getTier(), subtotalHT);

        BigDecimal promoDiscount = BigDecimal.ZERO;
        if (order.getPromoCode() != null && !order.getPromoCode().isEmpty()) {
            promoDiscount = MoneyUtil.calculatePercentage(subtotalHT, 5.0);
        }

        BigDecimal totalDiscount = loyaltyDiscount.add(promoDiscount);
        totalDiscount = MoneyUtil.round(totalDiscount);

        BigDecimal amountHTAfterDiscount = subtotalHT.subtract(totalDiscount);
        amountHTAfterDiscount = MoneyUtil.round(amountHTAfterDiscount);

        BigDecimal vat = MoneyUtil.calculatePercentage(amountHTAfterDiscount, vatRate.multiply(new BigDecimal("100")).doubleValue());

        BigDecimal totalTTC = amountHTAfterDiscount.add(vat);
        totalTTC = MoneyUtil.round(totalTTC);

        order.setClient(client);
        order.setSubTotal(subtotalHT);
        order.setDiscountAmount(totalDiscount);
        order.setTaxAmount(vat);
        order.setTotalTTC(totalTTC);
        order.setStatus(OrderStatus.PENDING);

        return orderRepository.save(order);
    }

    private BigDecimal calculateLoyaltyDiscount(CustomerTier tier, BigDecimal subtotal) {
        if (tier == null || subtotal == null) {
            return BigDecimal.ZERO;
        }

        return switch (tier) {
            case SILVER -> {
                if (subtotal.compareTo(new BigDecimal("500")) >= 0) {
                    yield MoneyUtil.calculatePercentage(subtotal, 5.0);
                }
                yield BigDecimal.ZERO;
            }
            case GOLD -> {
                if (subtotal.compareTo(new BigDecimal("800")) >= 0) {
                    yield MoneyUtil.calculatePercentage(subtotal, 10.0);
                }
                yield BigDecimal.ZERO;
            }
            case PLATINUM -> {
                if (subtotal.compareTo(new BigDecimal("1200")) >= 0) {
                    yield MoneyUtil.calculatePercentage(subtotal, 15.0);
                }
                yield BigDecimal.ZERO;
            }
            default -> BigDecimal.ZERO;
        };
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
        return orderRepository.findByClientId(clientId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrder(Long orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public Order updateOrder(Order order) {
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

        if (newStatus == OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.CONFIRMED) {
            return confirmOrder(orderId);
        }

        if (order.getStatus() == OrderStatus.CONFIRMED ||
            order.getStatus() == OrderStatus.REJECTED ||
            order.getStatus() == OrderStatus.CANCELED) {
            throw new BusinessException(
                "Cannot modify order with final status: " + order.getStatus(),
                HttpStatus.valueOf(422)
            );
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    private Order confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", HttpStatus.NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(
                "Only PENDING orders can be confirmed. Current status: " + order.getStatus(),
                HttpStatus.valueOf(422)
            );
        }

        if (!order.isFullyPaid()) {
            throw new BusinessException(
                "Order cannot be confirmed until fully paid. Remaining: " + order.getRemainingBalance(),
                HttpStatus.valueOf(422)
            );
        }

        // Validate stock availability at confirmation time (not at creation)
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

            // If stock insufficient, REJECT the order instead of confirming
            if (product.getStockQuantity() < item.getQuantity()) {
                order.setStatus(OrderStatus.REJECTED);
                return orderRepository.save(order);
            }
        }

        // Stock is sufficient, proceed with confirmation and decrement stock
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

            product.decrementStock(item.getQuantity());
            productRepository.save(product);
        }

        Client client = order.getClient();
        client.updateStats(order.getTotalTTC());
        clientRepository.save(client);

        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

    @Override
    public Order cancelOrder(Long orderId, Long clientId) {
        Order order = getOrderForClient(orderId, clientId)
                .orElseThrow(() -> new BusinessException(
                        "Order not found or you don't have permission to cancel this order",
                        HttpStatus.FORBIDDEN
                ));

        if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.CANCELED) {
            throw new BusinessException(
                    "Cannot cancel order with status: " + order.getStatus(),
                    HttpStatus.BAD_REQUEST
            );
        }

        order.setStatus(OrderStatus.CANCELED);
        return orderRepository.save(order);
    }
}
