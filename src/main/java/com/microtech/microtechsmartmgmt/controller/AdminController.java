package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.dto.request.CreateClientRequest;
import com.microtech.microtechsmartmgmt.dto.request.UpdateClientRequest;
import com.microtech.microtechsmartmgmt.dto.response.ClientResponse;
import com.microtech.microtechsmartmgmt.dto.response.OrderResponse;
import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.mapper.ClientMapper;
import com.microtech.microtechsmartmgmt.mapper.OrderMapper;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import com.microtech.microtechsmartmgmt.service.ClientService;
import com.microtech.microtechsmartmgmt.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ClientService clientService;
    private final OrderService orderService;
    private final ClientMapper clientMapper;
    private final OrderMapper orderMapper;

    @GetMapping("/clients")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Page<ClientResponse>> getAllClients(Pageable pageable) {
        Page<ClientResponse> clients = clientService.getAllClients(pageable)
                .map(clientMapper::toResponse);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/clients/{clientId}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<ClientResponse> getClientById(@PathVariable Long clientId) {
        Client client = clientService.getClientById(clientId);
        return ResponseEntity.ok(clientMapper.toResponse(client));
    }

    @PostMapping("/clients")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody CreateClientRequest request) {
        Client client = clientService.createClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(clientMapper.toResponse(client));
    }

    @PutMapping("/clients/{clientId}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable Long clientId,
            @Valid @RequestBody UpdateClientRequest request) {
        Client updated = clientService.updateClient(clientId, request);
        return ResponseEntity.ok(clientMapper.toResponse(updated));
    }

    @DeleteMapping("/clients/{clientId}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Void> deleteClient(@PathVariable Long clientId) {
        clientService.deleteClient(clientId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/clients/{clientId}/orders")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<List<OrderResponse>> getClientOrders(@PathVariable Long clientId) {
        List<OrderResponse> orders = orderService.getOrdersForClient(clientId).stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrdersForAdmin().stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/orders/{orderId}/status")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        OrderResponse order = orderMapper.toResponse(
                orderService.updateOrderStatus(orderId, status)
        );
        return ResponseEntity.ok(order);
    }
}
