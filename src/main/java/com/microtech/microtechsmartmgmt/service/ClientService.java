package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.dto.request.CreateClientRequest;
import com.microtech.microtechsmartmgmt.dto.request.UpdateClientRequest;
import com.microtech.microtechsmartmgmt.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientService {

    // clients self-ops
    Client getClientProfile(Long userId);

    // admin ops
    Page<Client> getAllClients(Pageable pageable);
    Client getClientById(Long clientId);
    Client createClient(CreateClientRequest request);
    Client updateClient(Long clientId, UpdateClientRequest request);
    void deleteClient(Long clientId);
}

