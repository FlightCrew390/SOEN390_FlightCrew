package com.soen390.flightcrew.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavigationStepDTO {
    private Integer distanceMeters;
    private Integer durationSeconds;
    private String instruction;
    private String maneuver;
    private List<CoordinateDTO> coordinates;
    private NavigationTransitStepDetailsDTO transitDetails;
}
