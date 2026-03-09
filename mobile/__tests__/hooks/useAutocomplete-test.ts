import { renderHook } from "@testing-library/react-native";
import { useAutocomplete } from "../../src/hooks/useAutocomplete";
import {
  googlePlaceBuilding,
  hallBuilding,
  libraryBuilding,
  testBuildings,
} from "../fixtures";

describe("useAutocomplete", () => {
  // ── Early-exit cases ──

  it("returns empty array when locationType is not 'building'", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "Hall", "restaurant"),
    );
    expect(result.current).toEqual([]);
  });

  it("returns empty array when query is empty", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "", "building"),
    );
    expect(result.current).toEqual([]);
  });

  it("returns empty array when query is only whitespace", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "   ", "building"),
    );
    expect(result.current).toEqual([]);
  });

  // ── Matching by buildingName ──

  it("matches by buildingName prefix", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "Hall", "building"),
    );
    expect(result.current).toContainEqual(hallBuilding);
  });

  it("matches are case-insensitive", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "hall", "building"),
    );
    expect(result.current).toContainEqual(hallBuilding);
  });

  // ── Matching by buildingLongName ──

  it("matches by buildingLongName word prefix", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "Henry", "building"),
    );
    expect(result.current).toEqual([hallBuilding]);
  });

  // ── Matching by buildingCode ──

  it("matches by buildingCode", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "LB", "building"),
    );
    expect(result.current).toContainEqual(libraryBuilding);
  });

  // ── Matching by address ──

  it("matches by address", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "1455", "building"),
    );
    expect(result.current).toContainEqual(hallBuilding);
  });

  // ── Multi-word queries ──

  it("matches when all query words match field word prefixes", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "Hall Build", "building"),
    );
    expect(result.current).toContainEqual(hallBuilding);
  });

  it("returns empty when one query word does not match any field", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "Hall Nonexistent", "building"),
    );
    expect(result.current).not.toContainEqual(hallBuilding);
  });

  // ── Google Place Info matching ──

  it("matches by Google Place displayName", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "Concordia", "building"),
    );
    expect(result.current).toContainEqual(googlePlaceBuilding);
  });

  it("matches by Google Place formattedAddress", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "Sainte-Catherine", "building"),
    );
    expect(result.current).toContainEqual(googlePlaceBuilding);
  });

  // ── No match ──

  it("returns empty array when nothing matches", () => {
    const { result } = renderHook(() =>
      useAutocomplete(testBuildings, "zzzzz", "building"),
    );
    expect(result.current).toEqual([]);
  });

  // ── Empty buildings array ──

  it("returns empty array when buildings list is empty", () => {
    const { result } = renderHook(() =>
      useAutocomplete([], "Hall", "building"),
    );
    expect(result.current).toEqual([]);
  });

  // ── Memoization ──

  it("returns the same reference when inputs are unchanged", () => {
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useAutocomplete(testBuildings, query, "building"),
      { initialProps: { query: "Hall" } },
    );
    const first = result.current;
    rerender({ query: "Hall" });
    expect(result.current).toBe(first);
  });

  it("returns a new reference when query changes", () => {
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useAutocomplete(testBuildings, query, "building"),
      { initialProps: { query: "Hall" } },
    );
    const first = result.current;
    rerender({ query: "Library" });
    expect(result.current).not.toBe(first);
  });
});
