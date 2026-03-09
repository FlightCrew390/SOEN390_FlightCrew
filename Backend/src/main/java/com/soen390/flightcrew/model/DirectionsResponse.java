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

        @JsonProperty("travelMode")
        private String travelMode;

        @JsonProperty("transitDetails")
        private TransitDetails transitDetails;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransitDetails {
        @JsonProperty("stopDetails")
        private StopDetails stopDetails;

        @JsonProperty("transitLine")
        private TransitLine transitLine;

        @JsonProperty("stopCount")
        private Integer stopCount;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StopDetails {
        @JsonProperty("arrivalStop")
        private TransitStop arrivalStop;

        @JsonProperty("departureStop")
        private TransitStop departureStop;

        @JsonProperty("arrivalTime")
        private String arrivalTime;

        @JsonProperty("departureTime")
        private String departureTime;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransitStop {
        @JsonProperty("name")
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransitLine {
        @JsonProperty("name")
        private String name;

        @JsonProperty("nameShort")
        private String nameShort;

        @JsonProperty("vehicle")
        private TransitVehicle vehicle;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransitVehicle {
        @JsonProperty("name")
        private TransitVehicleName name;

        @JsonProperty("type")
        private String type;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransitVehicleName {
        @JsonProperty("text")
        private String text;
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
