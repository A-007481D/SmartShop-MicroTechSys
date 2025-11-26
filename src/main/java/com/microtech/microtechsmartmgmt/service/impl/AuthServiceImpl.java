package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.dto.request.LoginRequest;
import com.microtech.microtechsmartmgmt.dto.request.CreateClientRequest;
import com.microtech.microtechsmartmgmt.dto.response.AuthResponse;
import com.microtech.microtechsmartmgmt.entity.Client;
import com.microtech.microtechsmartmgmt.entity.User;
import com.microtech.microtechsmartmgmt.enums.CustomerTier;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.repository.ClientRepository;
import com.microtech.microtechsmartmgmt.repository.UserRepository;
import com.microtech.microtechsmartmgmt.security.SessionUtils;
import com.microtech.microtechsmartmgmt.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request, HttpSession session) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException("Invalid username or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        SessionUtils.setUser(session, user);
        return new AuthResponse(user.getId(), user.getUsername(), user.getRole(), "Login successful");
    }

    @Override
    public void logout(HttpSession session) {
        session.invalidate();
    }

    @Override
    public AuthResponse register(CreateClientRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new BusinessException("Username already exists", HttpStatus.BAD_REQUEST);
        }

        if (request.role() != UserRole.CLIENT) {
            throw new BusinessException("Only CLIENT role can be registered through this endpoint", HttpStatus.BAD_REQUEST);
        }

        Client newClient = Client.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .name(request.fullName())
                .role(UserRole.CLIENT)
                .fullName(request.fullName())
                .tier(CustomerTier.BASIC)
                .totalOrders(0)
                .totalSpent(BigDecimal.ZERO)
                .build();

        Client savedClient = clientRepository.save(newClient);

        return new AuthResponse(
                savedClient.getId(),
                savedClient.getUsername(),
                savedClient.getRole(),
                "Client registered successfully"
        );
    }
}
