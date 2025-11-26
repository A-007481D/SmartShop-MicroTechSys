package com.microtech.microtechsmartmgmt.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record CreateOrderRequest(
        @NotNull(message = "Client ID is required")
        Long clientId,

        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        List<OrderItemRequest> items,

        @Pattern(regexp = "PROMO-[A-Z0-9]{4}", message = "Promo code must follow format: PROMO-XXXX")
        String promoCode
) {
}

