"use strict";

// util.js
//
// A module of utility functions, with no private elements to hide.
// An easy case; just return an object containing the public stuff.

var util = {


    // RANGES
    // ======

    clampRange: function (value, lowBound, highBound) {
        if (value < lowBound) {
            value = lowBound;
        } else if (value > highBound) {
            value = highBound;
        }
        return value;
    },

    wrapRange: function (value, lowBound, highBound) {
        while (value < lowBound) {
            value += (highBound - lowBound);
        }
        while (value > highBound) {
            value -= (highBound - lowBound);
        }
        return value;
    },

    isBetween: function (value, lowBound, highBound) {
        if (value < lowBound) { return false; }
        if (value > highBound) { return false; }
        return true;
    },

    // RANDOMNESS
    // ==========

    randRange: function (min, max) {
        return (min + Math.random() * (max - min));
    },

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randPoint: function (minX, maxX, minY, maxY) {
        return {
            posX: util.randRange(minX, maxX),
            posY: util.randRange(minY, maxY)
        };
    },

    // MISC
    // ====

    square: function (x) {
        return x * x;
    },

    // DISTANCES
    // =========

    distSq: function (x1, y1, x2, y2) {
        return this.square(x2 - x1) + this.square(y2 - y1);
    },

    wrappedDistSq: function (x1, y1, x2, y2, xWrap, yWrap) {
        var dx = Math.abs(x2 - x1),
            dy = Math.abs(y2 - y1);
        if (dx > xWrap / 2) {
            dx = xWrap - dx;
        };
        if (dy > yWrap / 2) {
            dy = yWrap - dy;
        }
        return this.square(dx) + this.square(dy);
    },

    // AI
    // ==========

    moveAround: function (travelPoint, entity, top, bottom, margin, position) {

        var pos = position || entity.getPos(),
            xApprox = this.isBetween(pos.posX, travelPoint.posX - margin, travelPoint.posX + margin),
            yApprox = this.isBetween(pos.posY, travelPoint.posY - margin, travelPoint.posY + margin),
            result = { velX: entity.baseVel, velY: entity.baseVel, travelPoint: travelPoint };

        if (xApprox && yApprox) {
            result.travelPoint = this.randPoint(0, mapManager.rightX, top, bottom);

            if (entity.hasHuman) {
                //Human falling trough the air may be tracked by a lander
                //but picked up ("abducted") by the ship, so in order to prevent the landers
                //from snatching humans off the ship we do this check.
                if (!entity.hasHuman.isAbducted) {
                    entity.hasHuman.abduct(entity);
                }
                else {
                    entity.hasHuman = false;
                }

                result.travelPoint = this.randPoint(0, mapManager.rightX, top, top);
            }
            else if (entity.entityType === "baiter") {
                var shipPos = entityManager.getShipPos();
                var yMin = shipPos.posY - 90;
                if (yMin < 100) yMin = 200;
                result.travelPoint = this.randPoint(shipPos.posX - 50, shipPos.posX + 50,
                    yMin, shipPos.posY - 80);
            }
        }
        else {
            if (entity.entityType === "baiter") {
                var shipPos = entityManager.getShipPos();
                var yMin = shipPos.posY - 90;
                if (yMin < 100) yMin = 200;
                result.travelPoint = this.randPoint(shipPos.posX - 50, shipPos.posX + 50,
                    yMin, shipPos.posY - 80);
            }
            if (pos.posX < travelPoint.posX) {
                result.velX = result.velX;
            }
            else {
                result.velX = -result.velX;
            }

            if (!yApprox) {
                if (pos.posY < travelPoint.posY) {
                    result.velY = result.velY;
                }
                else if (pos.posY > travelPoint.posY) {
                    result.velY = -result.velY;
                }
            }
            else {
                result.velY = 0;
            }
        }
        return result;
    },


    // CANVAS OPS
    // ==========

    clearCanvas: function (ctx) {
        var prevfillStyle = ctx.fillStyle;
        if (gameManager.bombVisuals < 0) ctx.fillStyle = "black";
        else {
            var colors = ["white", "black", "red", "green", "yellow", "blue", "purple"];
            ctx.fillStyle = colors[Math.floor(Math.random() * 7)];
            gameManager.bombVisuals -= 20;
        }
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = prevfillStyle;
    },

    strokeCircle: function (ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
    },

    strokeCircleStyle: function (ctx, x, y, r, style) {
        var oldStyle = ctx.strokeStyle;
        ctx.strokeStyle = style;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = oldStyle;
    },

    wrappedStrokeCircleStyle: function (ctx, x, y, r, style) {
        this.strokeCircleStyle(ctx, x, y, r, style);

        this.strokeCircleStyle(ctx, x - mapManager.rightX, y, r, style);
        this.strokeCircleStyle(ctx, x + mapManager.rightX, y, r, style);
    },

    fillCircle: function (ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    },

    fillCircleStyle: function (ctx, x, y, r, style) {
        var oldStyle = ctx.fillStyle;
        ctx.fillStyle = style;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = oldStyle;
    },
    WrappedFillCircleStyle: function (ctx, x, y, r, style) {
        this.fillCircleStyle(ctx, x, y, r, style);

        this.fillCircleStyle(ctx, x - mapManager.rightX, y, r, style);
        this.fillCircleStyle(ctx, x + mapManager.rightX, y, r, style);
    },

    fillBox: function (ctx, x, y, w, h, style) {
        var oldStyle = ctx.fillStyle;
        ctx.fillStyle = style;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = oldStyle;
    },

    drawLine: function (ctx, sx, sy, ex, ey, style) {
        var oldStyle = ctx.strokeStyle;
        ctx.strokeStyle = style;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = oldStyle;
    },

    drawWrapedLine: function (ctx, sx, sy, ex, ey, style) {
        if (sx > 3500 && ex < 1000) {//rightmost
            this.drawLine(ctx, sx - mapManager.screenLeft - mapManager.rightX, sy, ex - mapManager.screenLeft, ey, style);
            this.drawLine(ctx, sx - mapManager.screenLeft, sy, ex - mapManager.screenLeft + mapManager.rightX, ey, style);
        }
        else if (sx < 500 && ex > 3000) {//leftmost
            this.drawLine(ctx, sx - mapManager.screenLeft + mapManager.rightX, sy, ex - mapManager.screenLeft, ey, style);
            this.drawLine(ctx, sx - mapManager.screenLeft, sy, ex - mapManager.screenLeft - mapManager.rightX, ey, style);
        }
        else this.drawLine(ctx, sx - mapManager.screenLeft, sy, ex - mapManager.screenLeft, ey, style);
    },

    centeredStrokeBox: function (ctx, x, y, w, h, style) {
        var oldStyle = ctx.fillStyle;
        ctx.strokeStyle = style;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        ctx.strokeStyle = oldStyle;
    },

    centeredFillBox: function (ctx, x, y, w, h, style) {
        var oldStyle = ctx.fillStyle;
        ctx.fillStyle = style;
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.fillStyle = oldStyle;
    },

    wrappedcenteredFillBox: function (ctx, x, y, w, h, style) {
        var oldStyle = ctx.fillStyle;
        this.centeredFillBox(ctx, x, y, w, h, style);

        this.centeredFillBox(ctx, x - mapManager.rightX, y, w, h, style);
        this.centeredFillBox(ctx, x + mapManager.rightX, y, w, h, style);
        ctx.fillStyle = oldStyle;
    },

    writeText: function (ctx, font, style, text, x, y) {
        var oldStyle = ctx.fillStyle;
        var m = ctx.measureText(text)
        ctx.font = font;
        ctx.fillStyle = style;
        ctx.fillText(text, x - m.width / 2, y);
        ctx.fillStyle = oldStyle;
    }

};
