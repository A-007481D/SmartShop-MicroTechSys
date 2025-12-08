package com.microtech.microtechsmartmgmt.entity;

import com.microtech.microtechsmartmgmt.enums.CustomerTier;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.context.annotation.Primary;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Getter
@Setter
@Table(name = "clients")
@Entity
@PrimaryKeyJoinColumn(name = "user_id")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Client extends User {

    private String fullName;
    private String email;

    private LocalDateTime firstOrderDate;
    private LocalDateTime lastOrderDate;

    @Enumerated(EnumType.STRING)
    private CustomerTier tier;

    @Builder.Default
    private int totalOrders = 0;

    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "client", fetch = FetchType.LAZY)
    private List<Order> orders;

    public void updateStats(BigDecimal orderAmount) {
        this.totalOrders++;
        this.totalSpent = this.totalSpent.add(orderAmount);
        recalculateTier();

    }

    private void recalculateTier() {
        if (totalOrders >= 20 || totalSpent.compareTo(new BigDecimal("15000")) >= 0) {
            this.tier = CustomerTier.PLATINUM;
        } else if (totalOrders >= 10 || totalSpent.compareTo(new BigDecimal("5000")) >= 0) {
            this.tier = CustomerTier.GOLD;
        } else if (totalOrders >= 3 || totalSpent.compareTo(new BigDecimal("1000")) >= 0) {
            this.tier = CustomerTier.SILVER;
        } else {
            this.tier = CustomerTier.BASIC;
        }
    }

}
