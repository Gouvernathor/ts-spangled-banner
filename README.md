# Star-Spangled Banner

Generator of customizable SVG displays of the US flag

See the official math specifications in [Executive Order 10834](https://en.wikisource.org/wiki/Executive_Order_10834).

## Main module content

These are found in the main `star-spangled-banner` module.

`getSvg(nStars: number, FBSLParams: object, MGParams: object, GSFLParams: object)`

This function creates a stars-and-stripes flag as an SVG element which can then be integrated in the DOM. The parameters are as follows:

- `nStars: number`: the number of stars to display in the canton.

- `FBSLParams: object`, `MGParams: object` and `GSFLParams: object`: parameters passed through to the corresponding options parameters to `stars.findBestStarLayout`, `geometry.Measurements.generate` and `getSVGFromLayout`, respectively - except that `MGParams.starLayout` is ignored.

## Stars submodule content

These are found in the `star-spangled-banner/stars` module. This submodule generates layouts for the stars in the canton.

`Layout`

This is only a TypeScript type, not appearing in JS. It is equal to `[number, number, number, number]` and represents a way to arrange the stars in the flag's canton. More about what the numbers mean in the `generateStarLayouts` generator.

`LayoutKind`

  This is a string enum of the possible kinds of layouts for the stars in the canton.

  `LayoutKind.GRID`

  The stars are arranged in a grid, like the 24-star "Old Glory" flag, or the 48-star flag.

  `LayoutKind.SHORT_SANDWICH`

  Each shorter row of stars is between two longer rows, like the 50-star flag. It can be seen as two grids, one inside the other.

  `LayoutKind.LONG_SANDWICH`

  Each longer row of stars is between two shorter rows. It looks like a rectangle with the corners cut off.

  `LayoutKind.PAGODA`

  Each longer row of stars is followed by a shorter row, like the 45-star flag. It looks like a rectangle with two corners on the same long side cut off. (This module will always cut off the corners of the bottom side.)

  `LayoutKind.SIDE_PAGODA`

  The rows are all of the same length and there is an odd number of them, like the short-lived 49-star flag. Each longer column of stars is followed by a shorter column, and it looks like a rectangle with two corners on the same short side cut off, making it similar to the pagoda layout but on the side. (This module will always cut off the corners of the right side.)

  `LayoutKind.CUBE`

  The rows are all of the same length and there is an even number of them. It looks like a rectangle with two opposite corners cut off. (This module will always cut the top-right and bottom-left corners.)

  `LayoutKind.from_layout(layout: Layout): LayoutKind`

  This static method computes the layout kind from a given layout.

`generateStarLayouts(nStars: number, {kinds?: LayoutKind[]})`

  This is a generator that yield all the possible `Layout`s, in arbitrary order, for the given number of stars, optionally filtered by a set of layout kinds. If no kinds are passed, it is not filtered.

  The `(a, b, c, d)` layouts represent that `a` rows of `b` stars are interspersed with `c` rows of `d` stars.

`findbestStarLayout(nStars: number, {cantonFactor: number = 247/175, kinds?: LayoutKind[]}): Layout`

  This returns the best possible layout for the given number of stars and canton size ratio (width over height) defaulting to the official US canton ratio.

`findBestStarLayouts(nStars: number, {cantonFactor: number = 247/175, kinds?: LayoutKind[]}): Map<Layout, number>`

  The keys of the dict are the same layouts generated by `generateStarLayouts`, but sorted by how well it fits the given canton size ratio, the first the better. The values are arbitrary number values : the lower, the better it fits.

`DEFAULT_LAYOUT: Layout = [5, 6, 4, 5]`

  The layout of the official US flag. May be updated as new states get created.

## Geometry submodule content

These are found in the `star-spangled-banner/geometry` module. This submodule generates measurements and coordinates for elements of the flag.

`Measurements`

  This is a class that holds the measurements defining the geometry of the flag, similar to the government specifications described in Executive Order 10834.

  The constructor takes 10 parameters, all numbers in the same unit : `height`, `width`, `canton_height`, `canton_width`, `vertical_stars_margin`, `vertical_star_spacing`, `horizontal_stars_margin`, `horizontal_star_spacing`, `star_diameter` and `stripe_height`. They are available as attributes. `Measurements` instances are read-only and immutable.

  `Measurements.generate({stars_layout: Layout = stars.DEFAULT_LAYOUT, nStripes: number = 13, proportionalStarSize: boolean = true}) -> Measurements`

  This static method generates the specifications for a flag with the given layout (which includes the number of stars) and number of stripes. The `proportionalStarSize` parameter enables the star size to be scaled to fit best, in a way which makes the 50-star flag same as the official specifications. If false, the stars keep the same size as the 50-star flag regardless of the number of stars.

`coordinatesFromLayout(layout: Layout, {nStripes: number = 13, proportionalStarSize: boolean = true})`

  This generates `[x, y]` arrays of the coordinates each star inside the canton, relative to the canton size, in arbitrary order.

## SVG submodule content

These are found in the `star-spangled-banner/svg` module. This submodule generates SVG content from the measurements and coordinates.

`FlagColors`

  This is a class that holds the colors of a flag, stored as strings as supported by CSS. Instances are immutable, parameters are in the order the read-only attributes are documented:

  `FlagColors.outerStripes`

  The color of the outer stripes, which are red in the official flag.

  `FlagColors.innerStripes`

  The color of the inner stripes, which are white in the official flag.

  `FlagColors.canton`

  The color of the canton, which is blue in the official flag.

  `FlagColors.stars`

  The color of the stars, which defaults to the value of innerStripes.

`FlagPalette`

  This is an enumeration (though not a TypeScript enum) of built-in FlagColors presets.

  `FlagPalette.DEFAULT` : the official colors

  `FlagPalette.SATURATED` : the most saturated red, white and blue colors

`getSvgFromLayout(measurements: Measurements, layout: Layout, {width?: number|string, height?: number|string, colors: FlagColors = FlagPalette.DEFAULT})`

  This function generates an SVG Element representing a flag from the given measurements and star layout. The parameters are self-explanatory.

`getSvgFromStarCoordinates(measurements: Measurements, star_coordinates: [number, number][]|Map<[number, number], number>, {width?: number|string, height?: number|string, colors: FlagColors = FlagPalette.DEFAULT})`

  This function instead takes arbitrary star coordinates. They can be passed either as an array of x/y coordinates, or as a Map whose values are taken as being multipliers of the star size given in the `measurements` parameter.
