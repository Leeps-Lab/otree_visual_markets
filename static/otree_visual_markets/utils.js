/**
 * utils.js - some useful functions for doing graphics stuff
 */

/**
 * linearly interpolate between two values
 *
 * @param {Number} a the low value to interpolate
 * @param {Number} b the high value to interpolate
 * @param {Number} t the mixing factor to choose between a and b
 */

 export const lerp = (a, b, t) => {
    return a + t * (b - a);
 }

/**
 * utility function to map a value from one range to another
 *
 * @param {Number} value the value to be re-mapped
 * @param {Number} lo1 the low value of the range to be mapped from
 * @param {Number} hi1 the high value of the range to be mapped from
 * @param {Number} lo2 the low value of the range to be mapped to
 * @param {Number} hi2 the high value of the range to be mapped to
 */
export const remap = (value, lo1, hi1, lo2, hi2) => {
    const t = (value - lo1) / (hi1 - lo1);
    return lerp(lo2, hi2, t);
};

/**
 * utility function to contain a value within some bounds
 *
 * @param {Number} value the value to be clamped
 * @param {Number} min the min value of the clamping range
 * @param {Number} max the max value of the clamping range
 */
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
}

/**
 * gets colors from the gradient defined by this.colorScheme
 * 0.0 <= percent <= 1.0
 * where percent = 1.0 gets the last color in color_stops and percent = 0.0 gets the first color in color_stops
 *
 * @param {*} percent value to get from gradient
 */
export const getGradientColor = percent => {
    const scheme = [
        [0, 0, 200],
        [60, 200, 80],
        [220, 220, 30],
        [220, 190, 100],
        [255, 0, 0],
    ];
    percent = clamp(percent, 0, 1);
    percent = percent * (scheme.length - 1)
    const low_index = Math.floor(percent)
    const high_index = Math.ceil(percent)
    percent = percent - low_index
    return [
        lerp(scheme[low_index][0], scheme[high_index][0], percent),
        lerp(scheme[low_index][1], scheme[high_index][1], percent),
        lerp(scheme[low_index][2], scheme[high_index][2], percent),
    ]
}
