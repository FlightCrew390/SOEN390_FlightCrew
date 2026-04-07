package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.IndoorPointOfInterest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class IndoorPoiService {

    private static final Logger logger = LoggerFactory.getLogger(IndoorPoiService.class);

    private final ObjectMapper objectMapper;
    private Map<String, List<IndoorPointOfInterest>> indoorPois;

    public IndoorPoiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        loadIndoorPois();
    }

    private void loadIndoorPois() {
        try {
            InputStream inputStream = new ClassPathResource("indoor_poi.json").getInputStream();
            indoorPois = objectMapper.readValue(inputStream,
                    new TypeReference<Map<String, List<IndoorPointOfInterest>>>() {
                    });
        } catch (IOException e) {
            logger.error("Failed to load indoor POI data: {}", e.getMessage());
            indoorPois = Collections.emptyMap();
        }
    }

    public List<IndoorPointOfInterest> getIndoorPoisForBuilding(String buildingCode) {
        if (buildingCode == null || buildingCode.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return indoorPois.getOrDefault(buildingCode.toUpperCase(), Collections.emptyList());
    }

    public Map<String, List<IndoorPointOfInterest>> getAllIndoorPois() {
        return indoorPois;
    }
}
