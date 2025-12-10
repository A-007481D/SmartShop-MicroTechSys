package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.dto.request.CreateOrderRequest;
import com.microtech.microtechsmartmgmt.dto.request.OrderItemRequest;
import com.microtech.microtechsmartmgmt.entity.*;
import com.microtech.microtechsmartmgmt.enums.CustomerTier;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.enums.PaymentStatus;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.repository.OrderRepository;
import com.microtech.microtechsmartmgmt.repository.ProductRepository;
import com.microtech.microtechsmartmgmt.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

        @Mock
        private OrderRepository orderRepository;
        @Mock
        private ClientRepository clientRepository;
        @Mock
        private ProductRepository productRepository;

        @InjectMocks
        private OrderServiceImpl orderService;

        @BeforeEach
        void setUp() {
                ReflectionTestUtils.setField(orderService, "vatRate", new BigDecimal("0.20"));
        }

        @Test
        void createOrder_ShouldCalculateTotalsCorrectly_ForSilverClient() {
                Client client = Client.builder()
                                .id(1L)
                                .tier(CustomerTier.SILVER)
                                .build();

                Product product = Product.builder()
                                .id(1L)
                                .price(new BigDecimal("1000.00"))
                                .stockQuantity(10)
                                .build();

                CreateOrderRequest request = new CreateOrderRequest(
                                1L,
                                List.of(new OrderItemRequest(1L, 1)),
                                null);

                when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
                when(productRepository.findById(1L)).thenReturn(Optional.of(product));
                when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

                Order result = orderService.createOrder(request);

                assertEquals(new BigDecimal("1000.00"), result.getSubTotal());
                assertEquals(new BigDecimal("50.00"), result.getDiscountAmount());
                assertEquals(new BigDecimal("190.00"), result.getTaxAmount());
                assertEquals(new BigDecimal("1140.00"), result.getTotalTTC());
        }

        @Test
        void confirmOrder_ShouldDecrementStock_AndUpgradeClientStats() {
                Client client = Client.builder()
                                .id(1L)
                                .tier(CustomerTier.BASIC)
                                .totalOrders(0)
                                .totalSpent(BigDecimal.ZERO)
                                .build();

                Product product = Product.builder()
                                .id(1L)
                                .price(new BigDecimal("1000.00"))
                                .stockQuantity(10)
                                .build();

                Order order = Order.builder()
                                .id(1L)
                                .client(client)
                                .status(OrderStatus.PENDING)
                                .totalTTC(new BigDecimal("1200.00"))
                                .items(List.of(OrderItem.builder()
                                                                .product(product)
                                                                .quantity(2)
                                                                .build()))
                                .build();

                Payment payment = Payment
                                .builder()
                                .amount(new BigDecimal("1200.00"))
                                .status(PaymentStatus.COMPLETED)
                                .order(order)
                                .build();
                order.getPayments().add(payment);

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(productRepository.findById(1L)).thenReturn(Optional.of(product));
                when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

                Order result = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

                assertEquals(OrderStatus.CONFIRMED, result.getStatus());
                assertEquals(8, product.getStockQuantity());
                assertEquals(1, client.getTotalOrders());
                assertEquals(new BigDecimal("1200.00"), client.getTotalSpent());
        }
}
