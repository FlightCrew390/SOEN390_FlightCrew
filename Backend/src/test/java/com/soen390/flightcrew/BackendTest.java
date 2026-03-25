package com.soen390.flightcrew;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "external.api.url=http://mock-api.com",
        "external.api.user=testUser",
        "external.api.key=testKey",
        "google.api.key=testGoogleKey",
        "google.client-id=test-id",
        "google.client-secret=test-secret",
})
class BackendTest {

    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully
    }

    @Test
    void restTemplateBeanReturnsInstance() {
        Backend backend = new Backend();
        RestTemplate restTemplate = backend.restTemplate();
        assertNotNull(restTemplate);
        assertInstanceOf(RestTemplate.class, restTemplate);
    }

    @Test
    void objectMapperBeanReturnsInstance() {
        Backend backend = new Backend();
        ObjectMapper objectMapper = backend.objectMapper();
        assertNotNull(objectMapper);
        assertInstanceOf(ObjectMapper.class, objectMapper);
    }

    @Test
    void mainStartsApplication() {
        try (org.mockito.MockedStatic<org.springframework.boot.SpringApplication> mocked = org.mockito.Mockito
                .mockStatic(org.springframework.boot.SpringApplication.class)) {
            mocked.when(() -> org.springframework.boot.SpringApplication.run(Backend.class, new String[] {}))
                    .thenReturn(null);

            Backend.main(new String[] {});

            mocked.verify(() -> org.springframework.boot.SpringApplication.run(Backend.class, new String[] {}));
        }
    }
}
