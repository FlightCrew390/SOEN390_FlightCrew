package com.soen390.flightcrew.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

class GoogleAuthServiceTest {

    private GoogleAuthService googleAuthService;

    @BeforeEach
    void setUp() {
        googleAuthService = new GoogleAuthService();
        
        ReflectionTestUtils.setField(googleAuthService, "clientId", "test-client-id");
        ReflectionTestUtils.setField(googleAuthService, "clientSecret", "test-client-secret");
    }

    @Test
    void testExchangeCodeForTokens_ThrowsExceptionOnInvalidCode() {
        // Since we can't easily mock the internal Google SDK 'new' call without advanced tools,
        // this test confirms that the service properly propagates IOExceptions 
        // when the network call fails (which it will, because the code is fake).
        
        String fakeCode = "invalid-code";

        assertThrows(IOException.class, () -> {
            googleAuthService.exchangeCodeForTokens(fakeCode);
        });
    }

    @Test
    void testValueInjection() {
        // Verifies that our Reflection utility correctly set the private fields
        String clientId = (String) ReflectionTestUtils.getField(googleAuthService, "clientId");
        assertEquals("test-client-id", clientId);
    }
}