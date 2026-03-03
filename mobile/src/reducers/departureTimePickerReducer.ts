import {
  DepartureTimePickerAction,
  DepartureTimePickerState,
} from "../state/DepartureTimePickerState";

export const initialDepartureTimePickerState: DepartureTimePickerState = {
  showDatePicker: false,
  showTimePicker: false,
  expanded: false,
};

export function departureTimePickerReducer(
  state: DepartureTimePickerState,
  action: DepartureTimePickerAction,
): DepartureTimePickerState {
  switch (action.type) {
    case "TOGGLE_EXPANDED":
      return { ...state, expanded: !state.expanded };

    case "COLLAPSE":
      return { ...state, expanded: false };

    case "SHOW_DATE_PICKER":
      return { ...state, showDatePicker: true };

    case "HIDE_DATE_PICKER":
      return { ...state, showDatePicker: false };

    case "SHOW_TIME_PICKER":
      return { ...state, showTimePicker: true };

    case "HIDE_TIME_PICKER":
      return { ...state, showTimePicker: false };

    default:
      return state;
  }
}
