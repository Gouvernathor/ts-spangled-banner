import { coordinatesFromLayout, Measurements } from "./geometry";
import { Layout } from "./stars";

export class FlagColors {
    public constructor(
        public readonly outerStripes: string,
        public readonly innerStripes: string,
        public readonly canton: string,
        public readonly stars: string = innerStripes,
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
    // addCantonFromLayout(svg, measurements, layout, colors); // possible alternative
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
            stripeID = `long_${whiteID}`;
        }
        const use = svg.appendChild(document.createElementNS(SVG_NS, "use"));
        use.setAttribute("href", `#${stripeID}`);
        use.setAttribute("y", ((iStripe*2+1)*measurements.stripeHeight).toString());
    }
}

function addCantonFromLayout(svg: SVGSVGElement, measurements: Measurements, layout: Layout, colors: FlagColors) {
    const canton = svg.appendChild(document.createElementNS(SVG_NS, "rect"));

    const [nbLgRows, lnLgRows, nbShRows, lnShRows] = layout;
    if (!(nbLgRows > 0 && lnLgRows > 0)) {
        return;
    }

    const lgRowID = `${lnLgRows}-row`;
    const shRowID = `${lnShRows}-row`;

    const pile: (SVGSVGElement|SVGGElement)[] = [svg]
    if (nbLgRows > 1) {
        const g = pile[0].appendChild(document.createElementNS(SVG_NS, "g"));
        g.setAttribute("id", lgRowID);
        pile.unshift(g);
    }
    if (nbShRows > 1) {
        const g = pile[0].appendChild(document.createElementNS(SVG_NS, "g"));
        g.setAttribute("id", shRowID);
        pile.unshift(g);
    }

    const starPathD = getStarPath(measurements.starDiameter/2);

    const starGroup = pile[0].appendChild(document.createElementNS(SVG_NS, "g"));
    starGroup.setAttribute("id", "star");
    const starPath = starGroup.appendChild(document.createElementNS(SVG_NS, "path"));
    starPath.setAttribute("x", measurements.horizontalStarsMargin.toString());
    starPath.setAttribute("y", measurements.verticalStarsMargin.toString());
    starPath.setAttribute("d", starPathD);
    starPath.setAttribute("fill", colors.stars);

    let i;
    if (nbShRows > 1) {
        for (i = 1; i < lnShRows; i++) {
            const use = pile[0].appendChild(document.createElementNS(SVG_NS, "use"));
            use.setAttribute("href", "#star");
            use.setAttribute("x", (measurements.horizontalStarSpacing*2*i).toString());
        }
        pile.shift();
    } else {
        i = 0;
    }

    if (nbLgRows > 1) {
        for (let j = 0; j < lnLgRows-lnShRows; j++) {
            const use = pile[0].appendChild(document.createElementNS(SVG_NS, "use"));
            use.setAttribute("href", "#star");
            use.setAttribute("x", (measurements.horizontalStarSpacing*2*(i+j+1)).toString());
        }
        pile.shift();
    }

    for (let k = 0; k < nbShRows; k++) {
        const use = svg.appendChild(document.createElementNS(SVG_NS, "use"));
        use.setAttribute("href", `#${shRowID}`);
        use.setAttribute("x", measurements.horizontalStarSpacing.toString());
        use.setAttribute("y", (measurements.verticalStarSpacing*(2*k+1)).toString());
    }

    for (let k = 1; k < nbLgRows; k++) {
        const use = svg.appendChild(document.createElementNS(SVG_NS, "use"));
        use.setAttribute("href", `#${lgRowID}`);
        use.setAttribute("y", (measurements.verticalStarSpacing*(2*k)).toString());
    }
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
    const [top, topright, bottomright, bottomleft, topleft] = Array.from({length: 5}, (_, k) => {
        const angle = 3*Math.PI/2 + k*2*Math.PI/5;
        return [Math.cos(angle), Math.sin(angle)];
    });

    const
        initialY = radius * (top[1]),
        firstMoveX = radius * (bottomright[0]-top[0]),
        firstMoveY = radius * (bottomright[1]-top[1]),
        secondMoveX = radius * (topleft[0]-bottomright[0]),
        secondMoveY = radius * (topleft[1]-bottomright[1]),
        thirdMoveX = radius * (topright[0]-topleft[0]),
        fourthMoveX = radius * (bottomleft[0]-topright[0]),
        fourthMoveY = radius * (bottomleft[1]-topright[1]);
    return [
        `m 0,${initialY}`,
        `l ${firstMoveX},${firstMoveY}`,
        `  ${secondMoveX},${secondMoveY}`,
        `h ${thirdMoveX}`,
        `l ${fourthMoveX},${fourthMoveY}`,
        'z',
    ].join("\n");
}
