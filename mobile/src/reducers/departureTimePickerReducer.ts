import {
  DepartureTimePickerAction,
  DepartureTimePickerState,
} from "../state/DepartureTimePickerState";

export const initialDepartureTimePickerState: DepartureTimePickerState = {
  showPicker: false,
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

    case "SHOW_PICKER":
      return { ...state, showPicker: true };

    case "HIDE_PICKER":
      return { ...state, showPicker: false };

    default:
      return state;
  }
}
