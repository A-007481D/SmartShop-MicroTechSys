package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.dto.request.CreateClientRequest;
import com.microtech.microtechsmartmgmt.dto.request.UpdateClientRequest;
import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.Order;
import com.microtech.microtechsmartmgmt.enums.CustomerTier;
import com.microtech.microtechsmartmgmt.enums.OrderStatus;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.exception.ResourceNotFoundException;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Client getClientProfile(Long userId) {
        return clientRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
    }

    @Override
    public Page<Client> getAllClients(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }

    @Override
    public Client getClientById(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));
    }

    @Override
    @Transactional
    public Client createClient(CreateClientRequest request) {
        if (clientRepository.existsByUsername(request.username())) {
            throw new BusinessException("Username already exists", HttpStatus.BAD_REQUEST);
        }

        if (clientRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email already exists", HttpStatus.BAD_REQUEST);
        }

        Client client = Client.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .role(UserRole.CLIENT)
                .fullName(request.fullName())
                .email(request.email())
                .tier(CustomerTier.BASIC)
                .totalOrders(0)
                .turnover(BigDecimal.ZERO)
                .build();

        return clientRepository.save(client);
    }

    @Override
    @Transactional
    public Client updateClient(Long clientId, UpdateClientRequest request) {
        Client client = getClientById(clientId);

        if (request.fullName() != null) {
            client.setFullName(request.fullName());
        }
        if (request.email() != null) {
            clientRepository.findByEmail(request.email())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(clientId)) {
                            throw new BusinessException("Email already exists", HttpStatus.BAD_REQUEST);
                        }
                    });
            client.setEmail(request.email());
        }

        return clientRepository.save(client);
    }

    @Override
    @Transactional
    public void deleteClient(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client not found with id: " + clientId);
        }
        clientRepository.deleteById(clientId);
    }

    // Récupérer le client qui a passé le plus grand nombre de commandes dans le
    // système.
    // On ne compte que les commandes avec le statut VALIDATED.
    // On ne prend en compte que les clients actifs (active = true).
    // S’il n’y a aucune commande, on lève une BusinessException avec un message du
    // style :
    // "Aucune commande trouvée pour calculer le meilleur client."

    // group par client et compter les commandes validées

    public Client getBestClient(List<Order> commandes) {
        return commandes.stream()
                .filter(c -> c.getStatus() == OrderStatus.CONFIRMED)
                .filter(client -> client.getClient().isActive())
                .collect(Collectors.groupingBy(Order::getClient, Collectors.counting()))
                .entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey)
                .orElseThrow(() -> new BusinessException("Aucune commande trouvée pour calculer le meilleur client."));
    }

}
