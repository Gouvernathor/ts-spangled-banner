import { DEFAULT_LAYOUT, Layout, LayoutKind } from "./stars";

export class Measurements {
    public constructor(
        public height: number,
        public width: number,
        public cantonHeight: number,
        public cantonWidth: number,
        public verticalStarsMargin: number,
        public verticalStarSpacing: number,
        public horizontalStarsMargin: number,
        public horizontalStarSpacing: number,
        public starDiameter: number,
        public stripeHeight: number,
        private isNormalized = false,
    ) {}

    public check() {
        if (this.cantonHeight % this.stripeHeight) {
            throw new Error("The canton height should be a multiple of the stripe height.")
        }

        if (this.cantonWidth >= this.width) {
            throw new Error("The canton should not cover the whole width of the flag.")
        }

        if (this.cantonHeight > this.height/2) {
            throw new Error("The canton should not cover more than half of the height of the flag.")
        }
    }

    /**
     * Generates the government specifications for the flag.
     */
    public static generate({
        starLayout = DEFAULT_LAYOUT,
        nStripes = 13,
        proportionalStarSize = true,
    }): Measurements {
        const [a, b, c, d] = starLayout;
        const kindIsGrid = LayoutKind.fromLayout(starLayout) === LayoutKind.GRID;

        const A = 1;
        const B = A * 19/10;
        const C = A * Math.ceil(nStripes/2)/nStripes;
        const D = B * 2/5;
        let E: number, F: number, G: number, H: number;
        if (kindIsGrid) {
            H = D / (b+d+1/3);
            G = 2/3 * H;
            F = C / (a+c+1/3);
            E = 2/3 * F;
        } else {
            E = F = C / (a+c+1);
            G = H = D / (b+d+1);
        }

        const L = A / nStripes;
        let K: number;
        if (proportionalStarSize) {
            // take the closest distance between two stars
            // times a compat factor (so that the 50-star flag remains the same)
            const dists: number[] = kindIsGrid ?
                [
                    D / (b+1),
                    C / (a+1),
                    // the diagonal is always larger than the others
                ] :
                [
                    2 * D / (b + d + 1),
                    2 * C / (a + c + 1),
                    Math.sqrt((D/(b+d+1))**2 + (C/(a+c+1))**2),
                ];
            // magic constants lowered from Python, to keep under 2**53
            K = 6633010231827852 / 8960234537720383 * Math.min(...dists);
        } else {
            K = L * 4/5;
        }

        return new Measurements(A, B, C, D, E, F, G, H, K, L);
    }
}

export function* coordinatesFromLayout(layout: Layout,
    {nStripes = 13, proportionalStarSize = true} = {},
) {
    const [a, b, c, d] = layout;

    const measurements = Measurements.generate({starLayout: layout, nStripes, proportionalStarSize});
    const relativeXMargin = measurements.horizontalStarsMargin / measurements.cantonWidth;
    const relativeYMargin = measurements.verticalStarsMargin / measurements.cantonHeight;
    const relativeXSpacing = measurements.horizontalStarSpacing / measurements.cantonWidth;
    const relativeYSpacing = measurements.verticalStarSpacing / measurements.cantonHeight;

    switch (LayoutKind.fromLayout(layout)) {
        case LayoutKind.GRID:
            for (let y = 0; y < a; y++) {
                for (let x = 0; x < b; x++) {
                    yield [relativeXMargin + x * relativeXSpacing, relativeYMargin + y * relativeYSpacing] as const;
                }
            }
            break;

        case LayoutKind.SHORT_SANDWICH:
        case LayoutKind.PAGODA:
        case LayoutKind.SIDE_PAGODA:
        case LayoutKind.CUBE:
            // left-aligned rows
            for (let y = 0; y < a; y++) {
                for (let x = 0; x < b; x++) {
                    yield [relativeXMargin + 2*x * relativeXSpacing, relativeYMargin + 2*y * relativeYSpacing] as const;
                }
            }
            // right-aligned rows
            for (let y = 0; y < c; y++) {
                for (let x = 0; x < d; x++) {
                    yield [relativeXMargin + (2*x + 1) * relativeXSpacing, relativeYMargin + (2*y + 1) * relativeYSpacing] as const;
                }
            }
            break;

        case LayoutKind.LONG_SANDWICH:
            // long rows
            for (let y = 0; y < a; y++) {
                for (let x = 0; x < b; x++) {
                    yield [relativeXMargin + 2*x * relativeXSpacing, relativeYMargin + (2*y + 1) * relativeYSpacing] as const;
                }
            }
            // short rows
            for (let y = 0; y < c; y++) {
                for (let x = 0; x < d; x++) {
                    yield [relativeXMargin + (2*x + 1) * relativeXSpacing, relativeYMargin + 2*y * relativeYSpacing] as const;
                }
            }
            break;

        default:
            throw new Error(`Invalid layout: ${layout}`);
    }
}
