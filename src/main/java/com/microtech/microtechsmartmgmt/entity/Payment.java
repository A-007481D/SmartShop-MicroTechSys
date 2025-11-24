package com.microtech.microtechsmartmgmt.entity;

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
    private Order order;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    private BigDecimal amount;
    private String reference;
    private LocalDate paymentDate;
    private LocalDate clearingDate;

}