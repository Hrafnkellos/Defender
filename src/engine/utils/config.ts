// Canvas and context — fundamental browser globals used throughout
const _canvas = document.getElementById("myCanvas");
if (!(_canvas instanceof HTMLCanvasElement)) throw new Error("Canvas #myCanvas not found");
export const g_canvas = _canvas;
export const g_ctx    = g_canvas.getContext("2d") as CanvasRenderingContext2D;

// The "nominal interval" is what all time-based units are calibrated to.
// e.g. a velocity unit is "pixels per nominal interval"
export const NOMINAL_UPDATE_INTERVAL = 16.666;

// Multiply by this to convert seconds into "nominals"
export const SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;

// Mathematical constants
export const consts = {
    FULL_CIRCLE:        Math.PI * 2,
    RADIANS_PER_DEGREE: Math.PI / 180.0,
};
