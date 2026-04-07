package com.soen390.flightcrew.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.CalendarList;
import com.google.api.services.calendar.model.CalendarListEntry;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import com.soen390.flightcrew.model.CalendarEventDTO;
import com.soen390.flightcrew.model.CalendarInfoDTO;
import com.soen390.flightcrew.testing.E2EMockCalendarData;
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

        /**
         * Fetch the list of calendars the authenticated user has access to.
         */
        public List<CalendarInfoDTO> fetchCalendarList(String accessToken) {
                // Check for E2E mode
                if (E2EMockCalendarData.isE2EMode(accessToken)) {
                        return E2EMockCalendarData.getMockCalendars();
                }

                try {
                        Calendar calendarApi = buildCalendarClient(accessToken);

                        CalendarList calendarList = calendarApi.calendarList()
                                        .list()
                                        .setMinAccessRole("reader")
                                        .execute();

                        return calendarList.getItems().stream()
                                        .map(this::toCalendarInfoDTO)
                                        .toList();

                } catch (IOException e) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Failed to fetch calendar list: " + e.getMessage());
                }
        }

        /**
         * Fetch events from a specific calendar (or "primary" by default).
         */
        public List<CalendarEventDTO> fetchEvents(
                        String accessToken, String timeMin, String timeMax, String calendarId) {

                // Check for E2E mode
                if (E2EMockCalendarData.isE2EMode(accessToken)) {
                        return E2EMockCalendarData.getMockEvents();
                }

                try {
                        Calendar calendarApi = buildCalendarClient(accessToken);

                        String targetCalendar = (calendarId != null && !calendarId.isEmpty())
                                        ? calendarId
                                        : "primary";

                        Calendar.Events.List request = calendarApi.events()
                                        .list(targetCalendar)
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
                                        .map(this::toEventDTO)
                                        .toList();

                } catch (IOException e) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Failed to fetch calendar events: " + e.getMessage());
                }
        }

        protected Calendar buildCalendarClient(String accessToken) {
                // Provide a future expiry so the Google client library never attempts
                // its own token refresh — the mobile app handles refresh before calling us.
                java.util.Date futureExpiry = new java.util.Date(System.currentTimeMillis() + 3_600_000);
                AccessToken token = new AccessToken(accessToken, futureExpiry);
                GoogleCredentials credentials = GoogleCredentials.create(token);
                HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

                return new Calendar.Builder(
                                new NetHttpTransport(),
                                new GsonFactory(),
                                requestInitializer)
                                .setApplicationName("FlightCrew")
                                .build();
        }

        private CalendarInfoDTO toCalendarInfoDTO(CalendarListEntry entry) {
                return new CalendarInfoDTO(
                                entry.getId(),
                                entry.getSummary(),
                                entry.getDescription(),
                                entry.getBackgroundColor(),
                                Boolean.TRUE.equals(entry.getPrimary()));
        }

        private CalendarEventDTO toEventDTO(Event event) {
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
