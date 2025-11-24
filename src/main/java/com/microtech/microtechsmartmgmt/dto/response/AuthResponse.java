package com.microtech.microtechsmartmgmt.dto.response;

import com.microtech.microtechsmartmgmt.enums.UserRole;

public record AuthResponse(
        Long id,
        String email,
        UserRole role,
        String message
) {
}
