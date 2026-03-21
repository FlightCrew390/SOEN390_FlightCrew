package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.IndoorAssetFileDTO;
import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.service.IndoorNavigationDataService;
import com.soen390.flightcrew.service.IndoorPathfindingService;

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

    public IndoorController(IndoorNavigationDataService indoorNavigationDataService,
            IndoorPathfindingService pathfindingService) {
        this.indoorNavigationDataService = indoorNavigationDataService;
        this.pathfindingService = pathfindingService;
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
    public ResponseEntity<?> getIndoorDirections(
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

            // Instead of just strings, let's map them to full nodes to provide coordinates
            // to frontend
            List<IndoorNode> fullPathNodes = indoorNavigationDataService.getRooms(null, buildingId, null)
                    .stream()
                    .filter(node -> pathIds.contains(node.getId()))
                    .map(node -> {
                        // Create a map to preserve correct sort order based on pathIds
                        return node;
                    })
                    // Quick hack to sort it correctly:
                    .sorted((a, b) -> Integer.compare(pathIds.indexOf(a.getId()), pathIds.indexOf(b.getId())))
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "path", fullPathNodes,
                    "distanceMeters", fullPathNodes.size() * 3, // rough approximation for now
                    "metadata", Map.of(
                            "startNodeId", startNodeId,
                            "endNodeId", endNodeId,
                            "accessible", requireAccessible)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error finding path: " + e.getMessage()));
        }
    }
}
