import { Measurements, MGOptions } from "./geometry.js";
import { FBSLOptions, findBestStarLayout } from "./stars.js";
import { getSVGFromLayout, GSVGOptions } from "./svg.js";

interface GetSVGOptions extends FBSLOptions, Omit<MGOptions, "starLayout">, GSVGOptions {
}

/**
 * This is the preferred overload.
 */
export function getSVG(nStars: number,
    options?: Partial<Readonly<GetSVGOptions>>,
): SVGSVGElement;
/**
 * @deprecated
 * This version is deprecated. Please use the overload with the single options object instead.
 */
export function getSVG(nStars: number,
    fbslOptions?: Partial<Readonly<FBSLOptions>>,
    mgOptions?: Partial<Readonly<Omit<MGOptions, "starLayout">>>,
    gsflOptions?: Partial<Readonly<GSVGOptions>>,
): SVGSVGElement;
export function getSVG(nStars: number,
    options?: Partial<Readonly<GetSVGOptions|FBSLOptions>>,
    mgOptions?: Partial<Readonly<Omit<MGOptions, "starLayout">>>,
    gsflOptions?: Partial<Readonly<GSVGOptions>>,
): SVGSVGElement {
    const layout = findBestStarLayout(nStars, options);
    const measurements = Measurements.generate({ starLayout: layout, ...options, ...mgOptions });
    return getSVGFromLayout(measurements, layout, { ...options, ...gsflOptions });
}
