package com.microtech.microtechsmartmgmt.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends RuntimeException {

    public BusinessException(String message, HttpStatus status) {
        super(message);
    }
}
