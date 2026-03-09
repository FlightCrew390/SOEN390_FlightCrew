package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Internal mapping class for deserialising {@code shuttle_schedule.json}.
 * Not exposed via REST — the service transforms this into response DTOs.
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShuttleScheduleData {

    @JsonProperty("duration")
    private String duration;

    @JsonProperty("distance")
    private String distance;

    @JsonProperty("monday_thursday")
    private List<DepartureEntry> mondayThursday;

    @JsonProperty("friday")
    private List<DepartureEntry> friday;

    @JsonProperty("sgw_to_loyola_route")
    private List<CoordinateDTO> sgwToLoyolaRoute;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DepartureEntry {

        @JsonProperty("loyola")
        private String loyola;

        @JsonProperty("sgw")
        private String sgw;

        @JsonProperty("last_bus")
        private boolean lastBus;
    }
}
