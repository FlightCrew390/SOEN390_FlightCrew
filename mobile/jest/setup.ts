// Suppress act warnings and fetch errors for async hook testing
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";

    // Suppress common test-related warnings
    if (
      message.includes("An update to") &&
      message.includes("inside a test was not wrapped in act")
    ) {
      return;
    }

    // Suppress fetch/API errors that occur during tests
    if (
      message.includes("error fetching") ||
      message.includes("Error fetching") ||
      message.includes("Failed to fetch") ||
      message.includes("Cannot connect") ||
      message.includes("Network") ||
      message.includes("HTTP error") ||
      message.includes("Indoor pathfinding failed") ||
      message.includes("Indoor routing failed") ||
      message.includes("IndoorPathfindingService") ||
      message.includes("Error in IndoorPathfindingService")
    ) {
      return;
    }

    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";

    // Suppress common warnings
    if (
      message.includes("Non-serializable values were found") ||
      message.includes("Accessing non-existent node")
    ) {
      return;
    }

    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock requestIdleCallback for React Native test environment
globalThis.requestIdleCallback = (callback: IdleRequestCallback) => {
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
};

globalThis.cancelIdleCallback = (id: number) => {
  clearTimeout(id);
};
