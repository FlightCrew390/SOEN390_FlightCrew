package com.soen390.flightcrew.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.soen390.flightcrew.model.PointOfInterest;
import com.soen390.flightcrew.service.PointOfInterestService;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PointOfInterestController {

    private final PointOfInterestService pointOfInterestService;

    public PointOfInterestController(PointOfInterestService pointOfInterestService) {
        this.pointOfInterestService = pointOfInterestService;
    }

    @GetMapping("/poi/list")
    public ResponseEntity<List<PointOfInterest>> getPoiList(
            @RequestParam(required = false) String campus) {
        List<PointOfInterest> pois = pointOfInterestService.getAllPois(campus);
        return ResponseEntity.ok(pois);
    }
}
