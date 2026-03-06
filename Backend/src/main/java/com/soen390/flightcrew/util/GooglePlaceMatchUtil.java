package com.soen390.flightcrew.util;

import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import java.util.List;

/**
 * Utility class for matching a target name against Google geocode destinations.
 * Shared by both PointOfInterestService and ConcordiaController.
 */
public final class GooglePlaceMatchUtil {

    private GooglePlaceMatchUtil() {
        // Utility class — prevent instantiation
    }

    /**
     * Finds the best-matching {@link GoogleGeocodeResponse.PrimaryPlace} for the
     * given target name from a list of destinations. Returns the first destination
     * whose display name contains the target (or vice-versa), falling back to the
     * first destination if no substring match is found.
     */
    public static GoogleGeocodeResponse.PrimaryPlace findBestMatch(String targetName,
            List<GoogleGeocodeResponse.Destination> destinations) {
        GoogleGeocodeResponse.PrimaryPlace bestMatch = destinations.get(0).getPrimary();
        if (targetName == null) {
            return bestMatch;
        }

        for (GoogleGeocodeResponse.Destination dest : destinations) {
            if (dest.getPrimary() == null || dest.getPrimary().getDisplayName() == null) {
                continue;
            }
            String destName = dest.getPrimary().getDisplayName().getText();
            if (destName.toLowerCase().contains(targetName.toLowerCase()) ||
                    targetName.toLowerCase().contains(destName.toLowerCase())) {
                return dest.getPrimary();
            }
        }
        return bestMatch;
    }
}
