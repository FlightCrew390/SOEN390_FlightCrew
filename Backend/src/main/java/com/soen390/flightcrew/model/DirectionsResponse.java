package com.soen390.flightcrew.model;

import java.util.List;

/**
 * API response for directions: encoded polyline and step-by-step instructions.
 */
public class DirectionsResponse {

    private String encodedPolyline;
    private List<DirectionStep> steps;

    public DirectionsResponse() {
    }

    public DirectionsResponse(String encodedPolyline, List<DirectionStep> steps) {
        this.encodedPolyline = encodedPolyline;
        this.steps = steps;
    }

    public String getEncodedPolyline() {
        return encodedPolyline;
    }

    public void setEncodedPolyline(String encodedPolyline) {
        this.encodedPolyline = encodedPolyline;
    }

    public List<DirectionStep> getSteps() {
        return steps;
    }

    public void setSteps(List<DirectionStep> steps) {
        this.steps = steps;
    }

    public static class DirectionStep {
        private String instruction;

        public DirectionStep() {
        }

        public DirectionStep(String instruction) {
            this.instruction = instruction;
        }

        public String getInstruction() {
            return instruction;
        }

        public void setInstruction(String instruction) {
            this.instruction = instruction;
        }
    }
}
