package com.microtech.microtechsmartmgmt.dto.request;

import com.microtech.microtechsmartmgmt.enums.UserRole;
import jakarta.validation.constraints.NotBlank;

public record CreateClientRequest(
        @NotBlank(message = "Username must not be blank") String username,
        @NotBlank(message = "Password cannot be null") String password,
        @NotBlank(message = "Full name cannot be null") String fullName,
        @NotBlank(message = "Choose a valid role!") UserRole role

        ) {
}