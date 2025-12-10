package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.enums.CustomerTier;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.service.impl.ClientServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientServiceImpl clientService;

    @Test
    void updateStats_ShouldUpgradeTier_ToSilver() {
        Client client = Client.builder()
                .id(1L)
                .tier(CustomerTier.BASIC)
                .totalOrders(2)
                .totalSpent(new BigDecimal("900.00"))
                .build();

        client.updateStats(new BigDecimal("200.00"));

        assertEquals(CustomerTier.SILVER, client.getTier());
    }

    @Test
    void updateStats_ShouldUpgradeTier_ToGold() {
        Client client = Client.builder()
                .id(1L)
                .tier(CustomerTier.SILVER)
                .totalOrders(9)
                .totalSpent(new BigDecimal("4000.00"))
                .build();

        client.updateStats(new BigDecimal("100.00"));

        assertEquals(CustomerTier.GOLD, client.getTier());
    }
}
