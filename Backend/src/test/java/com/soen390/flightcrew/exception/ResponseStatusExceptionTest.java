package com.soen390.flightcrew.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResponseStatusExceptionTest {
    @Test
    void testConstructorAndGetters() {
        int statusCode = 404;
        String message = "Not Found";

        ResponseStatusException exception = new ResponseStatusException(statusCode, message);

        assertEquals(statusCode, exception.getStatusCode());
        assertEquals(message, exception.getMessage());
    }

}
