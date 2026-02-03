export interface Campus {
  id: string;
  name: string;
  shortName: string;
  location: {
    latitude: number;
    longitude: number;
  };
}
