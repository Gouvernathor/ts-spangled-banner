/**
 * A layout is a tuple of four numbers, representing the number and size of star rows in the canton.
 *
 * The first two numbers describe the longer, wider rows of stars,
 * even when the first row is not one of the longer ones.
 *
 * For each pair of numbers, the first is the number of rows and the second is the number of stars in each row.
 * When all the rows are of the same length, the third and fourth numbers are zero.
 */
export type Layout = [number, number, number, number];

type Comparable = number;
function optimizeLayout(layout: Layout, cantonFactor: number): Comparable {
    const [a, b, c, d] = layout;
    if (!((c === 0) === (d === 0))) {
        throw new Error(`Invalid layout: ${layout}`);
    }
    return Math.abs((a + c + 1) * cantonFactor - (b + d + 1));
}

export const DEFAULT_LAYOUT: Layout = [5, 6, 4, 5];

export enum LayoutKind {
    /**
     * The stars are arranged in a grid,
     * like the 24-star "Old Glory" flag, or the 48-star flag.
     */
    GRID = "GRID",

    /**
     * Each shorter row of stars is between two longer rows, like the 50-star flag.
     *
     * It can be seen as two grids, one inside the other.
     */
    SHORT_SANDWICH = "SHORT_SANDWICH",

    /**
     * Each longer row of stars is between two shorter rows.
     *
     * It looks like a rectangle with the corners cut off.
     *
     * (The pair of numbers that represent the longer rows is put first,
     * even though the first row is one of the shorter ones.)
     */
    LONG_SANDWICH = "LONG_SANDWICH",

    /**
     * Each longer row of stars is followed by a shorter row, like the 45-star flag.
     *
     * It looks like a rectangle with two corners on the same long side cut off.
     *
     * (This module will always cut off the corners of the bottom side.)
     */
    PAGODA = "PAGODA",

    /**
     * The rows are all of the same length and there is an odd number of them,
     * like the short-lived 49-star flag.
     *
     * Each longer column of stars is followed by a shorter column,
     * and it looks like a rectangle with two corners on the same short side cut off,
     * making it similar to the pagoda layout but on the side.
     *
     * (This module will always cut off the corners of the right side.)
     */
    SIDE_PAGODA = "SIDE_PAGODA",

    /**
     * The rows are all of the same length and there is an even number of them.
     *
     * It looks like a rectangle with two opposite corners cut off.
     *
     * (This module will always cut the top-right and bottom-left corners.)
     */
    CUBE = "CUBE",
}

export namespace LayoutKind {
    export function fromLayout(layout: Layout): LayoutKind {
        const [a, b, c, d] = layout;

        if ((a === 0) === (b === 0) && (c === 0) === (d === 0)) {
            if (c === 0) {
                return LayoutKind.GRID;
            }
            if (d === b) {
                if (c === a-1) {
                    return LayoutKind.SIDE_PAGODA;
                }
                if (c === a) {
                    return LayoutKind.CUBE;
                }
            } else if (d === b - 1) {
                if (c === a - 1) {
                    return LayoutKind.SHORT_SANDWICH;
                }
                if (c === a + 1) {
                    return LayoutKind.LONG_SANDWICH;
                }
                if (c === a) {
                    return LayoutKind.PAGODA;
                }
            }
        }
        throw new Error(`Invalid layout: ${layout}`);
    }
}

/**
 * The results represent that a rows of b stars are interspersed with c rows of d stars.
 *
 * Returns a, b and c such that :
 * a*b + c*(b-1) = nstars
 * b >= d
 * c is in (0, a-1, a, a+1)
 * if c = 0, then d = 0
 * elif c = a-1 (this condition may be optional), d is in (b-1, b)
 * else, d = b-1
 *
 * In any such case, the number of rows is a + c and the number of columns is b + d.
 *
 * If kinds is passed, only the layouts of those kinds are returned.
 */
export function* generateStarLayouts(nStars: number, {kinds}: {kinds?: LayoutKind[]|undefined} = {}) {
    const kindsIsUndefined = kinds === undefined;
    if (!kindsIsUndefined) {
        // kinds = [];
        // TODO: list of all the kinds
        // TODO: decide if supporting casefold or not (presumably using toLowerCase)
    }
    const gridInKinds = kindsIsUndefined || kinds!.includes(LayoutKind.GRID);

    for (let a = 1; a <= nStars; a++) {
        for (let b = 0; b <= nStars/a; b++) {
            if (a*b > nStars) {
                break;
            }

            if (a*b === nStars) {
                if (gridInKinds) {
                    yield [a, b, 0, 0] as Layout;
                }
                break;
            }

            for (const c of [a-1, a, a+1]) {
                if (!c) {
                    continue;
                }

                const dOptions = [b-1];
                if ([a-1, a].includes(c)) {
                    dOptions.push(b);
                }

                for (const d of dOptions) {
                    if (a*b + c*d === nStars) {
                        if (kindsIsUndefined || kinds!.includes(LayoutKind.fromLayout([a, b, c, d]))) {
                            yield [a, b, c, d] as Layout;
                        }
                    }
                }
            }
        }
    }
}

const DEFAULT_CANTON_FACTOR = 247/175;

/**
 * The optimization key makes the stars layout fit as best possible in a canton of that ratio (width over height)
 */
export function findBestStarLayout(nStars: number,
    {cantonFactor = DEFAULT_CANTON_FACTOR, kinds}: {cantonFactor?: number, kinds?: LayoutKind[]} = {},
): Layout {
    let minLayout: Layout|undefined;
    let minValue = Infinity;
    for (const layout of generateStarLayouts(nStars, {kinds})) {
        const value = optimizeLayout(layout, cantonFactor)
        if (value < minValue) {
            minLayout = layout;
            minValue = value;
        }
    }
    if (minLayout === undefined) {
        throw new Error("No layout found");
    }
    return minLayout;
}

/**
 * The keys are layout tuples, the values are arbitrary comparable values: the lower, the better it fits.
 *
 * The entries are already sorted by the value, so by decreasing fittingness.
 */
export function findBestStarLayouts(nStars: number,
    {cantonFactor = DEFAULT_CANTON_FACTOR, kinds}: {cantonFactor?: number, kinds?: LayoutKind[]} = {},
): Map<Layout, Comparable> {
    return new Map(
        Array.from(generateStarLayouts(nStars, {kinds}))
            .map(l => [l, optimizeLayout(l, cantonFactor)] as const)
            .sort(([_l1, c1], [_l2, c2]) => c1-c2));
}
