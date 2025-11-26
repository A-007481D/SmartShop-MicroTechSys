package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;

import java.util.List;

public interface ClientService {

    Client getClientProfile(Long userId);
    List<Order> getClientOrders(Long userId);
    Order getClientOrder(Long userId, Long orderId);
}

