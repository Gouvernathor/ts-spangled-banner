import { Measurements } from "./geometry";
import { findBestStarLayout, LayoutKind } from "./stars";
import { FlagColors, getSVGFromLayout } from "./svg";

export function getSVG(nStars: number,
    FBSLParams?: {cantonFactor?: number, kinds?: LayoutKind[]},
    MGParams?: {nStripes?: number, proportionalStarSize?: boolean},
    GSFLParams?: {width?: number|string, height?: number|string, colors?: FlagColors},
): SVGSVGElement {
    const layout = findBestStarLayout(nStars, FBSLParams);
    const measurements = Measurements.generate({starLayout: layout, ...MGParams});
    return getSVGFromLayout(measurements, layout, GSFLParams);
}
