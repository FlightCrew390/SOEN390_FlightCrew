export interface DepartureTimePickerState {
  showPicker: boolean;
  expanded: boolean;
}

export type DepartureTimePickerAction =
  | { type: "TOGGLE_EXPANDED" }
  | { type: "COLLAPSE" }
  | { type: "SHOW_PICKER" }
  | { type: "HIDE_PICKER" };
