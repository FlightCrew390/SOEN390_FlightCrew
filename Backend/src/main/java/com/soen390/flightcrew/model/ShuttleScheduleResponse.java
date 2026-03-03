package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShuttleScheduleResponse {

    @JsonProperty("day")
    private String day;

    @JsonProperty("no_service")
    private boolean noService;

    @JsonProperty("service_start")
    private String serviceStart;

    @JsonProperty("service_end")
    private String serviceEnd;

    @JsonProperty("departures")
    private List<ShuttleTimeDTO> departures;
}
