package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.dto.request.CreateClientRequest;
import com.microtech.microtechsmartmgmt.dto.request.LoginRequest;
import com.microtech.microtechsmartmgmt.dto.response.AuthResponse;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import com.microtech.microtechsmartmgmt.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        return ResponseEntity.ok(authService.login(request, session));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register/client")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<AuthResponse> registerClient(@Valid @RequestBody CreateClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
}
