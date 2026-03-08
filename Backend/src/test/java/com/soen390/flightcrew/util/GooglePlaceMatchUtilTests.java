package com.soen390.flightcrew.util;

import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GooglePlaceMatchUtilTests {

        @Test
        void findBestMatch_ExactNameMatch_ReturnsMatchingDestination() {
                // Arrange
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/Wrong", "Some Other Place"),
                                createDestination("places/Correct", "Henry F. Hall Building"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Henry F. Hall Building", destinations);

                // Assert
                assertNotNull(result);
                assertEquals("places/Correct", result.getPlaceId());
        }

        @Test
        void findBestMatch_PartialTargetContainedInDest_ReturnsMatch() {
                // Arrange — target "Hall" is contained in destination "Hall Building"
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/Wrong", "Random Place"),
                                createDestination("places/Match", "Hall Building"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Hall", destinations);

                // Assert
                assertNotNull(result);
                assertEquals("places/Match", result.getPlaceId());
        }

        @Test
        void findBestMatch_PartialDestContainedInTarget_ReturnsMatch() {
                // Arrange — destination name "Hall" is contained in target "Henry F. Hall
                // Building"
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/Wrong", "Random Place"),
                                createDestination("places/Match", "Hall"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Henry F. Hall Building", destinations);

                // Assert
                assertNotNull(result);
                assertEquals("places/Match", result.getPlaceId());
        }

        @Test
        void findBestMatch_CaseInsensitiveMatch_ReturnsMatch() {
                // Arrange
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/Wrong", "Unrelated"),
                                createDestination("places/Match", "café gentile"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Café Gentile", destinations);

                // Assert
                assertNotNull(result);
                assertEquals("places/Match", result.getPlaceId());
        }

        @Test
        void findBestMatch_NoMatch_ReturnsFirstDestination() {
                // Arrange — no destination names match the target
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/First", "Totally Unrelated"),
                                createDestination("places/Second", "Another Unrelated"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Hall Building", destinations);

                // Assert — falls back to first destination
                assertNotNull(result);
                assertEquals("places/First", result.getPlaceId());
        }

        @Test
        void findBestMatch_NullTargetName_ReturnsFirstDestination() {
                // Arrange
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/First", "Some Place"),
                                createDestination("places/Second", "Another Place"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                null, destinations);

                // Assert
                assertNotNull(result);
                assertEquals("places/First", result.getPlaceId());
        }

        @Test
        void findBestMatch_DestinationWithNullPrimary_SkipsIt() {
                // Arrange — first destination has null primary
                GoogleGeocodeResponse.Destination nullPrimaryDest = new GoogleGeocodeResponse.Destination();
                nullPrimaryDest.setPrimary(null);

                List<GoogleGeocodeResponse.Destination> destinations = new ArrayList<>();
                destinations.add(createDestination("places/First", "Default"));
                destinations.add(nullPrimaryDest);
                destinations.add(createDestination("places/Match", "Hall Building"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Hall Building", destinations);

                // Assert — skips null primary, matches third
                assertNotNull(result);
                assertEquals("places/Match", result.getPlaceId());
        }

        @Test
        void findBestMatch_DestinationWithNullDisplayName_SkipsIt() {
                // Arrange — first destination has null displayName
                GoogleGeocodeResponse.PrimaryPlace primaryNoName = new GoogleGeocodeResponse.PrimaryPlace();
                primaryNoName.setPlaceId("places/NoName");
                primaryNoName.setDisplayName(null);

                GoogleGeocodeResponse.Destination noNameDest = new GoogleGeocodeResponse.Destination();
                noNameDest.setPrimary(primaryNoName);

                List<GoogleGeocodeResponse.Destination> destinations = new ArrayList<>();
                destinations.add(createDestination("places/First", "Default"));
                destinations.add(noNameDest);
                destinations.add(createDestination("places/Match", "Hall Building"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Hall Building", destinations);

                // Assert — skips null displayName, matches third
                assertNotNull(result);
                assertEquals("places/Match", result.getPlaceId());
        }

        @Test
        void findBestMatch_SingleDestination_ReturnsThatDestination() {
                // Arrange
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/Only", "The Only One"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Something Else", destinations);

                // Assert
                assertNotNull(result);
                assertEquals("places/Only", result.getPlaceId());
        }

        @Test
        void findBestMatch_FirstDestinationMatches_ReturnsItImmediately() {
                // Arrange — first destination is a match
                List<GoogleGeocodeResponse.Destination> destinations = List.of(
                                createDestination("places/First", "Hall Building"),
                                createDestination("places/Second", "Another Hall Building"));

                // Act
                GoogleGeocodeResponse.PrimaryPlace result = GooglePlaceMatchUtil.findBestMatch(
                                "Hall Building", destinations);

                // Assert — returns first match
                assertNotNull(result);
                assertEquals("places/First", result.getPlaceId());
        }

        // --- Helper ---

        private GoogleGeocodeResponse.Destination createDestination(String placeId, String displayNameText) {
                GoogleGeocodeResponse.DisplayName displayName = new GoogleGeocodeResponse.DisplayName();
                displayName.setText(displayNameText);
                displayName.setLanguageCode("en");

                GoogleGeocodeResponse.PrimaryPlace primary = new GoogleGeocodeResponse.PrimaryPlace();
                primary.setPlaceId(placeId);
                primary.setDisplayName(displayName);

                GoogleGeocodeResponse.Destination dest = new GoogleGeocodeResponse.Destination();
                dest.setPrimary(primary);
                return dest;
        }
}
