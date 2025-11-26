package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {


    @GetMapping("/dashboard")
    @RequireRole({UserRole.ADMIN})
    public ResponseEntity<Map<String, String>> getAdminDashboard() {
        return ResponseEntity.ok(Map.of(
            "message", "Welcome to Admin Dashboard",
            "role", "ADMIN",
            "access", "Full system access"
        ));
    }

    @GetMapping("/users")
    @RequireRole({UserRole.ADMIN})
    public ResponseEntity<Map<String, String>> getAllUsers() {
        return ResponseEntity.ok(Map.of(
            "message", "All users data",
            "access", "Admin only"
        ));
    }


    @PostMapping("/settings")
    @RequireRole({UserRole.ADMIN})
    public ResponseEntity<Map<String, String>> updateSystemSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(Map.of(
            "message", "System settings updated",
            "status", "success"
        ));
    }
}
