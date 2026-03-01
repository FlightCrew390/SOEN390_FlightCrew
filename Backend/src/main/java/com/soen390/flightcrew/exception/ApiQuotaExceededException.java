package com.soen390.flightcrew.exception;

public class ApiQuotaExceededException extends RuntimeException {
    public ApiQuotaExceededException(String message) {
        super(message);
    }
}
