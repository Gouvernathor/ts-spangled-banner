import { Measurements, MGOptions } from "./geometry.js";
import { DEFAULT_LAYOUT, FBSLOptions, findBestStarLayout } from "./stars.js";
import { getSVGFromLayout, GSVGOptions } from "./svg.js";

const DEFAULT_N_STARS = DEFAULT_LAYOUT[0]*DEFAULT_LAYOUT[1] + DEFAULT_LAYOUT[2]*DEFAULT_LAYOUT[3];

interface GetSVGOptions extends FBSLOptions, MGOptions, GSVGOptions {
    nStars: number;
}

export function getSVG(options?: Partial<Readonly<GetSVGOptions>>): SVGSVGElement;
export function getSVG(nStars: number): SVGSVGElement;
export function getSVG(options: number|Partial<Readonly<GetSVGOptions>> = {}): SVGSVGElement {
    if (typeof options === "number") {
        options = { nStars: options };
    }
    const layout = options.starLayout ??
        findBestStarLayout(options.nStars ?? DEFAULT_N_STARS, options);
    const measurements = Measurements.generate({ starLayout: layout, ...options });
    return getSVGFromLayout(measurements, layout, options);
}
