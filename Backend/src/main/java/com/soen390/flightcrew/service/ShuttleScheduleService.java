package com.soen390.flightcrew.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soen390.flightcrew.model.CoordinateDTO;
import com.soen390.flightcrew.model.ShuttleRouteResponse;
import com.soen390.flightcrew.model.ShuttleScheduleData;
import com.soen390.flightcrew.model.ShuttleScheduleResponse;
import com.soen390.flightcrew.model.ShuttleTimeDTO;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ShuttleScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(ShuttleScheduleService.class);

    private final ObjectMapper objectMapper;

    @Value("${app.shuttle.file:shuttle_schedule.json}")
    private String scheduleFileName;

    private List<ShuttleTimeDTO> mondayThursdaySchedule;
    private List<ShuttleTimeDTO> fridaySchedule;
    private List<CoordinateDTO> sgwToLoyolaRoute;
    private String shuttleDuration;
    private String shuttleDistance;

    public ShuttleScheduleService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void loadScheduleData() {
        File file = new File(scheduleFileName);
        if (!file.exists()) {
            logger.error("Shuttle schedule file not found: {}", scheduleFileName);
            throw new IllegalStateException("Shuttle schedule file not found: " + scheduleFileName);
        }

        try {
            ShuttleScheduleData data = objectMapper.readValue(file, ShuttleScheduleData.class);
            shuttleDuration = data.getDuration();
            shuttleDistance = data.getDistance();
            mondayThursdaySchedule = Collections.unmodifiableList(toDTOList(data.getMondayThursday()));
            fridaySchedule = Collections.unmodifiableList(toDTOList(data.getFriday()));
            sgwToLoyolaRoute = Collections.unmodifiableList(data.getSgwToLoyolaRoute());
            logger.info("Loaded shuttle schedule: {} Mon-Thu departures, {} Fri departures, {} route points",
                    mondayThursdaySchedule.size(), fridaySchedule.size(), sgwToLoyolaRoute.size());
        } catch (IOException e) {
            logger.error("Failed to read shuttle schedule file", e);
            throw new IllegalStateException("Failed to read shuttle schedule file", e);
        }
    }

    /**
     * Returns the shuttle schedule for the given day of the week.
     * Weekends return a response with {@code noService = true} and an empty
     * departure list.
     *
     * @param day the day of the week
     * @return the shuttle schedule response
     */
    public ShuttleScheduleResponse getSchedule(DayOfWeek day) {
        logger.info("Fetching shuttle schedule for {}", day);

        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            logger.info("No shuttle service on {}", day);
            return new ShuttleScheduleResponse(day.name(), true, null, null, Collections.emptyList());
        }

        List<ShuttleTimeDTO> departures = (day == DayOfWeek.FRIDAY)
                ? fridaySchedule
                : mondayThursdaySchedule;

        String serviceStart = departures.get(0).getLoyolaDeparture();
        String serviceEnd = resolveServiceEnd(departures.get(departures.size() - 1));

        return new ShuttleScheduleResponse(day.name(), false, serviceStart, serviceEnd, departures);
    }

    /**
     * Returns the fixed shuttle route between SGW (Hall) and Loyola campuses,
     * including the canonical polyline in both directions, duration, and distance.
     *
     * @return the shuttle route response
     */
    public ShuttleRouteResponse getRoute() {
        logger.info("Fetching shuttle route");

        List<CoordinateDTO> loyolaToSgw = new ArrayList<>(sgwToLoyolaRoute);
        Collections.reverse(loyolaToSgw);

        return new ShuttleRouteResponse(shuttleDuration, shuttleDistance, sgwToLoyolaRoute, loyolaToSgw);
    }

    /**
     * Converts raw JSON departure entries into {@link ShuttleTimeDTO} instances.
     */
    private List<ShuttleTimeDTO> toDTOList(List<ShuttleScheduleData.DepartureEntry> entries) {
        List<ShuttleTimeDTO> result = new ArrayList<>(entries.size());
        for (ShuttleScheduleData.DepartureEntry entry : entries) {
            result.add(new ShuttleTimeDTO(entry.getLoyola(), entry.getSgw(), entry.isLastBus()));
        }
        return result;
    }

    /**
     * Resolves the service-end time from the last departure entry.
     * Prefers the SGW departure if present; otherwise falls back to the Loyola
     * departure.
     */
    private String resolveServiceEnd(ShuttleTimeDTO lastEntry) {
        return (lastEntry.getSgwDeparture() != null)
                ? lastEntry.getSgwDeparture()
                : lastEntry.getLoyolaDeparture();
    }
}
