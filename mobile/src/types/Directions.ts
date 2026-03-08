export type TravelMode = "WALK" | "DRIVE" | "BICYCLE" | "TRANSIT" | "SHUTTLE";

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
  travelMode?: string;
  transitDetails?: {
    stopDetails?: {
      arrivalStop?: { name?: string };
      departureStop?: { name?: string };
      arrivalTime?: string;
      departureTime?: string;
    };
    transitLine?: {
      name?: string;
      nameShort?: string;
      vehicle?: {
        name?: { text?: string };
        type?: string;
      };
    };
    stopCount?: number;
  };
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
  transitDetails?: TransitStepDetails;
}

/** Parsed transit details for a transit step */
export interface TransitStepDetails {
  departureStopName: string;
  arrivalStopName: string;
  departureTime: string;
  arrivalTime: string;
  lineName: string;
  lineShortName: string;
  vehicleType: string;
  vehicleName: string;
  stopCount: number;
}

export type DepartureOption = "now" | "depart_at" | "arrive_by";

export interface DepartureTimeConfig {
  option: DepartureOption;
  date: Date;
}

export const DEFAULT_DEPARTURE_CONFIG: DepartureTimeConfig = {
  option: "now",
  date: new Date(),
};
