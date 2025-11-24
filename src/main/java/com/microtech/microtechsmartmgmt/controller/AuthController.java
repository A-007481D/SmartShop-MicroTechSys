package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.dto.request.LoginRequest;
import com.microtech.microtechsmartmgmt.dto.response.AuthResponse;
import com.microtech.microtechsmartmgmt.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
}
