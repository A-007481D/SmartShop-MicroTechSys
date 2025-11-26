package com.microtech.microtechsmartmgmt.entity;

import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    private String promoCode;

    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalTTC;


    public BigDecimal getRemainingBalance() {
        if (totalTTC == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal paid = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalTTC.subtract(paid);
    }

    public boolean isFullyPaid() {
        return getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0;
    }

    public void addPayment(Payment payment) {
        payment.setOrder(this);
        this.payments.add(payment);
    }
}