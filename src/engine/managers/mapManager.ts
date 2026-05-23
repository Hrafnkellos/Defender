// mapManager — world/screen coordinate translation, wrapping, landscape and minimap rendering.

import { g_canvas }       from '../utils/config';
import { drawLine, wrapRange, fillCircle } from '../utils/util';

// Game can set these callbacks during initialization to supply game-specific data.
let _shipPosFn:         (() => { posX: number; posY: number }) | null = null;
let _landscapeRenderFn: ((ctx: CanvasRenderingContext2D) => void) | null = null;

export const mapManager = {

    leftX:       0,
    rightX:      4000,
    screenLeft:  1550,
    screenRight: 2450,

    setShipPosFn(fn: () => { posX: number; posY: number }): void {
        _shipPosFn = fn;
    },

    setLandscapeRenderFn(fn: (ctx: CanvasRenderingContext2D) => void): void {
        _landscapeRenderFn = fn;
    },

    transposeToMinimap(mapX: number, mapY: number): { posX: number; posY: number } {
        const posX = (minimap.cx - minimap.half_width) + mapX * (minimap.half_width * 2) / this.rightX;
        const posY = mapY * (minimap.half_height * 2) / g_canvas.height;
        return { posX, posY };
    },

    transposeXToMinimap(mapX: number): number {
        return (minimap.cx - minimap.half_width) + mapX * (minimap.half_width * 2) / this.rightX;
    },

    transposeYToMinimap(mapY: number): number {
        return mapY * (minimap.half_height * 2) / g_canvas.height;
    },

    miniMapRender(ctx: CanvasRenderingContext2D, panelView = false): void {
        if (panelView) {
            this.debugMapRender(ctx);
            return;
        }
        const old = ctx.strokeStyle;
        ctx.strokeStyle = "#76EEC6";
        ctx.strokeRect(
            minimap.cx - minimap.half_width, 0,
            minimap.half_width * 2, minimap.half_height * 2
        );
        drawLine(ctx, 0, 100, g_canvas.width, 100, "#76EEC6");

        const frameLeft  = this.transposeToMinimap(1550, 0).posX;
        const frameRight = this.transposeToMinimap(2450, 0).posX;
        const lc         = "white";

        drawLine(ctx, frameLeft,  0,   frameLeft,  20,  lc);
        drawLine(ctx, frameLeft,  80,  frameLeft,  100, lc);
        drawLine(ctx, frameLeft,  0,   frameRight, 0,   lc);
        drawLine(ctx, frameRight, 0,   frameRight, 20,  lc);
        drawLine(ctx, frameRight, 80,  frameRight, 100, lc);
        drawLine(ctx, frameLeft,  100, frameRight, 100, lc);
        ctx.strokeStyle = old;
    },

    debugMapRender(_ctx: CanvasRenderingContext2D): void {
        // TODO: implement debug panel view
    },

    minimapFloor(): number {
        return 2 * minimap.half_height;
    },

    renderToMinimap(entity: { cx: number; cy: number; entityType?: string }, ctx: CanvasRenderingContext2D): void {
        if (entity.entityType === "particle" ||
            entity.entityType === "lazer"    ||
            entity.entityType === "alienbullet") return;

        const old = ctx.fillStyle;
        const shipPos = _shipPosFn ? _shipPosFn() : { posX: 2000, posY: 0 };

        const miniX = wrapRange(
            this.transposeXToMinimap(entity.cx - (shipPos.posX - 2000)),
            450 - minimap.half_width,
            450 + minimap.half_width
        );
        const miniY = this.transposeYToMinimap(entity.cy);

        switch (entity.entityType) {
            case "ship":       ctx.fillStyle = "white";  break;
            case "lander":     ctx.fillStyle = "green";  break;
            case "human":      ctx.fillStyle = "gray";   break;
            case "baiter":     ctx.fillStyle = "blue";   break;
            case "mothership": ctx.fillStyle = "purple"; break;
            case "swarmer":    ctx.fillStyle = "yellow"; break;
        }

        if (entity.entityType === "ship") fillCircle(ctx, 450, miniY, 2);
        else                              fillCircle(ctx, miniX, miniY, 2);

        ctx.fillStyle = old;
    },

    isOnScreen(cx: number): boolean {
        return cx > this.screenLeft && cx < this.screenRight;
    },

    landscapeRender(ctx: CanvasRenderingContext2D): void {
        if (_landscapeRenderFn) _landscapeRenderFn(ctx);
    },

    get minimap() { return minimap; }

};

// minimap metrics — computed once from canvas dimensions
const minimap = {
    cx:          g_canvas.width / 2,
    half_width:  g_canvas.width / 4,
    half_height: 50,
};
