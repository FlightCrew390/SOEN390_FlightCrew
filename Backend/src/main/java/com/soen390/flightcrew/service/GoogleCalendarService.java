package com.soen390.flightcrew.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import com.soen390.flightcrew.model.CalendarEventDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.util.List;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.api.client.http.HttpRequestInitializer;

@Service
public class GoogleCalendarService {

    public List<CalendarEventDTO> fetchEvents(
            String accessToken, String timeMin, String timeMax) {

        try {
            AccessToken token = new AccessToken(accessToken, null);
            GoogleCredentials credentials = GoogleCredentials.create(token);

            HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

            Calendar calendarApi = new Calendar.Builder(
                    new NetHttpTransport(),
                    new GsonFactory(),
                    requestInitializer)
                    .setApplicationName("FlightCrew")
                    .build();

            Calendar.Events.List request = calendarApi.events()
                    .list("primary")
                    .setSingleEvents(true)
                    .setOrderBy("startTime");

            if (timeMin != null && !timeMin.isEmpty()) {
                request.setTimeMin(new DateTime(timeMin));
            }
            if (timeMax != null && !timeMax.isEmpty()) {
                request.setTimeMax(new DateTime(timeMax));
            }

            Events events = request.execute();

            return events.getItems().stream()
                    .map(this::toDTO)
                    .toList();

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Failed to fetch calendar events: " + e.getMessage());
        }
    }

    private CalendarEventDTO toDTO(Event event) {
        boolean allDay = event.getStart().getDate() != null;
        String start = allDay
                ? event.getStart().getDate().toString()
                : event.getStart().getDateTime().toString();
        String end = allDay
                ? event.getEnd().getDate().toString()
                : event.getEnd().getDateTime().toString();

        return new CalendarEventDTO(
                event.getId(),
                event.getSummary(),
                event.getDescription(),
                event.getLocation(),
                start,
                end,
                allDay);
    }
}
