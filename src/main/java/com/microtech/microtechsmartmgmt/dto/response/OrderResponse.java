package com.microtech.microtechsmartmgmt.dto.response;

import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private OrderStatus status;
    private String promoCode;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalTTC;
    private BigDecimal remainingBalance;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}

