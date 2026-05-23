// Defender-specific draw helpers. They triple-draw at x, x-rightX, x+rightX
// so things near the world seam appear in both halves of the wrapping world.
// Engine code shouldn't depend on these — they're tied to the horizontal-wrap
// world model that Defender uses.

import { camera }           from '../../../engine/managers/camera';
import { Sprite }           from '../../../engine/rendering/Sprite';
import {
    centeredFillBox,
    drawLine,
    fillCircleStyle,
    strokeCircleStyle,
}                           from '../../../engine/utils/util';

export function drawWrappedSprite(
    sprite: Sprite, ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    rotation?: number, flipp?: number,
): void {
    sprite.drawCentredAt(ctx, cx,                cy, rotation, flipp);
    sprite.drawCentredAt(ctx, cx - camera.rightX, cy, rotation, flipp);
    sprite.drawCentredAt(ctx, cx + camera.rightX, cy, rotation, flipp);
}

export function wrappedStrokeCircleStyle(
    ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string,
): void {
    strokeCircleStyle(ctx, x,                 y, r, style);
    strokeCircleStyle(ctx, x - camera.rightX, y, r, style);
    strokeCircleStyle(ctx, x + camera.rightX, y, r, style);
}

export function wrappedFillCircleStyle(
    ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string,
): void {
    fillCircleStyle(ctx, x,                 y, r, style);
    fillCircleStyle(ctx, x - camera.rightX, y, r, style);
    fillCircleStyle(ctx, x + camera.rightX, y, r, style);
}

export function wrappedCenteredFillBox(
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, style: string,
): void {
    centeredFillBox(ctx, x,                 y, w, h, style);
    centeredFillBox(ctx, x - camera.rightX, y, w, h, style);
    centeredFillBox(ctx, x + camera.rightX, y, w, h, style);
}

export function drawWrappedLine(
    ctx: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number, style: string,
): void {
    const cam = camera;
    if (sx > 3500 && ex < 1000) {
        drawLine(ctx, sx - cam.screenLeft - cam.rightX, sy, ex - cam.screenLeft,             ey, style);
        drawLine(ctx, sx - cam.screenLeft,              sy, ex - cam.screenLeft + cam.rightX, ey, style);
    } else if (sx < 500 && ex > 3000) {
        drawLine(ctx, sx - cam.screenLeft + cam.rightX, sy, ex - cam.screenLeft,             ey, style);
        drawLine(ctx, sx - cam.screenLeft,              sy, ex - cam.screenLeft - cam.rightX, ey, style);
    } else {
        drawLine(ctx, sx - cam.screenLeft, sy, ex - cam.screenLeft, ey, style);
    }
}
