package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PointOfInterest {

    @JsonProperty("Name")
    private String name;

    @JsonProperty("Category")
    private String category;

    @JsonProperty("Campus")
    private String campus;

    @JsonProperty("Address")
    private String address;

    @JsonProperty("Latitude")
    private Double latitude;

    @JsonProperty("Longitude")
    private Double longitude;

    @JsonProperty("Description")
    private String description;

    @JsonProperty("Google_Place_Info")
    private GoogleGeocodeResponse.PrimaryPlace googlePlaceInfo;
}
