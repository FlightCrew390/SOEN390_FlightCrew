package com.soen390.flightcrew.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiQuotaExceededExceptionTest {
    @Test
    @DisplayName("Exception is a RuntimeException")
    void isRuntimeException() {
        ApiQuotaExceededException ex = new ApiQuotaExceededException("test");

        assertInstanceOf(RuntimeException.class, ex);
    }

    @Test
    @DisplayName("Exception can be thrown and caught")
    void canBeThrown() {
        assertThrows(ApiQuotaExceededException.class, () -> {
            throw new ApiQuotaExceededException("test");
        });
    }
}
