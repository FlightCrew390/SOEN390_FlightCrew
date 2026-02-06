package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleGeocodeResponse {

    @JsonProperty("destinations")
    private List<Destination> destinations;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Destination {
        @JsonProperty("primary")
        private PrimaryPlace primary;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PrimaryPlace {
        @JsonProperty("place")
        private String placeId;

        @JsonProperty("displayName")
        private DisplayName displayName;

        @JsonProperty("primaryType")
        private String primaryType;

        @JsonProperty("types")
        private List<String> types;

        @JsonProperty("formattedAddress")
        private String formattedAddress;

        @JsonProperty("structureType")
        private String structureType;

        @JsonProperty("location")
        private Location location;

        @JsonProperty("displayPolygon")
        private DisplayPolygon displayPolygon;

        @JsonProperty("entrances")
        private List<Entrance> entrances;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DisplayName {
        @JsonProperty("text")
        private String text;

        @JsonProperty("languageCode")
        private String languageCode;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Location {
        @JsonProperty("latitude")
        private Double latitude;

        @JsonProperty("longitude")
        private Double longitude;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Entrance {
        @JsonProperty("location")
        private Location location;

        @JsonProperty("tags")
        private List<String> tags;

        @JsonProperty("place")
        private String place;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DisplayPolygon {
        @JsonProperty("type")
        private String type;

        @JsonProperty("coordinates")
        private List<Object> coordinates;
    }
}
