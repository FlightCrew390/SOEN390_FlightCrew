package com.soen390.flightcrew;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "external.api.url=http://mock-api.com",
        "external.api.user=testUser",
        "external.api.key=testKey",
        "google.api.key=testGoogleKey"
})
class BackendTests {

    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully with the
        // provided properties. If there are any issues with the configuration or bean
        // initialization, this test will fail.
    }

}
