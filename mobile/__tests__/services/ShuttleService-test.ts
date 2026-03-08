import { ShuttleService } from "../../src/services/ShuttleService";

describe("ShuttleService", () => {
    describe("fetchSchedule", () => {
        it("returns Mon-Thu schedule for MONDAY", async () => {
            const result = await ShuttleService.fetchSchedule("MONDAY");
            expect(result.day).toBe("MONDAY");
            expect(result.no_service).toBe(false);
            expect(result.service_start).toBeTruthy();
            expect(result.departures.length).toBeGreaterThan(0);
        });

        it("returns Friday schedule for FRIDAY", async () => {
            const result = await ShuttleService.fetchSchedule("FRIDAY");
            expect(result.day).toBe("FRIDAY");
            expect(result.no_service).toBe(false);
            expect(result.departures.length).toBeGreaterThan(0);
        });

        it("returns no service for SATURDAY", async () => {
            const result = await ShuttleService.fetchSchedule("SATURDAY");
            expect(result.no_service).toBe(true);
            expect(result.departures).toEqual([]);
        });

        it("returns no service for SUNDAY", async () => {
            const result = await ShuttleService.fetchSchedule("SUNDAY");
            expect(result.no_service).toBe(true);
            expect(result.departures).toEqual([]);
        });

        it("has departures with loyola_departure and sgw_departure fields", async () => {
            const result = await ShuttleService.fetchSchedule("TUESDAY");
            const first = result.departures[0];
            expect(first).toHaveProperty("loyola_departure");
            expect(first).toHaveProperty("sgw_departure");
            expect(first).toHaveProperty("last_bus");
        });

        it("marks last bus entries correctly", async () => {
            const result = await ShuttleService.fetchSchedule("WEDNESDAY");
            const lastBusEntries = result.departures.filter((d) => d.last_bus);
            expect(lastBusEntries.length).toBeGreaterThan(0);
        });
    });

    describe("fetchRoute", () => {
        it("returns route with both direction polylines", async () => {
            const result = await ShuttleService.fetchRoute();
            expect(result.sgw_to_loyola.length).toBeGreaterThan(0);
            expect(result.loyola_to_sgw.length).toBeGreaterThan(0);
            expect(result.duration).toBeTruthy();
            expect(result.distance).toBeTruthy();
        });

        it("loyola_to_sgw is reverse of sgw_to_loyola", async () => {
            const result = await ShuttleService.fetchRoute();
            const reversed = [...result.sgw_to_loyola].reverse();
            expect(result.loyola_to_sgw).toEqual(reversed);
        });

        it("has valid coordinates", async () => {
            const result = await ShuttleService.fetchRoute();
            for (const coord of result.sgw_to_loyola) {
                expect(coord.latitude).toBeGreaterThan(45);
                expect(coord.longitude).toBeLessThan(-73);
            }
        });
    });
});
