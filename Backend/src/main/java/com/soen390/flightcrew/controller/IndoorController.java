package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.IndoorAssetFileDTO;
import com.soen390.flightcrew.model.IndoorEdge;
import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.model.IndoorStep;
import com.soen390.flightcrew.service.IndoorNavigationDataService;
import com.soen390.flightcrew.service.IndoorPathfindingService;
import com.soen390.flightcrew.service.IndoorStepGeneratorService;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/indoor")
public class IndoorController {

    private final IndoorNavigationDataService indoorNavigationDataService;
    private final IndoorPathfindingService pathfindingService;
    private final IndoorStepGeneratorService stepGeneratorService;

    public IndoorController(IndoorNavigationDataService indoorNavigationDataService,
            IndoorPathfindingService pathfindingService,
            IndoorStepGeneratorService stepGeneratorService) {
        this.indoorNavigationDataService = indoorNavigationDataService;
        this.pathfindingService = pathfindingService;
        this.stepGeneratorService = stepGeneratorService;
    }

    @GetMapping("/buildings")
    public ResponseEntity<List<String>> getAvailableBuildings() {
        return ResponseEntity.ok(indoorNavigationDataService.getAvailableBuildings());
    }

    @GetMapping("/buildings/{buildingId}/floors")
    public ResponseEntity<List<Integer>> getFloorsByBuilding(@PathVariable String buildingId) {
        return ResponseEntity.ok(indoorNavigationDataService.getFloorsByBuilding(buildingId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<IndoorNode>> getRooms(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String buildingId,
            @RequestParam(required = false) Integer floor) {
        return ResponseEntity.ok(indoorNavigationDataService.getRooms(query, buildingId, floor));
    }

    @GetMapping("/nodes")
    public ResponseEntity<List<IndoorNode>> getNodes(
            @RequestParam(required = false) String buildingId) {
        return ResponseEntity.ok(indoorNavigationDataService.getAllNodes(buildingId));
    }

    @GetMapping("/assets/svg")
    public ResponseEntity<List<IndoorAssetFileDTO>> listSvgAssets() {
        return ResponseEntity.ok(indoorNavigationDataService.listSvgAssets());
    }

    @GetMapping(value = "/assets/svg/{fileName:.+}", produces = "image/svg+xml")
    public ResponseEntity<Resource> getSvgFile(@PathVariable String fileName) {
        Resource resource = indoorNavigationDataService.loadSvgFile(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/svg+xml"))
                .body(resource);
    }

    @GetMapping(value = "/assets/{fileName:.+}")
    public ResponseEntity<Resource> getAssetFile(@PathVariable String fileName) {
        Resource resource = indoorNavigationDataService.loadAssetFile(fileName);
        String contentType = indoorNavigationDataService.detectAssetContentType(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/directions")
    public ResponseEntity<Object> getIndoorDirections(
            @RequestParam String buildingId,
            @RequestParam String startNodeId,
            @RequestParam String endNodeId,
            @RequestParam(defaultValue = "false") boolean requireAccessible) {

        try {
            List<String> pathIds = pathfindingService.findShortestPath(buildingId, startNodeId, endNodeId,
                    requireAccessible);

            if (pathIds == null || pathIds.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "No route found between the specified locations."));
            }

            java.util.Map<String, IndoorNode> nodeMap = new java.util.HashMap<>();
            indoorNavigationDataService.getAllNodes(buildingId)
                    .forEach(node -> nodeMap.putIfAbsent(node.getId(), node));

            List<IndoorNode> fullPathNodes = pathIds.stream()
                    .map(nodeMap::get)
                    .filter(java.util.Objects::nonNull)
                    .toList();

            List<IndoorEdge> edges = indoorNavigationDataService.getEdgesByBuilding(buildingId);
            List<IndoorStep> steps = stepGeneratorService.generateSteps(fullPathNodes, edges);
            double totalDistance = steps.stream().mapToDouble(IndoorStep::getDistanceMeters).sum();
            int totalDuration = steps.stream().mapToInt(IndoorStep::getDurationSeconds).sum();

            return ResponseEntity.ok(Map.of(
                    "path", fullPathNodes,
                    "steps", steps,
                    "distanceMeters", Math.round(totalDistance * 100.0) / 100.0,
                    "durationSeconds", totalDuration,
                    "metadata", Map.of(
                            "startNodeId", startNodeId,
                            "endNodeId", endNodeId,
                            "accessible", requireAccessible)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error finding path: " + e.getMessage()));
        }
    }
}
