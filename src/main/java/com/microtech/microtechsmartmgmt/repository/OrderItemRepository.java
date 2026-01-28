package com.microtech.microtechsmartmgmt.repository;

import com.microtech.microtechsmartmgmt.entity.OrderItem;
import com.microtech.microtechsmartmgmt.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    boolean existsByProductId(Long productId);

    boolean existsByProduct(Product product);
}
