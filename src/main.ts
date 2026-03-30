import { Measurements } from "./geometry.js";
import { findBestStarLayout, LayoutKind } from "./stars.js";
import { FlagColors, getSVGFromLayout } from "./svg.js";

interface GetSVGParams {
    cantonFactor: number;
    kinds: LayoutKind[];
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
    options: Partial<Readonly<GetSVGParams>>,
): SVGSVGElement;
/**
 * @deprecated
 * This version is deprecated. Please use the overload with the single options object instead.
 */
export function getSVG(nStars: number,
    FBSLParams?: { cantonFactor?: number, kinds?: readonly LayoutKind[] },
    MGParams?: { nStripes?: number, proportionalStarSize?: boolean },
    GSFLParams?: { width?: number|string, height?: number|string, colors?: FlagColors },
): SVGSVGElement;
export function getSVG(nStars: number,
    FBSLParams?: { cantonFactor?: number, kinds?: readonly LayoutKind[] },
    MGParams?: { nStripes?: number, proportionalStarSize?: boolean },
    GSFLParams?: { width?: number|string, height?: number|string, colors?: FlagColors },
): SVGSVGElement {
    const layout = findBestStarLayout(nStars, FBSLParams);
    const measurements = Measurements.generate({ starLayout: layout, ...FBSLParams, ...MGParams });
    return getSVGFromLayout(measurements, layout, { ...FBSLParams, ...GSFLParams });
}
