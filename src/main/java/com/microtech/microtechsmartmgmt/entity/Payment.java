package com.microtech.microtechsmartmgmt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.microtech.microtechsmartmgmt.enums.PaymentStatus;
import com.microtech.microtechsmartmgmt.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    private Integer paymentNumber; // sequential per order
    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    private BigDecimal amount;
    private String reference;
    private String bankName;
    private LocalDate paymentDate; // payment date
    private LocalDate clearingDate; // payment cleared
}