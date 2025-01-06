import { coordinatesFromLayout, Measurements } from "./geometry";
import { Layout } from "./stars";

export class FlagColors {
    public constructor(
        public outerStripes: string,
        public innerStripes: string,
        public canton: string,
        public stars: string = innerStripes,
    ) {}
}

// not an enum since the values are not numbers nor strings
export const FlagPalette = {
    DEFAULT: new FlagColors("#B22234", "#FFFFFF", "#3C3B6E"),
    SATURATED: new FlagColors("#FF0000", "#FFFFFF", "#0000FF"),
    BLACK_AND_GREY: new FlagColors("#000000", "#888888", "#000000"),
};

const SVG_NS = "http://www.w3.org/2000/svg";

export function getSVGFromLayout(measurements: Measurements, layout: Layout,
    {width, height, colors=FlagPalette.DEFAULT}: {width?: number|string, height?: number|string, colors?: FlagColors} = {},
): SVGSVGElement {
    const svg = document.createElementNS(SVG_NS, "svg");

    populateHeader(svg, width, height, measurements);
    addRectStripes(svg, measurements, colors);
    // use of addCantonFromLayout possible here
    addCantonFromCoordinates(svg, measurements, new Set(coordinatesFromLayout(layout)) as Iterable<[number, number]>, colors);

    return svg;
}

export function getSVGFromStarCoordinates(measurements: Measurements, starCoordinates: [number, number][]|Map<[number, number], number>,
    {width, height, colors=FlagPalette.DEFAULT}: {width?: number|string, height?: number|string, colors?: FlagColors} = {},
): SVGSVGElement {
    const svg = document.createElementNS(SVG_NS, "svg");

    populateHeader(svg, width, height, measurements);
    addRectStripes(svg, measurements, colors);
    addCantonFromCoordinates(svg, measurements, starCoordinates, colors);

    return svg;
}

function populateHeader(svg: SVGSVGElement, width: number|string|undefined, height: number|string|undefined, measurements: Measurements) {
    svg.setAttribute("xmlns", SVG_NS);
    // svg.setAttribute("version", "1.1");

    if (width !== undefined) {
        svg.setAttribute("width", width.toString());
    } else if (height !== undefined) {
        svg.setAttribute("height", height.toString());
    } else {
        svg.setAttribute("height", "100%");
    }

    svg.setAttribute("viewbox", `0 0 ${measurements.width} ${measurements.height}`);
    svg.appendChild(new Comment("Created with ts-spangled-banner (https://github.com/Gouvernathor/ts-spangled-banner)"));
}

function addRectStripes(svg: SVGSVGElement, measurements: Measurements, colors: FlagColors) {
    const nbWhiteStripes = (measurements.height / measurements.stripeHeight) / 2;
    const nbShortWhiteStripes = (measurements.cantonHeight / measurements.stripeHeight) / 2;
    const whiteID = colors === FlagPalette.DEFAULT ?
        "white_stripe" : "inner_stripe";

    const defs = svg.appendChild(document.createElementNS(SVG_NS, "defs"));
    const longWhite = defs.appendChild(document.createElementNS(SVG_NS, "rect"));
    longWhite.setAttribute("id", `long_${whiteID}`);
    longWhite.setAttribute("width", measurements.width.toString());
    longWhite.setAttribute("height", measurements.stripeHeight.toString());
    longWhite.setAttribute("fill", colors.innerStripes);
    const shortWhite = defs.appendChild(document.createElementNS(SVG_NS, "rect"));
    shortWhite.setAttribute("id", `short_${whiteID}`);
    shortWhite.setAttribute("width", (measurements.width-measurements.cantonWidth).toString());
    shortWhite.setAttribute("height", measurements.stripeHeight.toString());
    shortWhite.setAttribute("fill", colors.innerStripes);
    shortWhite.setAttribute("x", measurements.cantonWidth.toString());

    // red base
    const red = svg.appendChild(document.createElementNS(SVG_NS, "rect"));
    red.setAttribute("width", measurements.width.toString());
    red.setAttribute("height", measurements.height.toString());
    red.setAttribute("fill", colors.outerStripes);

    let stripeID = `short_${whiteID}`;
    for (let iStripe = 0; iStripe < nbWhiteStripes; iStripe++) {
        if (iStripe >= nbShortWhiteStripes) {
            stripeID = `short_${whiteID}`;
        }
        const use = svg.appendChild(document.createElementNS(SVG_NS, "use"));
        use.setAttribute("href", `#${stripeID}`);
        use.setAttribute("y", ((iStripe*2+1)*measurements.stripeHeight).toString());
    }
}

function addCantonFromLayout(svg: SVGSVGElement, measurements: Measurements, layout: Layout, colors: FlagColors) {
    throw new Error("Not implemented");
}

function addCantonFromCoordinates(svg: SVGSVGElement, measurements: Measurements, starCoordinates: Iterable<[number, number]>|Map<[number, number], number>, colors: FlagColors) {
    const canton = svg.appendChild(document.createElementNS(SVG_NS, "rect"));
    canton.setAttribute("width", measurements.cantonWidth.toString());
    canton.setAttribute("height", measurements.cantonHeight.toString());
    canton.setAttribute("fill", colors.canton);

    // if starCoordinates is empty, return
    if (((starCoordinates as Map<any, any>).size ?? (starCoordinates as any[]).length ?? 1) <= 0) {
        return;
    }

    const starPathD = getStarPath(measurements.starDiameter);
    const starPath = svg.appendChild(document.createElementNS(SVG_NS, "defs")).appendChild(document.createElementNS(SVG_NS, "path"));
    starPath.setAttribute("id", "star");
    starPath.setAttribute("d", starPathD);
    starPath.setAttribute("fill", colors.stars);

    const doScaling = starCoordinates instanceof Map;
    for (const [x, y] of doScaling ? starCoordinates.keys() : starCoordinates) {
        const use = svg.appendChild(document.createElementNS(SVG_NS, "use"));
        use.setAttribute("href", "#star");
        use.setAttribute("x", (x*measurements.cantonWidth).toString());
        use.setAttribute("y", (y*measurements.cantonHeight).toString());
        if (doScaling) {
            const starSize = starCoordinates.get([x, y])!;
            const starScale = starSize/measurements.starDiameter;
            if (starScale !== 1) {
                use.setAttribute("transform", `scale(${starScale})`);
            }
        }
    }
}

function getStarPath(radius: number) {
    const [top, topright, bottomright, bottomleft, topleft] =
        Array.from({length: 5}, (_, k) => [Math.cos(3*Math.PI/2 + k*2*Math.PI/5), Math.sin(3*Math.PI/2 + k*2*Math.PI/5)]);

    function c(x: number) {
        return radius*x;
    }

    const
        initialY = c(top[1]),
        firstMoveX = c(bottomright[0]-top[0]),
        firstMoveY = c(bottomright[1]-top[1]),
        secondMoveX = c(topleft[0]-bottomright[0]),
        secondMoveY = c(topleft[1]-bottomright[1]),
        thirdMoveX = c(topright[0]-topleft[0]),
        fourthMoveX = c(bottomleft[0]-topright[0]),
        fourthMoveY = c(bottomleft[1]-topright[1]);
    return [
        `m 0,${initialY}`,
        `l ${firstMoveX},${firstMoveY}`,
        `  ${secondMoveX},${secondMoveY}`,
        `h ${thirdMoveX}`,
        `l ${fourthMoveX},${fourthMoveY}`,
        'z',
    ].join("\n");
}
