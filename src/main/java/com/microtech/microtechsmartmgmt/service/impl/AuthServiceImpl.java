package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.dto.request.LoginRequest;
import com.microtech.microtechsmartmgmt.dto.request.CreateClientRequest;
import com.microtech.microtechsmartmgmt.dto.response.AuthResponse;
import com.microtech.microtechsmartmgmt.entity.User;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.repository.UserRepository;
import com.microtech.microtechsmartmgmt.security.SessionUtils;
import com.microtech.microtechsmartmgmt.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    @Override
    public AuthResponse login(LoginRequest request, HttpSession session) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException("Invalid username or password", HttpStatus.UNAUTHORIZED));

        if (!user.getPassword().equals(request.password())) {
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
            throw new BusinessException("User name already exists", HttpStatus.BAD_REQUEST);

        }

        User newClient = new  User();
        newClient.setUsername(request.username());
        newClient.setPassword(request.password());
        newClient.setRole(request.role());

        User savedUser = userRepository.save(newClient);

        return new AuthResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getRole(),
                "Client registered successfully");
    }
}