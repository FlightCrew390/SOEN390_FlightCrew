package com.soen390.flightcrew.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Quota exceeded returns HTTP 429")
    void handleQuotaExceeded_returns429Status() {
        ApiQuotaExceededException ex = new ApiQuotaExceededException("Quota exhausted");

        ResponseEntity<Map<String, String>> response = handler.handleQuotaExceeded(ex);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.getStatusCode());
    }

    @Test
    @DisplayName("Response body contains the exception message")
    void handleQuotaExceeded_bodyContainsMessage() {
        String message = "Google API quota exceeded. Try again later.";
        ApiQuotaExceededException ex = new ApiQuotaExceededException(message);

        ResponseEntity<Map<String, String>> response = handler.handleQuotaExceeded(ex);

        assertNotNull(response.getBody());
        assertEquals(message, response.getBody().get("message"));
    }

    @Test
    @DisplayName("Response body contains exactly two keys")
    void handleQuotaExceeded_bodyHasExactlyTwoKeys() {
        ApiQuotaExceededException ex = new ApiQuotaExceededException("test");

        ResponseEntity<Map<String, String>> response = handler.handleQuotaExceeded(ex);

        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertTrue(response.getBody().containsKey("error"));
        assertTrue(response.getBody().containsKey("message"));
    }
}
