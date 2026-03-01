export type TravelMode = "WALK" | "DRIVE" | "BICYCLE" | "TRANSIT";

export interface DirectionsResponse {
  routes: Route[];
}

export interface Route {
  legs: Leg[];
  polyline: EncodedPolyline;
  distanceMeters: number;
  duration: string; // e.g. "123s"
}

export interface Leg {
  distanceMeters: number;
  duration: string;
  steps: Step[];
}

export interface Step {
  distanceMeters: number;
  staticDuration: string;
  polyline: EncodedPolyline;
  navigationInstruction?: NavigationInstruction;
}

export interface NavigationInstruction {
  maneuver: string;
  instructions: string;
}

export interface EncodedPolyline {
  encodedPolyline: string;
}

/** Parsed route data ready for the UI */
export interface RouteInfo {
  coordinates: { latitude: number; longitude: number }[];
  distanceMeters: number;
  durationSeconds: number;
  steps: StepInfo[];
}

export interface StepInfo {
  distanceMeters: number;
  durationSeconds: number;
  instruction: string;
  maneuver: string;
  coordinates: { latitude: number; longitude: number }[];
}
