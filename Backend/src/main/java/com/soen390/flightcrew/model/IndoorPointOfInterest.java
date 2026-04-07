package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class IndoorPointOfInterest {

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("category")
    private String category;

    @JsonProperty("buildingCode")
    private String buildingCode;

    @JsonProperty("floor")
    private Integer floor;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("description")
    private String description;

    @JsonProperty("x")
    private Integer x;

    @JsonProperty("y")
    private Integer y;
}
