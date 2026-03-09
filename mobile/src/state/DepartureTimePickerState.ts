export interface DepartureTimePickerState {
  showDatePicker: boolean;
  showTimePicker: boolean;
  expanded: boolean;
}

export type DepartureTimePickerAction =
  | { type: "TOGGLE_EXPANDED" }
  | { type: "COLLAPSE" }
  | { type: "SHOW_DATE_PICKER" }
  | { type: "HIDE_DATE_PICKER" }
  | { type: "SHOW_TIME_PICKER" }
  | { type: "HIDE_TIME_PICKER" };
