package com.microtech.microtechsmartmgmt.dto.request;

import com.microtech.microtechsmartmgmt.enums.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AddPaymentRequest(
        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        BigDecimal amount,

        @NotNull(message = "Payment type is required")
        PaymentType paymentType,

        String reference,

        LocalDate paymentDate,

        LocalDate clearingDate,

        String bankName
) {
}

