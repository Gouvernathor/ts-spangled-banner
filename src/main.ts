import { Measurements, MGOptions } from "./geometry.js";
import { FBSLOptions, findBestStarLayout } from "./stars.js";
import { FlagColors, getSVGFromLayout, GSVGOptions } from "./svg.js";

interface GetSVGParams extends FBSLOptions, Omit<MGOptions, "starLayout">, GSVGOptions {
    nStripes: number;
    proportionalStarSize: boolean;
    width: number|string;
    height: number|string;
    colors: FlagColors;
}

/**
 * This is the preferred overload.
 */
export function getSVG(nStars: number,
    options?: Partial<Readonly<GetSVGParams>>,
): SVGSVGElement;
/**
 * @deprecated
 * This version is deprecated. Please use the overload with the single options object instead.
 */
export function getSVG(nStars: number,
    FBSLParams?: Partial<Readonly<FBSLOptions>>,
    MGParams?: Partial<Readonly<Omit<MGOptions, "starLayout">>>,
    GSFLParams?: Partial<Readonly<GSVGOptions>>,
): SVGSVGElement;
export function getSVG(nStars: number,
    FBSLParams?: Partial<Readonly<FBSLOptions>>,
    MGParams?: Partial<Readonly<Omit<MGOptions, "starLayout">>>,
    GSFLParams?: Partial<Readonly<GSVGOptions>>,
): SVGSVGElement {
    const layout = findBestStarLayout(nStars, FBSLParams);
    const measurements = Measurements.generate({ starLayout: layout, ...FBSLParams, ...MGParams });
    return getSVGFromLayout(measurements, layout, { ...FBSLParams, ...GSFLParams });
}
