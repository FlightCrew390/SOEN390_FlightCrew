package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShuttleTimeDTO {

    @JsonProperty("loyola_departure")
    private String loyolaDeparture;

    @JsonProperty("sgw_departure")
    private String sgwDeparture;

    @JsonProperty("last_bus")
    private boolean lastBus;
}
