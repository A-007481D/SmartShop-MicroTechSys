package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    @Override
    public Client getClientProfile(Long userId) {
        return clientRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Client not found", HttpStatus.NOT_FOUND));
    }

    @Override
    public List<Order> getClientOrders(Long userId) {
        Client client = getClientProfile(userId);
        return client.getOrders();
    }

    @Override
    public Order getClientOrder(Long userId, Long orderId) {
        Client client = getClientProfile(userId);
        
        return client.getOrders().stream()
                .filter(order -> order.getId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        "Order not found or you don't have access to this order", 
                        HttpStatus.FORBIDDEN
                ));
    }
}

