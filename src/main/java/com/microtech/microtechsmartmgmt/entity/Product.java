package com.microtech.microtechsmartmgmt.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product extends  BaseEntity {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private Integer stockQuantity;
    private boolean active;
    @Builder.Default
    private boolean deleted = false;

    public void  decrementStock(int quantity) {
        if (this.stockQuantity < quantity) {
            throw new RuntimeException("Insufficient stock for product" + this.name);
        }
        this.stockQuantity -= quantity;
    }

}
