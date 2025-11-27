package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.dto.request.AddPaymentRequest;
import com.microtech.microtechsmartmgmt.entity.Payment;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import com.microtech.microtechsmartmgmt.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/{orderId}/payments")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Payment> addPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody AddPaymentRequest request) {
        Payment payment = paymentService.addPayment(orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/orders/{orderId}/payments")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<List<Payment>> getOrderPayments(@PathVariable Long orderId) {
        List<Payment> payments = paymentService.getOrderPayments(orderId);
        return ResponseEntity.ok(payments);
    }

    @PutMapping("/payments/{paymentId}/status")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam String status) {
        Payment updatedPayment = paymentService.updatePaymentStatus(paymentId, status);
        return ResponseEntity.ok(updatedPayment);
    }
}

