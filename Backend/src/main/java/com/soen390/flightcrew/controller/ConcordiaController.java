package com.soen390.flightcrew.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import com.soen390.flightcrew.model.Building;
import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import com.soen390.flightcrew.service.GoogleMapsService;
import java.util.List;
import java.util.Optional;
import org.springframework.core.ParameterizedTypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api")
public class ConcordiaController {

    Logger logger = Logger.getLogger(ConcordiaController.class.getName());

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
        Optional<List<Building>> cached = loadFromCache();
        if (cached.isPresent()) {
            return ResponseEntity.ok(cached.get());
        }

        List<Building> buildings = fetchBuildingsFromApi();
        if (buildings != null && !buildings.isEmpty()) {
            enrichWithGoogleData(buildings);
            saveToCache(buildings);
        }
        return ResponseEntity.ok(buildings);
    }

    private Optional<List<Building>> loadFromCache() {
        File cacheFile = new File(cacheFileName);
        if (!cacheFile.exists()) {
            return Optional.empty();
        }
        try {
            List<Building> cachedBuildings = objectMapper.readValue(cacheFile, new TypeReference<List<Building>>() {
            });
            return Optional.of(cachedBuildings);
        } catch (IOException e) {
            logger.severe("Failed to read from cache: " + e.getMessage());
            return Optional.empty();
        }
    }

    private List<Building> fetchBuildingsFromApi() {
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
            return response.getBody();
        } catch (RestClientException e) {
            logger.severe("Error fetching building list from API: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    private void enrichWithGoogleData(List<Building> buildings) {
        for (Building building : buildings) {
            if (building.getAddress() != null) {
                enrichBuilding(building);
            }
        }
    }

    private void enrichBuilding(Building building) {
        try {
            // Note: This API call is rate-limited and costs money. Be careful with loops.
            GoogleGeocodeResponse googleResponse = googleMapsService
                    .getBuildingInfo(building.getLatitude(), building.getLongitude());

            if (googleResponse == null || googleResponse.getDestinations() == null
                    || googleResponse.getDestinations().isEmpty()) {
                return;
            }

            String targetName = building.getBuildingLongName() != null
                    ? building.getBuildingLongName()
                    : building.getBuildingName();
            GoogleGeocodeResponse.PrimaryPlace bestMatch = findBestMatch(targetName,
                    googleResponse.getDestinations());

            if (bestMatch != null && bestMatch.getDisplayName() != null
                    && logger.isLoggable(java.util.logging.Level.INFO)) {
                logger.info(String.format("Match Selected: '%s' matched with: '%s'", targetName,
                        bestMatch.getDisplayName().getText()));
            }
            building.setGooglePlaceInfo(bestMatch);
        } catch (Exception e) {
            logger.severe("Error fetching google info for building " + building.getBuildingCode()
                    + ": " + e.getMessage());
        }
    }

    private GoogleGeocodeResponse.PrimaryPlace findBestMatch(String targetName,
            List<GoogleGeocodeResponse.Destination> destinations) {
        GoogleGeocodeResponse.PrimaryPlace bestMatch = destinations.get(0).getPrimary();
        if (targetName == null) {
            return bestMatch;
        }

        for (GoogleGeocodeResponse.Destination dest : destinations) {
            if (dest.getPrimary() == null || dest.getPrimary().getDisplayName() == null) {
                continue;
            }
            String destName = dest.getPrimary().getDisplayName().getText();
            if (destName.toLowerCase().contains(targetName.toLowerCase()) ||
                    targetName.toLowerCase().contains(destName.toLowerCase())) {
                return dest.getPrimary();
            }
        }
        return bestMatch;
    }

    private void saveToCache(List<Building> buildings) {
        try {
            objectMapper.writeValue(new File(cacheFileName), buildings);
        } catch (IOException e) {
            logger.severe("Failed to write to cache: " + e.getMessage());
        }
    }

}
