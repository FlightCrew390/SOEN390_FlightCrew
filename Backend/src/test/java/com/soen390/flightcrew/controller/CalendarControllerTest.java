package com.soen390.flightcrew.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.soen390.flightcrew.model.CalendarEventDTO;
import com.soen390.flightcrew.service.GoogleCalendarService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Arrays;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
                "external.api.url=http://mock-api.com",
                "external.api.user=testUser",
                "external.api.key=testKey",
                "google.api.key=testGoogleKey",
                "app.cache.file=non_existent_cache.json",
                "google.client-id=mock-id",
                "google.client-secret=mock-secret"
})
class CalendarControllerTest {

        private MockMvc mockMvc;

        @Autowired
        private WebApplicationContext context;

        @MockitoBean
        private GoogleCalendarService googleCalendarService;

        @BeforeEach
        void setup() {
                this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        }

        @Test
        void getEvents_Success() throws Exception {
                // Arrange
                List<CalendarEventDTO> mockEvents = Arrays.asList(
                                new CalendarEventDTO("1", "Meeting 1", "Description 1", "Location 1",
                                                "2023-01-01T10:00:00Z",
                                                "2023-01-01T11:00:00Z", false),
                                new CalendarEventDTO("2", "Meeting 2", "Description 2", "Location 2",
                                                "2023-01-02T14:00:00Z",
                                                "2023-01-02T15:00:00Z", false));

                when(googleCalendarService.fetchEvents(anyString(), isNull(), isNull(), isNull()))
                                .thenReturn(mockEvents);

                // Act & Assert
                mockMvc.perform(get("/api/v1/calendar/events")
                                .header("Authorization", "Bearer test-token"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(2))
                                .andExpect(jsonPath("$[0].id").value("1"))
                                .andExpect(jsonPath("$[0].summary").value("Meeting 1"))
                                .andExpect(jsonPath("$[1].id").value("2"))
                                .andExpect(jsonPath("$[1].summary").value("Meeting 2"));
        }

        @Test
        void getEvents_WithTimeParameters() throws Exception {
                // Arrange
                List<CalendarEventDTO> mockEvents = Arrays.asList(
                                new CalendarEventDTO("3", "Filtered Meeting", "Description", "Location",
                                                "2023-01-01T10:00:00Z",
                                                "2023-01-01T11:00:00Z", false));

                when(googleCalendarService.fetchEvents("test-token", "2023-01-01T00:00:00Z",
                                "2023-01-02T00:00:00Z", null))
                                .thenReturn(mockEvents);

                // Act & Assert
                mockMvc.perform(get("/api/v1/calendar/events")
                                .header("Authorization", "Bearer test-token")
                                .param("timeMin", "2023-01-01T00:00:00Z")
                                .param("timeMax", "2023-01-02T00:00:00Z"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].id").value("3"));
        }

        @Test
        void getEvents_MissingAuthorizationHeader() throws Exception {
                // Act & Assert
                mockMvc.perform(get("/api/v1/calendar/events"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void getEvents_ServiceThrowsException() throws Exception {
                // Arrange
                when(googleCalendarService.fetchEvents(anyString(), isNull(), isNull(), isNull()))
                                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));

                // Act & Assert
                mockMvc.perform(get("/api/v1/calendar/events")
                                .header("Authorization", "Bearer test-token"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getEvents_AllDayEvent() throws Exception {
                // Arrange
                List<CalendarEventDTO> mockEvents = Arrays.asList(
                                new CalendarEventDTO("4", "All Day Event", "Description", "Location", "2023-01-01",
                                                "2023-01-02",
                                                true));

                when(googleCalendarService.fetchEvents(anyString(), isNull(), isNull(), isNull()))
                                .thenReturn(mockEvents);

                // Act & Assert
                mockMvc.perform(get("/api/v1/calendar/events")
                                .header("Authorization", "Bearer test-token"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].allDay").value(true))
                                .andExpect(jsonPath("$[0].start").value("2023-01-01"))
                                .andExpect(jsonPath("$[0].end").value("2023-01-02"));
        }

        @Test
        void getCalendarList_Success() throws Exception {
                // Arrange
                List<com.soen390.flightcrew.model.CalendarInfoDTO> mockCalendars = Arrays.asList(
                                new com.soen390.flightcrew.model.CalendarInfoDTO("1", "Primary Calendar", "desc",
                                                "blue", true),
                                new com.soen390.flightcrew.model.CalendarInfoDTO("2", "Work Calendar", "desc2", "red",
                                                false));
                when(googleCalendarService.fetchCalendarList(anyString())).thenReturn(mockCalendars);

                // Act & Assert
                mockMvc.perform(get("/api/v1/calendar/list")
                                .header("Authorization", "Bearer test-token"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(2))
                                .andExpect(jsonPath("$[0].id").value("1"))
                                .andExpect(jsonPath("$[0].summary").value("Primary Calendar"));
        }

        @Test
        void getCalendarList_MissingAuthorizationHeader() throws Exception {
                mockMvc.perform(get("/api/v1/calendar/list"))
                                .andExpect(status().isBadRequest());
        }
}
