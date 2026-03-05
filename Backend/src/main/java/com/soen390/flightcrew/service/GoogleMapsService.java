package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.DirectionsResponse;
import com.soen390.flightcrew.model.GoogleGeocodeRequest;
import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.soen390.flightcrew.exception.ApiQuotaExceededException;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GoogleMapsService {

    Logger logger = LoggerFactory.getLogger(GoogleMapsService.class.getName());

    @Value("${google.api.key}")
    private String googleApiKey;

    private final RestTemplate restTemplate;
    private static final String GOOGLE_GEOCODE_URL = "https://geocode.googleapis.com/v4alpha/geocode/destinations";
    private static final String GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
    private static final String GOOG_API_KEY_HEADER = "X-Goog-Api-Key";
    private static final String GOOG_FIELD_MASK_HEADER = "X-Goog-FieldMask";

    private final ApiQuotaService quotaService;

    public GoogleMapsService(RestTemplate restTemplate, ApiQuotaService quotaService) {
        this.restTemplate = restTemplate;
        this.quotaService = quotaService;
    }

    @Cacheable("buildingInfo")
    public GoogleGeocodeResponse getBuildingInfo(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(GOOG_API_KEY_HEADER, googleApiKey);
        headers.set(GOOG_FIELD_MASK_HEADER, "*");

        GoogleGeocodeRequest request = new GoogleGeocodeRequest();
        request.setLocationQuery(new GoogleGeocodeRequest.LocationQuery(
                new GoogleGeocodeRequest.Location(latitude, longitude)));

        HttpEntity<GoogleGeocodeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<GoogleGeocodeResponse> response = restTemplate.postForEntity(
                    GOOGLE_GEOCODE_URL,
                    entity,
                    GoogleGeocodeResponse.class);
            return response.getBody();
        } catch (Exception e) {
            logger.warn("Error fetching geocode info from Google Maps API: {}", e.getMessage());
            return null;
        }
    }

    @Cacheable("buildingInfoByAddress")
    public GoogleGeocodeResponse getBuildingInfoByAddress(String address) {
        if (address == null || address.isEmpty()) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(GOOG_API_KEY_HEADER, googleApiKey);
        headers.set(GOOG_FIELD_MASK_HEADER, "*");

        GoogleGeocodeRequest request = new GoogleGeocodeRequest();
        request.setAddressQuery(
                new GoogleGeocodeRequest.AddressQuery(address));

        HttpEntity<GoogleGeocodeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<GoogleGeocodeResponse> response = restTemplate.postForEntity(
                    GOOGLE_GEOCODE_URL,
                    entity,
                    GoogleGeocodeResponse.class);
            return response.getBody();
        } catch (Exception e) {
            logger.warn("Error fetching geocode info from Google Maps API: {}", e.getMessage());
            return null;
        }
    }

    @Cacheable(value = "directions", key = "#originLat + ',' + #originLng + ',' + #destLat + ',' + #destLng + ',' + #travelMode + ',' + #departureTime + ',' + #arrivalTime")
    public DirectionsResponse getDirections(Double originLat, Double originLng,
            Double destLat, Double destLng,
            String travelMode, String departureTime, String arrivalTime) {
        if (originLat == null || originLng == null || destLat == null || destLng == null) {
            return null;
        }

        // --- Quota check BEFORE calling Google ---
        if (!quotaService.tryConsume()) {
            throw new ApiQuotaExceededException("Google API quota exceeded. Try again later.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(GOOG_API_KEY_HEADER, googleApiKey);
        headers.set(GOOG_FIELD_MASK_HEADER,
                "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,"
                        + "routes.legs.steps.navigationInstruction,"
                        + "routes.legs.steps.polyline.encodedPolyline,"
                        + "routes.legs.steps.distanceMeters,"
                        + "routes.legs.steps.staticDuration,"
                        + "routes.legs.steps.travelMode,"
                        + "routes.legs.steps.transitDetails,"
                        + "routes.legs.distanceMeters,routes.legs.duration");

        // Build the request body per Google Routes API spec
        Map<String, Object> origin = Map.of(
                "location", Map.of("latLng", Map.of("latitude", originLat, "longitude", originLng)));
        Map<String, Object> destination = Map.of(
                "location", Map.of("latLng", Map.of("latitude", destLat, "longitude", destLng)));

        String mode = (travelMode != null) ? travelMode.toUpperCase() : "WALK";

        // Use mutable map so we can conditionally add time fields
        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("origin", origin);
        requestBody.put("destination", destination);
        requestBody.put("travelMode", mode);
        requestBody.put("computeAlternativeRoutes", false);

        if (departureTime != null && !departureTime.isEmpty()) {
            requestBody.put("departureTime", departureTime);
        }
        if (arrivalTime != null && !arrivalTime.isEmpty()) {
            requestBody.put("arrivalTime", arrivalTime);
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<DirectionsResponse> response = restTemplate.postForEntity(
                    GOOGLE_ROUTES_URL, entity, DirectionsResponse.class);
            return response.getBody();
        } catch (Exception e) {
            logger.warn("Error fetching directions from Google Routes API: {}", e.getMessage());
            return null;
        }
    }
}
