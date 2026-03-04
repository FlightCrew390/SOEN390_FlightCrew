package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DirectionsResponse {

    @JsonProperty("routes")
    private List<Route> routes;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Route {
        @JsonProperty("legs")
        private List<Leg> legs;

        @JsonProperty("polyline")
        private Polyline polyline;

        @JsonProperty("distanceMeters")
        private Integer distanceMeters;

        @JsonProperty("duration")
        private String duration;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Leg {
        @JsonProperty("distanceMeters")
        private Integer distanceMeters;

        @JsonProperty("duration")
        private String duration;

        @JsonProperty("steps")
        private List<Step> steps;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Step {
        @JsonProperty("distanceMeters")
        private Integer distanceMeters;

        @JsonProperty("staticDuration")
        private String staticDuration;

        @JsonProperty("polyline")
        private Polyline polyline;

        @JsonProperty("navigationInstruction")
        private NavigationInstruction navigationInstruction;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NavigationInstruction {
        @JsonProperty("maneuver")
        private String maneuver;

        @JsonProperty("instructions")
        private String instructions;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Polyline {
        @JsonProperty("encodedPolyline")
        private String encodedPolyline;
    }
}
