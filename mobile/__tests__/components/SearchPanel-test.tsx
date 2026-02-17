import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import SearchPanel from "../../src/components/LocationScreen/SearchPanel";

// Mock FontAwesome5
jest.mock("@expo/vector-icons/FontAwesome5", () => "FontAwesome5");

// Mock useBuildingData hook
const mockUseBuildingData = jest.fn();
jest.mock("../../src/hooks/useBuildingData", () => ({
    useBuildingData: () => mockUseBuildingData(),
}));

const mockBuildings = [
    {
        campus: "SGW",
        buildingCode: "H",
        buildingName: "Hall Building",
        buildingLongName: "Henry F. Hall Building",
        address: "1455 De Maisonneuve Blvd. W.",
        latitude: 45.4973,
        longitude: -73.5789,
    },
    {
        campus: "SGW",
        buildingCode: "EV",
        buildingName: "Engineering Building",
        buildingLongName:
            "Engineering, Computer Science and Visual Arts Integrated Complex",
        address: "1515 St. Catherine W.",
        latitude: 45.4957,
        longitude: -73.5773,
    },
];

const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSearch: jest.fn(),
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseBuildingData.mockReturnValue({
        buildings: mockBuildings,
        loading: false,
        error: null,
    });
});

test("returns null when visible is false", () => {
    const { toJSON } = render(<SearchPanel {...defaultProps} visible={false} />);

    expect(toJSON()).toBeNull();
});

test("renders panel content when visible", () => {
    render(<SearchPanel {...defaultProps} />);

    expect(screen.getByText("Location type")).toBeTruthy();
    expect(screen.getByText("Campus Building")).toBeTruthy();
    expect(
        screen.getByLabelText("Search building name"),
    ).toBeTruthy();
});

test("shows autocomplete results when typing a building name", () => {
    render(<SearchPanel {...defaultProps} />);

    const input = screen.getByLabelText("Search building name");
    fireEvent.changeText(input, "Hall");

    // Focus the input to ensure autocomplete shows
    fireEvent(input, "focus");

    expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
});

test("shows no buildings found when query has no match", () => {
    render(<SearchPanel {...defaultProps} />);

    const input = screen.getByLabelText("Search building name");
    fireEvent.changeText(input, "zzzzzzz");
    fireEvent(input, "focus");

    expect(screen.getByText("No buildings found.")).toBeTruthy();
});

test("selecting autocomplete result fills query", () => {
    render(<SearchPanel {...defaultProps} />);

    const input = screen.getByLabelText("Search building name");
    fireEvent.changeText(input, "Hall");
    fireEvent(input, "focus");

    const option = screen.getByLabelText("Henry F. Hall Building");
    fireEvent.press(option);

    // After pressing, the input value should be the long name
    expect(input.props.value).toBe("Henry F. Hall Building");
});

test("pressing Search button calls onSearch", () => {
    const onSearch = jest.fn();
    render(<SearchPanel {...defaultProps} onSearch={onSearch} />);

    const input = screen.getByLabelText("Search building name");
    fireEvent.changeText(input, "Hall");
    fireEvent(input, "focus");

    // Select an autocomplete result first to enable the button
    const option = screen.getByLabelText("Henry F. Hall Building");
    fireEvent.press(option);

    const searchBtn = screen.getByRole("button", { name: "Search" });
    fireEvent.press(searchBtn);

    expect(onSearch).toHaveBeenCalledWith("Henry F. Hall Building", "building");
});

test("search button is disabled when query is empty", () => {
    render(<SearchPanel {...defaultProps} />);

    const searchBtn = screen.getByRole("button", { name: "Search" });
    expect(searchBtn.props.accessibilityState?.disabled).toBe(true);
});

test("clear button clears the input", () => {
    render(<SearchPanel {...defaultProps} />);

    const input = screen.getByLabelText("Search building name");
    fireEvent.changeText(input, "Hall");

    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    fireEvent.press(clearBtn);

    expect(input.props.value).toBe("");
});

test("selecting location type from dropdown changes placeholder", () => {
    render(<SearchPanel {...defaultProps} />);

    // Open dropdown
    const dropdownBtn = screen.getByRole("button", {
        name: "Select location type",
    });
    fireEvent.press(dropdownBtn);

    // Select Restaurant
    const restaurantOption = screen.getByLabelText("Restaurant");
    fireEvent.press(restaurantOption);

    // Now placeholder should be Restaurant name
    const input = screen.getByLabelText("Search restaurant name");
    expect(input).toBeTruthy();
});
