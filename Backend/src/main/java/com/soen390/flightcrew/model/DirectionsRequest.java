package com.soen390.flightcrew.model;

import lombok.Data;

@Data
public class DirectionsRequest {
    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private String travelMode; // DRIVE, WALK, BICYCLE, TRANSIT
}
