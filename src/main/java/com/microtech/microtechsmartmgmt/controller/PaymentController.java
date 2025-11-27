package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.dto.request.AddPaymentRequest;
import com.microtech.microtechsmartmgmt.entity.Payment;
import com.microtech.microtechsmartmgmt.enums.PaymentStatus;
import com.microtech.microtechsmartmgmt.service.PaymentService;
import com.microtech.microtechsmartmgmt.security.SessionUtils;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/{orderId}")
    public ResponseEntity<Payment> addPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody AddPaymentRequest request,
            HttpSession session) {
        SessionUtils.requireAdmin(session);
        Payment payment = paymentService.addPayment(orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<List<Payment>> getPaymentsForOrder(
            @PathVariable Long orderId,
            HttpSession session) {
        SessionUtils.requireAdmin(session);
        List<Payment> payments = paymentService.getPaymentsForOrder(orderId);
        return ResponseEntity.ok(payments);
    }

    @PatchMapping("/{paymentId}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam PaymentStatus status,
            HttpSession session) {
        SessionUtils.requireAdmin(session);
        Payment payment = paymentService.updatePaymentStatus(paymentId, status);
        return ResponseEntity.ok(payment);
    }
}

