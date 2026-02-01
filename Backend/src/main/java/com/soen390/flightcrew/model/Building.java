package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Building {

    @JsonProperty("Campus")
    private String campus;

    @JsonProperty("Building")
    private String buildingCode;

    @JsonProperty("Building_Name")
    private String buildingName;

    @JsonProperty("Building_Long_Name")
    private String buildingLongName;

    @JsonProperty("Address")
    private String address;

    @JsonProperty("Latitude")
    private Double latitude;

    @JsonProperty("Longitude")
    private Double longitude;
}
