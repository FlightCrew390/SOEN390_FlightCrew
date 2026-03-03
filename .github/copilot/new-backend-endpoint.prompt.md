---
agent: "agent"
description: "Add a new Spring Boot API endpoint to the ConcordiaNav backend following all project conventions."
---

Add a new API endpoint to the ConcordiaNav Spring Boot 4 backend. Follow every rule below exactly.

## Package structure

```
com.soen390.flightcrew/
├── controller/   — @RestController classes
├── model/        — @Data Lombok DTOs
└── service/      — @Service classes
```

## 1. Model (DTO)

Create request and/or response POJOs using Lombok + Jackson:

```java
package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MyFeatureResponse {

    @JsonProperty("field_name")
    private String fieldName;

    @JsonProperty("count")
    private int count;
}
```

- Use `@JsonProperty("snake_case_key")` for every field to match the JSON contract.
- Never hard-code values; populate from the service layer.

## 2. Service

```java
package com.soen390.flightcrew.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MyFeatureService {

    private static final Logger logger = LoggerFactory.getLogger(MyFeatureService.class);

    private final RestTemplate restTemplate;
    private final ApiQuotaService apiQuotaService;
    private final String apiKey;

    // Constructor injection — never @Autowired on fields
    public MyFeatureService(
            RestTemplate restTemplate,
            ApiQuotaService apiQuotaService,
            @Value("${google.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiQuotaService = apiQuotaService;
        this.apiKey = apiKey;
    }

    @Cacheable(value = "myFeatureCache", key = "#param")
    public MyFeatureResponse fetchData(String param) {
        apiQuotaService.checkQuota(); // MUST call before any outbound Google Maps request
        logger.info("Fetching data for param: {}", param);
        // ... RestTemplate call ...
        return response;
    }
}
```

### Service rules

- **Constructor injection only** — never `@Autowired` on fields.
- **No service interfaces** — controllers inject the concrete `@Service` class directly.
- Always call `apiQuotaService.checkQuota()` before any outbound Google Maps API call.
- Use `@Cacheable(value = "cacheName", key = "#spel")` on methods that call external APIs.
- Logger: `private static final Logger logger = LoggerFactory.getLogger(ClassName.class);`
- Use `@Value("${property.name}")` constructor parameters for secrets/config values.
- Use **Jakarta EE 10** imports (`jakarta.*`) — never `javax.*`.

## 3. Controller

```java
package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.MyFeatureResponse;
import com.soen390.flightcrew.service.MyFeatureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MyFeatureController {

    private static final Logger logger = LoggerFactory.getLogger(MyFeatureController.class);

    private final MyFeatureService myFeatureService;

    public MyFeatureController(MyFeatureService myFeatureService) {
        this.myFeatureService = myFeatureService;
    }

    @GetMapping("/my-feature")
    public ResponseEntity<MyFeatureResponse> getMyFeature(
            @RequestParam String param) {
        logger.info("GET /api/my-feature param={}", param);
        MyFeatureResponse response = myFeatureService.fetchData(param);
        return ResponseEntity.ok(response);
    }
}
```

### Controller rules

- `@RequestMapping("/api")` on the class, method-level mappings for each action.
- Return `ResponseEntity<T>` — never return raw objects.
- Constructor injection; no field injection.
- Log at `INFO` for each incoming request.

## 4. Test

Create a JUnit 5 + Mockito test under `backend/src/test/java/com/soen390/flightcrew/`:

```java
@ExtendWith(MockitoExtension.class)
class MyFeatureControllerTest {

    @Mock
    private MyFeatureService myFeatureService;

    @InjectMocks
    private MyFeatureController controller;

    @Test
    void getMyFeature_returnsOk() {
        MyFeatureResponse expected = new MyFeatureResponse();
        when(myFeatureService.fetchData("test")).thenReturn(expected);

        ResponseEntity<MyFeatureResponse> result = controller.getMyFeature("test");

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(expected, result.getBody());
    }
}
```

- JaCoCo requires **≥ 80% line and branch coverage**; test happy path + error branches.
- Use `@ExtendWith(MockitoExtension.class)` — not `@SpringBootTest` unless integration testing is needed.

## After generating

1. Confirm the endpoint path is registered in `WebConfig.java` CORS config if needed.
2. Remind me to add the new cache name to `application.yml` if using `@Cacheable`.
3. Verify the `ApiQuotaService` call is present for any Google Maps outbound calls.
