export interface Building {
  campus: string;
  buildingCode: string;
  buildingName: string;
  buildingLongName: string;
  address: string;
  latitude: number;
  longitude: number;
  polygons?: { latitude: number; longitude: number }[][];
  Google_Place_Info: {
    displayName: { text: string};
  };
}

export type Campus = "SGW" | "LOY";
