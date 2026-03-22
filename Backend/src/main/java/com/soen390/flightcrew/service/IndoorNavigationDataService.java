package com.soen390.flightcrew.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soen390.flightcrew.model.IndoorAssetFileDTO;
import com.soen390.flightcrew.model.IndoorBuildingData;
import com.soen390.flightcrew.model.IndoorEdge;
import com.soen390.flightcrew.model.IndoorNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.Objects;

@Service
public class IndoorNavigationDataService {

    private final ObjectMapper objectMapper;
    private final Path indoorJsonDir;
    private final Path indoorSvgDir;

    public IndoorNavigationDataService(ObjectMapper objectMapper,
            @Value("${app.indoor.json-dir:src/main/resources/indoor/json}") String indoorJsonDir,
            @Value("${app.indoor.svg-dir:src/main/resources/indoor/svg}") String indoorSvgDir) {
        this.objectMapper = objectMapper;
        this.indoorJsonDir = Paths.get(indoorJsonDir);
        this.indoorSvgDir = Paths.get(indoorSvgDir);
    }

    public List<String> getAvailableBuildings() {
        return loadBuildingData().stream()
                .map(IndoorBuildingData::getMeta)
                .filter(meta -> meta != null && meta.get("buildingId") != null)
                .map(meta -> meta.get("buildingId"))
                .distinct()
                .sorted()
                .toList();
    }

    public List<Integer> getFloorsByBuilding(String buildingId) {
        if (buildingId == null || buildingId.isBlank()) {
            return List.of();
        }

        Set<Integer> floors = loadNodes().stream()
                .filter(node -> buildingId.equalsIgnoreCase(node.getBuildingId()))
                .map(IndoorNode::getFloor)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return floors.stream().sorted().toList();
    }

    public List<IndoorNode> getRooms(String query, String buildingId, Integer floor) {
        String normalizedQuery = query != null ? query.trim().toLowerCase(Locale.ROOT) : "";

        return loadNodes().stream()
                .filter(node -> "room".equalsIgnoreCase(node.getType()))
                .filter(node -> buildingId == null || buildingId.isBlank()
                        || buildingId.equalsIgnoreCase(node.getBuildingId()))
                .filter(node -> floor == null || floor.equals(node.getFloor()))
                .filter(node -> normalizedQuery.isEmpty()
                        || (node.getLabel() != null
                                && node.getLabel().toLowerCase(Locale.ROOT).contains(normalizedQuery)))
                .sorted(Comparator.comparing(node -> node.getLabel() != null ? node.getLabel() : ""))
                .toList();
    }

    public List<IndoorNode> getAllNodes(String buildingId) {
        return loadNodes().stream()
                .filter(node -> buildingId == null || buildingId.isBlank()
                        || buildingId.equalsIgnoreCase(node.getBuildingId()))
                .toList();
    }

    public List<IndoorEdge> getEdgesByBuilding(String buildingId) {
        if (buildingId == null || buildingId.isBlank())
            return List.of();

        return loadBuildingData().stream()
                .filter(data -> buildingId.equalsIgnoreCase(data.getMeta().get("buildingId")))
                .flatMap(data -> data.getEdges() != null ? data.getEdges().stream() : Stream.empty())
                .toList();
    }

    public List<IndoorAssetFileDTO> listSvgAssets() {
        if (!Files.exists(indoorSvgDir)) {
            return List.of();
        }

        try (Stream<Path> files = Files.list(indoorSvgDir)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".svg"))
                    .sorted()
                    .map(path -> path.getFileName().toString())
                    .map(fileName -> new IndoorAssetFileDTO(fileName, "/api/indoor/assets/svg/" + fileName))
                    .toList();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to list indoor SVG assets", ex);
        }
    }

    public Resource loadSvgFile(String fileName) {
        return loadAssetFile(fileName);
    }

    public Resource loadAssetFile(String fileName) {
        if (fileName == null || fileName.isBlank() || fileName.contains("..") || fileName.contains("/")
                || fileName.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        Path normalizedPath = indoorSvgDir.resolve(fileName).normalize();

        FileSystemResource fsResource = new FileSystemResource(normalizedPath.toFile());
        if (normalizedPath.startsWith(indoorSvgDir.normalize()) && fsResource.exists() && fsResource.isReadable()) {
            return fsResource;
        }

        ClassPathResource classPathResource = new ClassPathResource("indoor/svg/" + fileName);
        if (classPathResource.exists() && classPathResource.isReadable()) {
            return classPathResource;
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Indoor asset file not found");
    }

    public String detectAssetContentType(String fileName) {
        Path normalizedPath = indoorSvgDir.resolve(fileName).normalize();
        if (!normalizedPath.startsWith(indoorSvgDir.normalize())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        try {
            String probedType = probeContentType(normalizedPath);
            if (probedType != null && !probedType.isBlank()) {
                return probedType;
            }
        } catch (IOException ignored) {
            // Fall back to extension-based mapping below.
        }

        String lowerName = fileName.toLowerCase(Locale.ROOT);
        if (lowerName.endsWith(".svg")) {
            return "image/svg+xml";
        }
        if (lowerName.endsWith(".png")) {
            return "image/png";
        }
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lowerName.endsWith(".webp")) {
            return "image/webp";
        }

        return "application/octet-stream";
    }

    String probeContentType(Path path) throws IOException {
        return Files.probeContentType(path);
    }

    private List<IndoorNode> loadNodes() {
        return loadBuildingData().stream()
                .flatMap(data -> data.getNodes() != null ? data.getNodes().stream() : Stream.empty())
                .toList();
    }

    private List<IndoorBuildingData> loadBuildingData() {
        if (!Files.exists(indoorJsonDir)) {
            return List.of();
        }

        List<IndoorBuildingData> result = new ArrayList<>();

        try (Stream<Path> files = Files.list(indoorJsonDir)) {
            files.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".json"))
                    .sorted()
                    .forEach(path -> {
                        try {
                            IndoorBuildingData data = objectMapper.readValue(path.toFile(), IndoorBuildingData.class);
                            if (data != null) {
                                result.add(data);
                            }
                        } catch (IOException ex) {
                            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                    "Failed to parse indoor JSON file: " + path.getFileName(), ex);
                        }
                    });
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to read indoor JSON directory", ex);
        }

        return result;
    }
}
