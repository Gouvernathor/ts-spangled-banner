import { describe, expect, it } from "vitest";
import { DEFAULT_LAYOUT, LayoutKind } from "../src/stars";

describe("The stars arrangement system", () => {
    describe("The default layout", () => {
        it("should be the current, 50-star layout", () => {
            expect(DEFAULT_LAYOUT).toEqual([5, 6, 4, 5]);
        });
    });

    describe("The LayoutKind enum", () => {
        it("should be a string enum with the correct values", () => {
            expect(LayoutKind.GRID).toBe("GRID");
            expect(LayoutKind.SHORT_SANDWICH).toBe("SHORT_SANDWICH");
            expect(LayoutKind.LONG_SANDWICH).toBe("LONG_SANDWICH");
            expect(LayoutKind.PAGODA).toBe("PAGODA");
            expect(LayoutKind.SIDE_PAGODA).toBe("SIDE_PAGODA");
            expect(LayoutKind.CUBE).toBe("CUBE");
        });
    });

    describe("The fromLayout method", () => {
        it("should return the correct LayoutKind for the default 50-star layout", () => {
            expect(LayoutKind.fromLayout(DEFAULT_LAYOUT))
                .toBe(LayoutKind.SHORT_SANDWICH);
        });

        it("should return the correct LayoutKind for various layouts", () => {
            // historical layouts
            // 13 stars
            expect(LayoutKind.fromLayout([3, 3, 2, 2]))
                .toBe(LayoutKind.SHORT_SANDWICH);
            expect(LayoutKind.fromLayout([1, 5, 2, 4]))
                .toBe(LayoutKind.LONG_SANDWICH);

            // 15
            expect(LayoutKind.fromLayout([3, 3, 2, 3]))
                .toBe(LayoutKind.SIDE_PAGODA);

            // 24
            expect(LayoutKind.fromLayout([4, 6, 0, 0]))
                .toBe(LayoutKind.GRID);

            // 25
            expect(LayoutKind.fromLayout([5, 5, 0, 0]))
                .toBe(LayoutKind.GRID);
            expect(LayoutKind.fromLayout([3, 5, 2, 5]))
                .toBe(LayoutKind.SIDE_PAGODA);

            // 45
            expect(LayoutKind.fromLayout([3, 8, 3, 7]))
                .toBe(LayoutKind.PAGODA);

            // 50
            expect(LayoutKind.fromLayout([5, 6, 4, 5]))
                .toBe(LayoutKind.SHORT_SANDWICH);
        });
    });
});
