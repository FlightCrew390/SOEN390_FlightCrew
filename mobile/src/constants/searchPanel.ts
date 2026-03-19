import { LocationType } from "../state/SearchPanelState";

export const LOCATION_OPTIONS: { key: LocationType; label: string }[] = [
  { key: "building", label: "Campus Building" },
  { key: "classroom", label: "Classroom" },
  { key: "cafe", label: "Cafe" },
  { key: "restaurant", label: "Restaurant" },
  { key: "pharmacy", label: "Pharmacy" },
  { key: "bar", label: "Bar" },
  { key: "grocery", label: "Grocery" },
];

export const RADIUS_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "No limit" },
  { value: 1, label: "1 km" },
  { value: 2, label: "2 km" },
  { value: 5, label: "5 km" },
];
