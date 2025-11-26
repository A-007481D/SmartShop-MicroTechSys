package com.microtech.microtechsmartmgmt.repository;

import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByClient(Client client);
    List<Order> findByClientId(Long clientId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByClientIdAndStatus(Long clientId, OrderStatus status);
    // deleted by id is inherited from jparepo
}
