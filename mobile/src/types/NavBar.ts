import { Building } from "./Building";

type RootTabParamList = {
  home: undefined;
  location: undefined;
  search: undefined;
  menu: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  POIDetail: { building: Building };
};

export { RootTabParamList, RootStackParamList };
