package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.IndoorAssetFileDTO;
import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.service.IndoorNavigationDataService;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/indoor")
public class IndoorController {

    private final IndoorNavigationDataService indoorNavigationDataService;

    public IndoorController(IndoorNavigationDataService indoorNavigationDataService) {
        this.indoorNavigationDataService = indoorNavigationDataService;
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
}
