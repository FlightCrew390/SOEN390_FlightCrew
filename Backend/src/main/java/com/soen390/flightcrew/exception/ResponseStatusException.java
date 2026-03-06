package com.soen390.flightcrew.exception;

public class ResponseStatusException extends RuntimeException {
    private final int statusCode;

    public ResponseStatusException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
