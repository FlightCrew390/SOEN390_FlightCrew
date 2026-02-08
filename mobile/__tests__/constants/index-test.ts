jest.mock("react-native", () => ({
    Platform: { OS: "ios" },
}));

import { COLORS, API_CONFIG, MAP_CONFIG } from "../../src/constants/index";

describe("constants/index", () => {
    describe("COLORS", () => {
        it("should export all theme colors", () => {
            expect(COLORS).toHaveProperty("concordiaMaroon");
            expect(COLORS).toHaveProperty("concordiaBlue");
            expect(COLORS).toHaveProperty("white");
            expect(COLORS).toHaveProperty("error");
        });
    });

    describe("API_CONFIG", () => {
        it("should have getBaseUrl function", () => {
            expect(typeof API_CONFIG.getBaseUrl).toBe("function");
        });

        it("should return localhost URL for iOS when no env var set", () => {
            delete process.env.EXPO_PUBLIC_BACKEND_IP;
            expect(API_CONFIG.getBaseUrl()).toBe("http://localhost:9090/api");
        });

        it("should use EXPO_PUBLIC_BACKEND_IP when set", () => {
            process.env.EXPO_PUBLIC_BACKEND_IP = "192.168.1.100";
            expect(API_CONFIG.getBaseUrl()).toBe("http://192.168.1.100:9090/api");
            delete process.env.EXPO_PUBLIC_BACKEND_IP;
        });

        it("should return 10.0.2.2 URL for Android when no env var set", () => {
            delete process.env.EXPO_PUBLIC_BACKEND_IP;
            jest.resetModules();
            jest.doMock("react-native", () => ({ Platform: { OS: "android" } }));
            const { API_CONFIG: AndroidAPI } = require("../../src/constants/index");
            expect(AndroidAPI.getBaseUrl()).toBe("http://10.0.2.2:9090/api");
        });
    });

    describe("MAP_CONFIG", () => {
        it("should export concordiaCenter with coordinates", () => {
            expect(MAP_CONFIG.concordiaCenter).toHaveProperty("latitude");
            expect(MAP_CONFIG.concordiaCenter).toHaveProperty("longitude");
            expect(MAP_CONFIG.concordiaCenter).toHaveProperty("latitudeDelta");
            expect(MAP_CONFIG.concordiaCenter).toHaveProperty("longitudeDelta");
        });

        it("should export defaultCampusRegion", () => {
            expect(MAP_CONFIG).toHaveProperty("defaultCampusRegion");
        });

        it("should export markerSize", () => {
            expect(MAP_CONFIG.markerSize).toEqual({ width: 40, height: 40 });
        });
    });
});
