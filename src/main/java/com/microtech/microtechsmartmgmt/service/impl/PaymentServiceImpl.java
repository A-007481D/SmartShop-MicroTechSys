package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.dto.request.AddPaymentRequest;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.entity.Payment;
import com.microtech.microtechsmartmgmt.enums.PaymentStatus;
import com.microtech.microtechsmartmgmt.enums.PaymentType;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.exception.BusinessRuleViolationException;
import com.microtech.microtechsmartmgmt.exception.ResourceNotFoundException;
import com.microtech.microtechsmartmgmt.repository.OrderRepository;
import com.microtech.microtechsmartmgmt.repository.PaymentRepository;
import com.microtech.microtechsmartmgmt.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    private static final BigDecimal CASH_LIMIT = new BigDecimal("20000");

    @Override
    public Payment addPayment(Long orderId, AddPaymentRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        BigDecimal remainingBalance = order.getRemainingBalance();
        if (request.amount().compareTo(remainingBalance) > 0) {
            throw new BusinessRuleViolationException(
                    "Payment amount (" + request.amount() + " DH) exceeds remaining balance (" +
                            remainingBalance + " DH)"
            );
        }

        if (request.paymentType() == PaymentType.CASH) {
            if (request.amount().compareTo(CASH_LIMIT) > 0) {
                throw new BusinessRuleViolationException(
                        "Cash payment cannot exceed 20,000 DH (legal limit). Amount: " +
                                request.amount() + " DH"
                );
            }
        }

        // calc next payment sequentially
        int nextPaymentNumber = order.getPayments().size() + 1;

        PaymentStatus status = determinePaymentStatus(request.paymentType());

        Payment payment = Payment.builder()
                .order(order)
                .paymentNumber(nextPaymentNumber)
                .amount(request.amount())
                .paymentType(request.paymentType())
                .status(status)
                .reference(request.reference())
                .bankName(request.bankName())
                .paymentDate(request.paymentDate() != null ? request.paymentDate() : LocalDate.now())
                .clearingDate(request.clearingDate())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        order.addPayment(savedPayment);
        orderRepository.save(order);

        return savedPayment;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getOrderPayments(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return order.getPayments();
    }

    @Override
    public Payment updatePaymentStatus(Long paymentId, String statusStr) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        try {
            PaymentStatus newStatus = PaymentStatus.valueOf(statusStr.toUpperCase());
            payment.setStatus(newStatus);

            if (newStatus == PaymentStatus.COMPLETED && payment.getClearingDate() == null) {
                payment.setClearingDate(LocalDate.now());
            }

            return paymentRepository.save(payment);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid payment status: " + statusStr, HttpStatus.BAD_REQUEST);
        }
    }

    private PaymentStatus determinePaymentStatus(PaymentType paymentType) {
        if (paymentType == PaymentType.CASH) {
            return PaymentStatus.COMPLETED;
        }
        return PaymentStatus.PENDING;
    }

}

