package com.microtech.microtechsmartmgmt.service.impl;

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
    private double vatRate;

    @Override
    public Order createOrder(Order order) {
        // 1. Validate client exists
        Client client = clientRepository.findById(order.getClient().getId())
                .orElseThrow(() -> new BusinessException("Client not found", HttpStatus.NOT_FOUND));

        // 2. Validate items are not empty
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new BusinessException("Order must contain at least one item", HttpStatus.BAD_REQUEST);
        }

        // 3. Validate stock availability for all products
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new BusinessException("Product not found: " + item.getProduct().getId(), HttpStatus.NOT_FOUND));

            if (product.getStockQuantity() < item.getQuantity()) {
                // Auto-reject order due to insufficient stock
                order.setClient(client);
                order.setStatus(OrderStatus.REJECTED);
                order.setSubTotal(BigDecimal.ZERO);
                order.setDiscountAmount(BigDecimal.ZERO);
                order.setTaxAmount(BigDecimal.ZERO);
                order.setTotalTTC(BigDecimal.ZERO);
                return orderRepository.save(order);
            }

            // Set product reference and unit price for each item
            item.setProduct(product);
            item.setUnitPrice(product.getPrice());
            item.setOrder(order);
        }

        // 4. Calculate subtotal (HT)
        BigDecimal subtotalHT = order.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        subtotalHT = MoneyUtil.round(subtotalHT);

        // 5. Calculate loyalty discount based on client tier
        BigDecimal loyaltyDiscount = calculateLoyaltyDiscount(client.getTier(), subtotalHT);

        // 6. Calculate promo code discount (5% if valid)
        BigDecimal promoDiscount = BigDecimal.ZERO;
        if (order.getPromoCode() != null && !order.getPromoCode().isEmpty()) {
            promoDiscount = MoneyUtil.calculatePercentage(subtotalHT, 5.0);
        }

        // 7. Total discount (cumulative: loyalty + promo)
        BigDecimal totalDiscount = loyaltyDiscount.add(promoDiscount);
        totalDiscount = MoneyUtil.round(totalDiscount);

        // 8. Amount HT after discount
        BigDecimal amountHTAfterDiscount = subtotalHT.subtract(totalDiscount);
        amountHTAfterDiscount = MoneyUtil.round(amountHTAfterDiscount);

        // 9. Calculate VAT (20% on amount after discount)
        BigDecimal vat = MoneyUtil.calculatePercentage(amountHTAfterDiscount, vatRate * 100);

        // 10. Total TTC
        BigDecimal totalTTC = amountHTAfterDiscount.add(vat);
        totalTTC = MoneyUtil.round(totalTTC);

        // 11. Set order financial details
        order.setClient(client);
        order.setSubTotal(subtotalHT);
        order.setDiscountAmount(totalDiscount);
        order.setTaxAmount(vat);
        order.setTotalTTC(totalTTC);
        order.setStatus(OrderStatus.PENDING);

        // 12. Save order (stats update happens only on CONFIRMED, not here)
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

        // If transitioning to CONFIRMED, perform confirmation logic
        if (newStatus == OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.CONFIRMED) {
            return confirmOrder(orderId);
        }

        // Validate status transitions
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

        // Validate order is in PENDING status
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(
                "Only PENDING orders can be confirmed. Current status: " + order.getStatus(),
                HttpStatus.valueOf(422)
            );
        }

        // Validate order is fully paid
        if (!order.isFullyPaid()) {
            throw new BusinessException(
                "Order cannot be confirmed until fully paid. Remaining: " + order.getRemainingBalance(),
                HttpStatus.valueOf(422)
            );
        }

        // Decrement stock for all products
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

            try {
                product.decrementStock(item.getQuantity());
                productRepository.save(product);
            } catch (RuntimeException e) {
                throw new BusinessException(
                    "Insufficient stock for product: " + product.getName(),
                    HttpStatus.valueOf(422)
                );
            }
        }

        // Update client statistics and tier
        Client client = order.getClient();
        client.updateStats(order.getTotalTTC());
        clientRepository.save(client);

        // Set status to CONFIRMED
        order.setStatus(OrderStatus.CONFIRMED);
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
