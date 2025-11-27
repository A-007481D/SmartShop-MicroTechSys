package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.dto.request.AddPaymentRequest;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.entity.Payment;
import com.microtech.microtechsmartmgmt.enums.PaymentStatus;
import com.microtech.microtechsmartmgmt.enums.PaymentType;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
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
                .orElseThrow(() -> new BusinessException("Order not found", HttpStatus.NOT_FOUND));

        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero", HttpStatus.BAD_REQUEST);
        }

        if (request.paymentType() == PaymentType.CASH && request.amount().compareTo(CASH_LIMIT) > 0) {
            throw new BusinessException(
                "Cash payment cannot exceed " + CASH_LIMIT + " DH (Article 193 CGI)",
                HttpStatus.valueOf(422)
            );
        }

        BigDecimal remainingBalance = order.getRemainingBalance();
        if (request.amount().compareTo(remainingBalance) > 0) {
            throw new BusinessException(
                "Payment amount (" + request.amount() + ") exceeds remaining balance (" + remainingBalance + ")",
                HttpStatus.valueOf(422)
            );
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(request.amount())
                .paymentType(request.paymentType())
                .reference(request.reference())
                .bankName(request.bankName())
                .paymentDate(LocalDate.now())
                .status(determineInitialStatus(request.paymentType()))
                .build();

        payment = paymentRepository.save(payment);

        order.addPayment(payment);
        orderRepository.save(order);

        return payment;
    }

    private PaymentStatus determineInitialStatus(PaymentType paymentType) {
        // Cash payments are immediately completed
        if (paymentType == PaymentType.CASH) {
            return PaymentStatus.COMPLETED;
        }
        // Cheques and wire transfers start as pending
        return PaymentStatus.PENDING;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsForOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new BusinessException("Order not found", HttpStatus.NOT_FOUND);
        }
        return paymentRepository.findByOrderId(orderId);
    }

    @Override
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus newStatus) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException("Payment not found", HttpStatus.NOT_FOUND));

        // Validate status transition
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new BusinessException(
                "Cannot modify completed payment",
                HttpStatus.valueOf(422)
            );
        }

        payment.setStatus(newStatus);
        return paymentRepository.save(payment);
    }
}

