package com.soen390.flightcrew.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavigationTransitStepDetailsDTO {
    private String departureStopName;
    private String arrivalStopName;
    private String departureTime;
    private String arrivalTime;
    private String lineName;
    private String lineShortName;
    private String vehicleType;
    private String vehicleName;
    private Integer stopCount;
}
