package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.entity.Payment;
import com.microtech.microtechsmartmgmt.dto.request.AddPaymentRequest;

import java.util.List;

public interface PaymentService {

    Payment addPayment(Long orderId, AddPaymentRequest request);

    List<Payment> getPaymentsForOrder(Long orderId);

    Payment updatePaymentStatus(Long paymentId, com.microtech.microtechsmartmgmt.enums.PaymentStatus newStatus);
}

