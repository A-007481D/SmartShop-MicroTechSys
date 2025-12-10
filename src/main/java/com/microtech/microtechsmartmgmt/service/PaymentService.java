package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.dto.request.AddPaymentRequest;
import com.microtech.microtechsmartmgmt.entity.Payment;

import java.util.List;

public interface PaymentService {

    Payment addPayment(Long orderId, AddPaymentRequest request);

    List<Payment> getOrderPayments(Long orderId);

    Payment updatePaymentStatus(Long paymentId, String status);

    void refundPayments(Long orderId);
}
