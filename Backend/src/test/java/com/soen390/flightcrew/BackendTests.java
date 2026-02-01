package com.soen390.flightcrew;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "external.api.url=http://mock-api.com",
        "external.api.user=testUser",
        "external.api.key=testKey"
})
class BackendTests {

    @Test
    void contextLoads() {
    }

}
