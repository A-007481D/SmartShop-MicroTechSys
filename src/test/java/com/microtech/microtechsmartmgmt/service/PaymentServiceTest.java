package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.dto.request.AddPaymentRequest;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.entity.Payment;
import com.microtech.microtechsmartmgmt.enums.PaymentStatus;
import com.microtech.microtechsmartmgmt.enums.PaymentType;
import com.microtech.microtechsmartmgmt.exception.BusinessRuleViolationException;
import com.microtech.microtechsmartmgmt.repository.OrderRepository;
import com.microtech.microtechsmartmgmt.repository.PaymentRepository;
import com.microtech.microtechsmartmgmt.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Test
    void addPayment_ShouldFail_WhenAmountExceedsBalance() {
        Order order = Order.builder()
                .id(1L)
                .totalTTC(new BigDecimal("1000.00"))
                .payments(new ArrayList<>())
                .build();

        AddPaymentRequest request = new AddPaymentRequest(
                new BigDecimal("1500.00"), // Exceeds 1000
                PaymentType.CASH,
                "REF-001",
                LocalDate.now(),
                null,
                null);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // 2A's
        assertThrows(BusinessRuleViolationException.class, () -> paymentService.addPayment(1L, request));
    }

    @Test
    void addPayment_ShouldSucceed_WhenValid() {

        Order order = Order.builder()
                .id(1L)
                .totalTTC(new BigDecimal("1000.00"))
                .payments(new ArrayList<>())
                .build();
        AddPaymentRequest request = new AddPaymentRequest(
                new BigDecimal("500.00"),
                PaymentType.CASH,
                "REF-001",
                LocalDate.now(),
                null,
                null);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        Payment result = paymentService.addPayment(1L, request);

        assertNotNull(result);
        assertEquals(new BigDecimal("500.00"), result.getAmount());
        assertEquals(PaymentStatus.COMPLETED, result.getStatus());
    }
}
