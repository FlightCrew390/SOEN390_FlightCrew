package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleGeocodeRequest {

    @JsonProperty("locationQuery")
    private LocationQuery locationQuery;

    @JsonProperty("addressQuery")
    private AddressQuery addressQuery;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationQuery {
        @JsonProperty("location")
        private Location location;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        @JsonProperty("latitude")
        private Double latitude;

        @JsonProperty("longitude")
        private Double longitude;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressQuery {
        @JsonProperty("addressQuery")
        private String addressQuery;
    }
}
