package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.dto.response.ClientResponse;
import com.microtech.microtechsmartmgmt.dto.response.OrderResponse;
import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.mapper.ClientMapper;
import com.microtech.microtechsmartmgmt.mapper.OrderMapper;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import com.microtech.microtechsmartmgmt.security.SessionUtils;
import com.microtech.microtechsmartmgmt.service.ClientService;
import com.microtech.microtechsmartmgmt.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final OrderService orderService;
    private final ClientMapper clientMapper;
    private final OrderMapper orderMapper;

    @GetMapping("/me")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<ClientResponse> getMyProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Client client = clientService.getClientProfile(userId);
        return ResponseEntity.ok(clientMapper.toResponse(client));
    }

    @GetMapping("/me/orders")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<List<OrderResponse>> getMyOrders(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        List<OrderResponse> orders = orderService.getOrdersForClient(userId).stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/me/orders/{orderId}")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<OrderResponse> getMyOrder(
            @PathVariable Long orderId,
            HttpServletRequest request) {
        Long clientId = (Long) request.getAttribute("userId");
        OrderResponse order = orderService.getOrderForClient(orderId, clientId)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));
        return ResponseEntity.ok(order);
    }
}
