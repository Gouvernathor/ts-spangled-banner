import { Measurements, MGOptions } from "./geometry.js";
import { FBSLOptions, findBestStarLayout } from "./stars.js";
import { getSVGFromLayout, GSVGOptions } from "./svg.js";

interface GetSVGOptions extends FBSLOptions, Omit<MGOptions, "starLayout">, GSVGOptions {
}

export function getSVG(nStars: number,
    options?: Partial<Readonly<GetSVGOptions>>,
): SVGSVGElement {
    const layout = findBestStarLayout(nStars, options);
    const measurements = Measurements.generate({ starLayout: layout, ...options });
    return getSVGFromLayout(measurements, layout, options);
}
