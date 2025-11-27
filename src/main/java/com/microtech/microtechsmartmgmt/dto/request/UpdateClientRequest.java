package com.microtech.microtechsmartmgmt.dto.request;

import jakarta.validation.constraints.Email;

public record UpdateClientRequest(
        String fullName,

        @Email(message = "Invalid email format")
        String email
) {
}

