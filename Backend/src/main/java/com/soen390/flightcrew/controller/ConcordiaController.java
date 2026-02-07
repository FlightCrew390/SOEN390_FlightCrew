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
import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import com.soen390.flightcrew.service.GoogleMapsService;
import java.util.List;
import org.springframework.core.ParameterizedTypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.File;
import java.io.IOException;

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

    @Value("${app.cache.file:buildings_cache.json}")
    private String cacheFileName;

    private final RestTemplate restTemplate;
    private final GoogleMapsService googleMapsService;
    private final ObjectMapper objectMapper;

    public ConcordiaController(RestTemplate restTemplate, GoogleMapsService googleMapsService,
            ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.googleMapsService = googleMapsService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/facilities/buildinglist")
    public ResponseEntity<List<Building>> getBuildingList() {

        // Check for cached file
        File cacheFile = new File(cacheFileName);
        if (cacheFile.exists()) {
            try {
                List<Building> cachedBuildings = objectMapper.readValue(cacheFile, new TypeReference<List<Building>>() {
                });
                return ResponseEntity.ok(cachedBuildings);
            } catch (IOException e) {
                System.err.println("Failed to read from cache: " + e.getMessage());
            }
        }

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

            List<Building> buildings = response.getBody();
            if (buildings != null) {
                for (Building building : buildings) {
                    if (building.getAddress() != null) {
                        try {
                            // Note: This API call is rate-limited and costs money. Be careful with loops.
                            GoogleGeocodeResponse googleResponse = googleMapsService
                                    .getBuildingInfo(building.getLatitude(), building.getLongitude());

                            if (googleResponse != null && googleResponse.getDestinations() != null
                                    && !googleResponse.getDestinations().isEmpty()) {

                                GoogleGeocodeResponse.PrimaryPlace bestMatch = googleResponse.getDestinations().get(0)
                                        .getPrimary();
                                String targetName = building.getBuildingLongName() != null
                                        ? building.getBuildingLongName()
                                        : building.getBuildingName();

                                for (GoogleGeocodeResponse.Destination dest : googleResponse.getDestinations()) {
                                    if (dest.getPrimary() != null && dest.getPrimary().getDisplayName() != null
                                            && targetName != null) {
                                        String destName = dest.getPrimary().getDisplayName().getText();
                                        if (destName.toLowerCase().contains(targetName.toLowerCase()) ||
                                                targetName.toLowerCase().contains(destName.toLowerCase())) {
                                            bestMatch = dest.getPrimary();
                                            break;
                                        }
                                    }
                                }

                                if (bestMatch != null && bestMatch.getDisplayName() != null) {
                                    System.out.println("Match Selected: '" + targetName +
                                            "' matched with: '" + bestMatch.getDisplayName().getText() + "'");
                                }
                                building.setGooglePlaceInfo(bestMatch);
                            }
                        } catch (Exception e) {
                            // Log error but continue with other buildings
                            System.err.println("Error fetching google info for building " + building.getBuildingCode()
                                    + ": " + e.getMessage());
                        }
                    }
                }

                // Save to cache
                try {
                    objectMapper.writeValue(cacheFile, buildings);
                } catch (IOException e) {
                    System.err.println("Failed to write to cache: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(buildings);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch building list: " + e.getMessage());
        }
    }

}
