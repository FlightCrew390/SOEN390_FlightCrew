import { renderHook, act } from "@testing-library/react-native";
import useMarkerCallout from "../../src/hooks/useMarkerCallout";

jest.mock("react-native-maps", () => ({ MapMarker: {} }));

const mockShowCallout = jest.fn();
const mockHideCallout = jest.fn();

/** Attach a mock MapMarker instance to the ref returned by the hook. */
function populateRef(ref: React.RefObject<any>) {
  (ref as any).current = {
    showCallout: mockShowCallout,
    hideCallout: mockHideCallout,
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useMarkerCallout", () => {
  it("returns a ref object", () => {
    const { result } = renderHook(() =>
      useMarkerCallout({ showCallout: false, hideCallout: false }),
    );
    expect(result.current).toHaveProperty("current");
  });

  it("calls showCallout after 900 ms when showCallout becomes true", () => {
    const { result, rerender } = renderHook(
      (props) => useMarkerCallout(props),
      { initialProps: { showCallout: false, hideCallout: false } },
    );

    populateRef(result.current);
    rerender({ showCallout: true, hideCallout: false });

    expect(mockShowCallout).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(900));
    expect(mockShowCallout).toHaveBeenCalledTimes(1);
  });

  it("does not call showCallout when showCallout is false", () => {
    const { result } = renderHook(() =>
      useMarkerCallout({ showCallout: false, hideCallout: false }),
    );

    populateRef(result.current);
    act(() => jest.advanceTimersByTime(1000));
    expect(mockShowCallout).not.toHaveBeenCalled();
  });

  it("cancels the timer when showCallout flips back to false before 900 ms", () => {
    const { result, rerender } = renderHook(
      (props) => useMarkerCallout(props),
      { initialProps: { showCallout: false, hideCallout: false } },
    );

    populateRef(result.current);
    rerender({ showCallout: true, hideCallout: false });
    act(() => jest.advanceTimersByTime(500));
    rerender({ showCallout: false, hideCallout: false });
    act(() => jest.advanceTimersByTime(500));
    expect(mockShowCallout).not.toHaveBeenCalled();
  });

  it("calls hideCallout immediately when hideCallout becomes true", () => {
    const { result, rerender } = renderHook(
      (props) => useMarkerCallout(props),
      { initialProps: { showCallout: false, hideCallout: false } },
    );

    populateRef(result.current);
    rerender({ showCallout: false, hideCallout: true });
    expect(mockHideCallout).toHaveBeenCalledTimes(1);
  });

  it("does not call hideCallout when hideCallout is false", () => {
    const { result } = renderHook(() =>
      useMarkerCallout({ showCallout: false, hideCallout: false }),
    );

    populateRef(result.current);
    expect(mockHideCallout).not.toHaveBeenCalled();
  });

  it("re-triggers showCallout when a dep changes", () => {
    const dep1 = { id: 1 };
    const dep2 = { id: 2 };

    const { result, rerender } = renderHook(
      (props) => useMarkerCallout(props),
      {
        initialProps: {
          showCallout: false,
          hideCallout: false,
          deps: [dep1] as React.DependencyList,
        },
      },
    );

    populateRef(result.current);

    // First trigger
    rerender({ showCallout: true, hideCallout: false, deps: [dep1] });
    act(() => jest.advanceTimersByTime(900));
    expect(mockShowCallout).toHaveBeenCalledTimes(1);

    // Dep changes → effect re-runs even though showCallout stays true
    rerender({ showCallout: true, hideCallout: false, deps: [dep2] });
    act(() => jest.advanceTimersByTime(900));
    expect(mockShowCallout).toHaveBeenCalledTimes(2);
  });
});
