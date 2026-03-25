package com.soen390.flightcrew.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IndoorStep {
    private String instruction;
    private String maneuver;
    private double distanceMeters;
    private int durationSeconds;
    private int startFloor;
    private int endFloor;
    private String startNodeId;
    private String endNodeId;
}
