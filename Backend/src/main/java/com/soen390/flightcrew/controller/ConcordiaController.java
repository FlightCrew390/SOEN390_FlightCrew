package com.soen390.flightcrew.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import com.soen390.flightcrew.model.Building;
import java.util.List;
import org.springframework.core.ParameterizedTypeReference;

@RestController
@RequestMapping("/api")
public class ConcordiaController {

    // There is no authentication for users calling our API yet.
    // TODO: Secure this endpoint if needed.

    @Value("${external.api.url}")
    private String apiUrl;

    @Value("${external.api.key}")
    private String apiKey;

    @Value("${external.api.user}")
    private String apiUser;

    private final RestTemplate restTemplate;

    public ConcordiaController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/facilities/buildinglist")
    public ResponseEntity<List<Building>> getBuildingList() {

        // To access the Concordia API, we need to set Basic Auth headers with the keys
        // and user credentials that are on the github actions secrets.

        HttpHeaders headers = new HttpHeaders();
        if (apiUser != null && apiKey != null) {
            headers.setBasicAuth(apiUser, apiKey);
        }
        HttpEntity<String> entity = new HttpEntity<>(headers);

        String targetUrl = apiUrl + "/facilities/buildinglist/";

        try {
            ResponseEntity<List<Building>> response = restTemplate.exchange(
                    targetUrl,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Building>>() {
                    });
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch building list: " + e.getMessage());
        }
    }
}
