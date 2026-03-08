package com.soen390.flightcrew.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.soen390.flightcrew.model.PointOfInterest;
import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import com.soen390.flightcrew.util.GooglePlaceMatchUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PointOfInterestService {

    private static final Logger logger = LoggerFactory.getLogger(PointOfInterestService.class);

    @Value("${app.poi.cache.file:poi_cache.json}")
    private String cacheFileName;

    private final GoogleMapsService googleMapsService;
    private final ObjectMapper objectMapper;

    public PointOfInterestService(GoogleMapsService googleMapsService, ObjectMapper objectMapper) {
        this.googleMapsService = googleMapsService;
        this.objectMapper = objectMapper;
    }

    public List<PointOfInterest> getAllPois(String campus) {
        Optional<List<PointOfInterest>> cached = loadFromCache();
        if (cached.isPresent()) {
            return filterByCampus(cached.get(), campus);
        }

        List<PointOfInterest> pois = loadStaticPois();
        if (!pois.isEmpty()) {
            enrichWithGoogleData(pois);
            saveToCache(pois);
        }
        return filterByCampus(pois, campus);
    }

    private List<PointOfInterest> filterByCampus(List<PointOfInterest> pois, String campus) {
        if (pois == null) {
            return java.util.Collections.emptyList();
        }
        if (campus == null || campus.trim().isEmpty()) {
            return pois;
        }
        return pois.stream()
                .filter(poi -> campus.trim().equalsIgnoreCase(poi.getCampus()))
                .toList();
    }

    private Optional<List<PointOfInterest>> loadFromCache() {
        File cacheFile = new File(cacheFileName);
        if (!cacheFile.exists()) {
            return Optional.empty();
        }
        try {
            List<PointOfInterest> cachedPois = objectMapper.readValue(cacheFile,
                    new TypeReference<List<PointOfInterest>>() {
                    });
            return Optional.of(cachedPois);
        } catch (IOException e) {
            logger.warn("Failed to read POI cache: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private List<PointOfInterest> loadStaticPois() {
        try {
            InputStream inputStream = new ClassPathResource("outdoor_poi.json").getInputStream();
            return objectMapper.readValue(inputStream, new TypeReference<List<PointOfInterest>>() {
            });
        } catch (IOException e) {
            logger.warn("Failed to load static POI data: {}", e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    private void enrichWithGoogleData(List<PointOfInterest> pois) {
        for (PointOfInterest poi : pois) {
            if (poi.getLatitude() != null && poi.getLongitude() != null) {
                enrichPoi(poi);
            }
        }
    }

    private void enrichPoi(PointOfInterest poi) {
        try {
            GoogleGeocodeResponse googleResponse = googleMapsService
                    .getBuildingInfo(poi.getLatitude(), poi.getLongitude());

            if (googleResponse == null || googleResponse.getDestinations() == null
                    || googleResponse.getDestinations().isEmpty()) {
                return;
            }

            String targetName = poi.getName();
            GoogleGeocodeResponse.PrimaryPlace bestMatch = GooglePlaceMatchUtil.findBestMatch(targetName,
                    googleResponse.getDestinations());

            if (bestMatch != null && bestMatch.getDisplayName() != null
                    && logger.isInfoEnabled()) {
                logger.info("POI Match: '{}' matched with: '{}'", targetName,
                        bestMatch.getDisplayName().getText());
            }
            poi.setGooglePlaceInfo(bestMatch);
        } catch (RuntimeException e) {
            logger.warn("Error fetching google info for POI {}: {}", poi.getName(), e.getMessage());
        }
    }

    private void saveToCache(List<PointOfInterest> pois) {
        try {
            objectMapper.writeValue(new File(cacheFileName), pois);
        } catch (IOException e) {
            logger.warn("Failed to write POI cache: {}", e.getMessage());
        }
    }
}
