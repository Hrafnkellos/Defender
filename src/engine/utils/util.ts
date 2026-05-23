// util.ts — engine utility functions. No game-specific dependencies.

import { mapManager } from '../managers/mapManager';

// ─── RANGES ──────────────────────────────────────────────────────────────────

export function clampRange(value: number, lowBound: number, highBound: number): number {
    if (value < lowBound)       value = lowBound;
    else if (value > highBound) value = highBound;
    return value;
}

export function wrapRange(value: number, lowBound: number, highBound: number): number {
    const range = highBound - lowBound;
    if (range <= 0) return value;
    // Use modulo for O(1) wrapping instead of loops
    value = ((value - lowBound) % range + range) % range + lowBound;
    return value;
}

export function isBetween(value: number, lowBound: number, highBound: number): boolean {
    return value >= lowBound && value <= highBound;
}

// ─── RANDOMNESS ──────────────────────────────────────────────────────────────

export function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randPoint(minX: number, maxX: number, minY: number, maxY: number): { posX: number; posY: number } {
    return {
        posX: randRange(minX, maxX),
        posY: randRange(minY, maxY),
    };
}

// ─── MISC ─────────────────────────────────────────────────────────────────────

export function square(x: number): number { return x * x; }

// ─── DISTANCES ────────────────────────────────────────────────────────────────

export function distSq(x1: number, y1: number, x2: number, y2: number): number {
    return square(x2 - x1) + square(y2 - y1);
}

export function wrappedDistSq(x1: number, y1: number, x2: number, y2: number, xWrap: number, yWrap: number): number {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    if (dx > xWrap / 2) dx = xWrap - dx;
    if (dy > yWrap / 2) dy = yWrap - dy;
    return square(dx) + square(dy);
}

// ─── AI ──────────────────────────────────────────────────────────────────────

interface EntityForMove {
    baseVel: number;
    hasHuman?: { isAbducted: boolean; abduct(e: EntityForMove): void } | false | undefined;
    getPos(): { posX: number; posY: number };
}

export function moveAround(
    travelPoint: { posX: number; posY: number },
    entity:      EntityForMove,
    top:         number,
    bottom:      number,
    margin:      number,
    position?:   { posX: number; posY: number }
): { velX: number; velY: number; travelPoint: { posX: number; posY: number } } {
    const pos     = position || entity.getPos();
    const xApprox = isBetween(pos.posX, travelPoint.posX - margin, travelPoint.posX + margin);
    const yApprox = isBetween(pos.posY, travelPoint.posY - margin, travelPoint.posY + margin);
    const result  = { velX: entity.baseVel, velY: entity.baseVel, travelPoint };

    if (xApprox && yApprox) {
        result.travelPoint = randPoint(0, mapManager.rightX, top, bottom);

        if (entity.hasHuman) {
            if (!entity.hasHuman.isAbducted) entity.hasHuman.abduct(entity);
            else entity.hasHuman = false;
            result.travelPoint = randPoint(0, mapManager.rightX, top, top);
        }
    } else {
        if (pos.posX < travelPoint.posX) result.velX =  result.velX;
        else                             result.velX = -result.velX;

        if (!yApprox) {
            if (pos.posY < travelPoint.posY) result.velY =  result.velY;
            else                             result.velY = -result.velY;
        } else {
            result.velY = 0;
        }
    }
    return result;
}

// ─── CANVAS OPS ───────────────────────────────────────────────────────────────

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
    const prev = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = prev;
}

export function strokeCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
}

export function strokeCircleStyle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string): void {
    const old = ctx.strokeStyle;
    ctx.strokeStyle = style;
    strokeCircle(ctx, x, y, r);
    ctx.strokeStyle = old;
}

export function wrappedStrokeCircleStyle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string): void {
    strokeCircleStyle(ctx, x,                           y, r, style);
    strokeCircleStyle(ctx, x - mapManager.rightX, y, r, style);
    strokeCircleStyle(ctx, x + mapManager.rightX, y, r, style);
}

export function fillCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

export function fillCircleStyle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string): void {
    const old = ctx.fillStyle;
    ctx.fillStyle = style;
    fillCircle(ctx, x, y, r);
    ctx.fillStyle = old;
}

export function WrappedFillCircleStyle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string): void {
    fillCircleStyle(ctx, x,                           y, r, style);
    fillCircleStyle(ctx, x - mapManager.rightX, y, r, style);
    fillCircleStyle(ctx, x + mapManager.rightX, y, r, style);
}

export function fillBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, style: string): void {
    const old = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = old;
}

export function drawLine(ctx: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number, style: string): void {
    const old = ctx.strokeStyle;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = old;
}

export function drawWrapedLine(ctx: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number, style: string): void {
    const mm = mapManager;
    if (sx > 3500 && ex < 1000) {
        drawLine(ctx, sx - mm.screenLeft - mm.rightX, sy, ex - mm.screenLeft,            ey, style);
        drawLine(ctx, sx - mm.screenLeft,             sy, ex - mm.screenLeft + mm.rightX, ey, style);
    } else if (sx < 500 && ex > 3000) {
        drawLine(ctx, sx - mm.screenLeft + mm.rightX, sy, ex - mm.screenLeft,            ey, style);
        drawLine(ctx, sx - mm.screenLeft,             sy, ex - mm.screenLeft - mm.rightX, ey, style);
    } else {
        drawLine(ctx, sx - mm.screenLeft, sy, ex - mm.screenLeft, ey, style);
    }
}

export function centeredStrokeBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, style: string): void {
    const old = ctx.strokeStyle;
    ctx.strokeStyle = style;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeStyle = old;
}

export function centeredFillBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, style: string): void {
    const old = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = old;
}

export function wrappedcenteredFillBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, style: string): void {
    centeredFillBox(ctx, x,                           y, w, h, style);
    centeredFillBox(ctx, x - mapManager.rightX, y, w, h, style);
    centeredFillBox(ctx, x + mapManager.rightX, y, w, h, style);
}

export function writeText(ctx: CanvasRenderingContext2D, font: string, style: string, text: string, x: number, y: number): void {
    const old = ctx.fillStyle;
    const m   = ctx.measureText(text);
    ctx.font      = font;
    ctx.fillStyle = style;
    ctx.fillText(text, x - m.width / 2, y);
    ctx.fillStyle = old;
}
