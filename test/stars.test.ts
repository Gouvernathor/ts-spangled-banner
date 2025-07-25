import { describe, expect, it } from "vitest";
import { DEFAULT_LAYOUT, findBestStarLayout, generateStarLayouts, Layout, LayoutKind } from "../src/stars";

function countStars([a, b, c, d]: Layout): number {
    return a*b + c*d;
}

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

    describe("The layout generators", () => {
        const randomNumberOfStars = Math.floor(Math.random() * 100) + 1;

        describe("generateStarLayouts", () => {
            it("should generate all the possible star layouts", () => {
                expect(Array.from(generateStarLayouts(50))).toHaveLength(17);
                expect(Array.from(generateStarLayouts(67))).toHaveLength(12);
            });

            it("should only generate valid layouts", () => {
                expect(() => Array.from(generateStarLayouts(randomNumberOfStars), LayoutKind.fromLayout))
                    .not.toThrow();
            });

            it("should only generate layouts of the specified star count", () => {
                expect(Array.from(generateStarLayouts(randomNumberOfStars), countStars).every(n => n === randomNumberOfStars))
                    .toBeTruthy();

                expect(Array.from(generateStarLayouts(50), countStars).every(n => n === 50))
                    .toBeTruthy();
            });

            // TODO maybe move to an utils module
            function* mapIterator<T, U>(iterable: Iterable<T>, fn: (value: T, index: number) => U): Iterable<U> {
                let i = 0;
                for (const value of iterable) {
                    yield fn(value, i++);
                }
            }
            function* filterIterator<T>(iterable: Iterable<T>, predicate: (value: T, index: number) => boolean): Iterable<T> {
                let i = 0;
                for (const value of iterable) {
                    if (predicate(value, i++)) {
                        yield value;
                    }
                }
            }
            /**
             * Generates all the possible sub-arrays of 0 to all the members passed,
             * in the order of the original array.
             */
            function* generateCombinations<T>(arr: readonly T[]): Iterable<T[]> {
                const n = arr.length;
                yield [];
                if (n > 0) {
                    for (let i = 0; i < n; i++) {
                        yield* mapIterator(
                            generateCombinations(
                                // arr.filter((_, j) => j !== i)),
                                arr.filter((_, j) => j < i)),
                            (subArr) => subArr.concat(arr[i]));
                    }
                }
            }
            it("should only generate layouts of the specified kind", () => {
                expect(new Set(Array.from(generateStarLayouts(60, {kinds: [LayoutKind.GRID]}), LayoutKind.fromLayout)))
                    .toEqual(new Set([LayoutKind.GRID]));

                for (const subArray of generateCombinations([
                    LayoutKind.GRID,
                    LayoutKind.SHORT_SANDWICH, LayoutKind.LONG_SANDWICH,
                    LayoutKind.PAGODA, LayoutKind.SIDE_PAGODA,
                    LayoutKind.CUBE,
                ])) {
                    expect(new Set(Array.from(generateStarLayouts(60, {kinds: subArray}), LayoutKind.fromLayout)))
                        .toEqual(new Set(subArray));
                }
            });
        });

        describe("findBestStarLayout", () => {
            it("should return the best layout for a given number of stars", () => {
                expect(findBestStarLayout(50))
                    .toEqual([5, 6, 4, 5]);
                expect(findBestStarLayout(69))
                    .toEqual([3, 12, 3, 11]);
            });

            expect(() => findBestStarLayout(0))
                .toThrow();

            it("should only generate layouts of the specified star count", () => {
                expect(countStars(findBestStarLayout(randomNumberOfStars)))
                    .toBe(randomNumberOfStars);
            });

            it("should only find layouts of the specified kinds", () => {
                expect(findBestStarLayout(50, { kinds: [LayoutKind.SHORT_SANDWICH] }))
                    .toEqual([5, 6, 4, 5]);
                expect(() => findBestStarLayout(50, { kinds: [LayoutKind.LONG_SANDWICH] }))
                    .toThrow();
            });
        });
    });
});
