// Suppress act warnings for async hook testing
const originalError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("An update to") &&
      args[0].includes("inside a test was not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
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
