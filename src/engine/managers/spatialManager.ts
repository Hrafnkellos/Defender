// spatialManager — type-bucketed entity store with O(1) register/unregister.
// Entities register once during setup() and unregister only at death; positions
// are read live from cx/cy at query time, so there's no need to re-register on
// move. Pass excludeId to skip the caller's own entity in collision queries.

import { camera }       from './camera';
import { strokeCircle } from '../utils/util';
import { IEntity }      from '../entities/IEntity';

const NO_TYPE = '_no_type';

let _nextSpatialID = 1; // all valid IDs are non-falsy (don't start at 0)
const _buckets: Record<string, IEntity[]> = {};
const _bucketIndex = new WeakMap<IEntity, number>();

function bucketKey(e: IEntity): string {
    return e.entityType ?? NO_TYPE;
}

function bucketFor(key: string): IEntity[] {
    let arr = _buckets[key];
    if (!arr) { arr = []; _buckets[key] = arr; }
    return arr;
}

export const spatialManager = {

    getNewSpatialID(): number {
        return _nextSpatialID++;
    },

    register(entity: IEntity): void {
        if (entity.entityType === "particle") return;
        if (_bucketIndex.has(entity)) return; // idempotent
        const arr = bucketFor(bucketKey(entity));
        _bucketIndex.set(entity, arr.length);
        arr.push(entity);
    },

    unregister(entity: IEntity): void {
        const arr = _buckets[bucketKey(entity)];
        if (!arr) return;
        const idx = _bucketIndex.get(entity);
        if (idx === undefined) return;
        const last = arr.length - 1;
        if (idx !== last) {
            const moved = arr[last];
            arr[idx] = moved;
            _bucketIndex.set(moved, idx);
        }
        arr.pop();
        _bucketIndex.delete(entity);
    },

    findEntityInRange(posX: number, posY: number, radius: number, excludeId = 0): IEntity | undefined {
        for (const key in _buckets) {
            const hit = scanBucket(_buckets[key], posX, posY, radius, excludeId);
            if (hit) return hit;
        }
        return undefined;
    },

    findEntityInRangeByType(
        posX: number, posY: number, radius: number,
        types: string[],
        callerMapping?: [number, number, number][],
        excludeId = 0,
    ): IEntity | undefined {
        for (const type of types) {
            const arr = _buckets[type];
            if (!arr) continue;
            for (const e of arr) {
                if (e._isDeadNow || e.getSpatialID() === excludeId) continue;
                // Prefer the caller's shape, fall back to the entity's own shape, then plain circle
                const mapping = callerMapping ?? e.spatialMapping;
                if (mapping) {
                    if (checkSpatialMapping(posX, posY, radius, mapping, e)) return e;
                } else if (circleHit(posX, posY, radius, e)) {
                    return e;
                }
            }
        }
        return undefined;
    },

    render(ctx: CanvasRenderingContext2D): void {
        const old = ctx.strokeStyle;
        ctx.strokeStyle = "#8B0000";
        for (const key in _buckets) {
            for (const e of _buckets[key]) {
                const px = e.getPos().posX - camera.screenLeft;
                const py = e.getPos().posY;
                if (e.spatialMapping) {
                    for (const m of e.spatialMapping)
                        strokeCircle(ctx, px + m[0], py + m[1], e.getRadius() - m[2]);
                } else {
                    strokeCircle(ctx, px, py, e.getRadius());
                }
            }
        }
        ctx.strokeStyle = old;
    }

};

function scanBucket(
    arr: IEntity[], posX: number, posY: number, radius: number, excludeId: number,
): IEntity | undefined {
    for (const e of arr) {
        if (e._isDeadNow || e.getSpatialID() === excludeId) continue;
        if (e.spatialMapping) {
            if (checkSpatialMapping(posX, posY, radius, e.spatialMapping, e)) return e;
        } else if (circleHit(posX, posY, radius, e)) {
            return e;
        }
    }
    return undefined;
}

function circleHit(posX: number, posY: number, radius: number, e: IEntity): boolean {
    const dx = e.getPos().posX - posX;
    const dy = e.getPos().posY - posY;
    const r  = e.getRadius() + radius;
    return dx * dx + dy * dy <= r * r;
}

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
