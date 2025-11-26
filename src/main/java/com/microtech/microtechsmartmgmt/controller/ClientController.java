package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import com.microtech.microtechsmartmgmt.service.ClientService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping("/profile")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<Client> getMyProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Client profile = clientService.getClientProfile(userId);
        return ResponseEntity.ok(profile);
    }


    @GetMapping("/orders")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<List<Order>> getMyOrders(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        List<Order> orders = clientService.getClientOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{orderId}")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<Order> getMyOrder(
            HttpServletRequest request,
            @PathVariable Long orderId
    ) {
        Long userId = (Long) request.getAttribute("userId");
        Order order = clientService.getClientOrder(userId, orderId);
        return ResponseEntity.ok(order);
    }


}
