export function getFloorLabel(buildingId: string, floor: number): string {
  if (buildingId === "MB" && floor === 2) return "S2";
  if (buildingId === "MB" && floor === 1) return "1";
  return `${floor}F`;
}
