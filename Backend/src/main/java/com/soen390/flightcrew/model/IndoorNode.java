package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IndoorNode {
    private String id;
    private String type;
    private String buildingId;
    private Integer floor;
    private Double x;
    private Double y;
    private String label;
    private Boolean accessible;
}
