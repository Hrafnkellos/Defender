// Defender-specific AI helpers. moveAround picks a new random travel point
// within world bounds when the entity reaches its current one, otherwise
// nudges velocity toward the current target.

import { camera }                  from '../../../engine/managers/camera';
import { isBetween, randPoint, wrapRange } from '../../../engine/utils/util';

// Wrap a world X coordinate around Defender's horizontal world bounds.
export function wrapX(x: number): number {
    return wrapRange(x, camera.leftX, camera.rightX);
}

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
        result.travelPoint = randPoint(0, camera.rightX, top, bottom);

        if (entity.hasHuman) {
            if (!entity.hasHuman.isAbducted) entity.hasHuman.abduct(entity);
            else entity.hasHuman = false;
            result.travelPoint = randPoint(0, camera.rightX, top, top);
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
