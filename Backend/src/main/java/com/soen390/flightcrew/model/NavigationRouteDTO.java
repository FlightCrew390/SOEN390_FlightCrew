package com.soen390.flightcrew.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavigationRouteDTO {
    private List<CoordinateDTO> coordinates;
    private Integer distanceMeters;
    private Integer durationSeconds;
    private List<NavigationStepDTO> steps;
}
