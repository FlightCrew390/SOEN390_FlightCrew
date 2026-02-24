package com.soen390.flightcrew.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;
import java.util.regex.Pattern;

@Service
public class GoogleMapsService {

    Logger logger = Logger.getLogger(GoogleMapsService.class.getName());

    @Value("${google.api.key}")
    private String googleApiKey;

    private static final String GOOGLE_GEOCODE_URL = "https://geocode.googleapis.com/v4alpha/geocode/destinations";
    private static final String GOOGLE_DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json";
    private static final Pattern HTML_TAGS = Pattern.compile("<[^>]*>");

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GoogleMapsService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Cacheable("buildingInfo")
    public GoogleGeocodeResponse getBuildingInfo(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleApiKey);
        headers.set("X-Goog-FieldMask", "*");

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
            logger.severe("Error fetching geocode info from Google Maps API: " + e.getMessage());
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
        headers.set("X-Goog-Api-Key", googleApiKey);
        headers.set("X-Goog-FieldMask", "*");

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
            logger.severe("Error fetching geocode info from Google Maps API: " + e.getMessage());
            return null;
        }
    }

    /**
     * Get directions between two points using Google Directions API (legacy).
     * @param mode one of: walking, bicycling, transit, driving
     */
    public DirectionsResponse getDirections(double originLat, double originLng,
            double destLat, double destLng, String mode) {
        String originStr = originLat + "," + originLng;
        String destStr = destLat + "," + destLng;
        String modeStr = mode != null && !mode.isEmpty() ? mode : "walking";
        String url = GOOGLE_DIRECTIONS_URL + "?origin=" + java.net.URLEncoder.encode(originStr, "UTF-8")
                + "&destination=" + java.net.URLEncoder.encode(destStr, "UTF-8")
                + "&mode=" + java.net.URLEncoder.encode(modeStr, "UTF-8")
                + "&key=" + java.net.URLEncoder.encode(googleApiKey, "UTF-8");
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getBody() == null) {
                return null;
            }
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode routes = root.path("routes");
            if (routes.isEmpty()) {
                return null;
            }
            JsonNode overview = routes.get(0).path("overview_polyline").path("points");
            String encodedPolyline = overview.asText("");
            JsonNode legs = routes.get(0).path("legs");
            List<DirectionsResponse.DirectionStep> steps = new ArrayList<>();
            if (!legs.isEmpty()) {
                for (JsonNode step : legs.get(0).path("steps")) {
                    String html = step.path("html_instructions").asText("");
                    steps.add(new DirectionsResponse.DirectionStep(stripHtml(html)));
                }
            }
            return new DirectionsResponse(encodedPolyline, steps);
        } catch (Exception e) {
            logger.severe("Error fetching directions from Google: " + e.getMessage());
            return null;
        }
    }

    private static String stripHtml(String html) {
        return HTML_TAGS.matcher(html).replaceAll("").replace("&nbsp;", " ").trim();
    }
}
