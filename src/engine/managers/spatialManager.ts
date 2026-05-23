// spatialManager — handles spatial lookup for collision detection.
// Entities register/unregister themselves each frame after moving.

import { mapManager } from './mapManager';
import { strokeCircle } from '../utils/util';
import { IEntity }      from '../entities/IEntity';


let _nextSpatialID = 1; // all valid IDs are non-falsy (don't start at 0)
const _entities: IEntity[] = [];

export const spatialManager = {

    getNewSpatialID(): number {
        return _nextSpatialID++;
    },

    register(entity: IEntity): void {
        if (entity.entityType === "particle") return;
        _entities.push(entity);
    },

    unregister(entity: IEntity): void {
        const id = entity.getSpatialID();
        for (let i = 0; i < _entities.length; ++i) {
            if (id === _entities[i].getSpatialID()) {
                _entities.splice(i, 1);
                return;
            }
        }
    },

    findEntityInRange(posX: number, posY: number, radius: number): IEntity | undefined {
        for (const e of _entities) {
            if (e._isDeadNow) continue;
            const dx = e.getPos().posX - posX;
            const dy = e.getPos().posY - posY;
            const r  = e.getRadius() + radius;
            if (dx * dx + dy * dy <= r * r) return e;
        }
        return undefined;
    },

    findEntityInRangeByType(
        posX: number, posY: number, radius: number,
        types: string[],
        callerMapping?: [number, number, number][]
    ): IEntity | undefined {
        for (const e of _entities) {
            if (e._isDeadNow) continue;
            if (!types.includes(e.entityType ?? '')) continue;
            // Prefer the caller's shape, fall back to the entity's own shape, then plain circle
            const mapping = callerMapping ?? e.spatialMapping;
            if (mapping) {
                if (checkSpatialMapping(posX, posY, radius, mapping, e)) return e;
            } else {
                const dx = e.getPos().posX - posX;
                const dy = e.getPos().posY - posY;
                const r  = e.getRadius() + radius;
                if (dx * dx + dy * dy <= r * r) return e;
            }
        }
        return undefined;
    },

    render(ctx: CanvasRenderingContext2D): void {
        const old = ctx.strokeStyle;
        ctx.strokeStyle = "#8B0000";
        for (const e of _entities) {
            const px = e.getPos().posX - mapManager.screenLeft;
            const py = e.getPos().posY;
            if (e.spatialMapping) {
                for (const m of e.spatialMapping)
                    strokeCircle(ctx, px + m[0], py + m[1], e.getRadius() - m[2]);
            } else {
                strokeCircle(ctx, px, py, e.getRadius());
            }
        }
        ctx.strokeStyle = old;
    }

};

function checkSpatialMapping(
    posX: number, posY: number, radius: number,
    mapping: [number, number, number][],
    e: IEntity
): boolean {
    for (const m of mapping) {
        const dx = e.getPos().posX - posX + m[0];
        const dy = e.getPos().posY - posY + m[1];
        const r  = e.getRadius() + radius - m[2];
        if (dx * dx + dy * dy <= r * r) return true;
    }
    return false;
}
