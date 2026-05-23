// Entity — base class for all game entities.
// Provides spatial registration, collision helpers, and position management.

import { IEntity }      from './IEntity';
import { spatialManager } from '../managers/spatialManager';
import { mapManager }              from '../managers/mapManager';
import { wrapRange, getRandomInt } from '../utils/util';

export class Entity implements IEntity {
    cx:           number = 0;
    cy:           number = 0;
    entityType?:  string;
    spatialMapping?: [number, number, number][];
    eFillStyle:   string = "#000000";
    _spatialID:   number = 0;
    _isDeadNow:   boolean = false;

    setup(descr: Partial<Record<string, unknown>> = {}): void {
        Object.assign(this, descr);
        this._spatialID = spatialManager.getNewSpatialID();
        this._isDeadNow = false;
        spatialManager.register(this);
    }

    setPos(cx: number, cy: number): void {
        this.cx = cx;
        this.cy = cy;
    }

    randomFillstyle(): void {
        this.eFillStyle = '#' +
            getRandomInt(0, 255).toString(16).padStart(2, '0') +
            getRandomInt(0, 255).toString(16).padStart(2, '0') +
            getRandomInt(0, 255).toString(16).padStart(2, '0');
    }

    getPos(): { posX: number; posY: number } {
        return { posX: this.cx, posY: this.cy };
    }

    getRadius(): number {
        return 1; // Default — subclasses must override
    }

    getSpatialID(): number {
        return this._spatialID;
    }

    kill(): void {
        this._isDeadNow = true;
    }

    findHitEntity(): IEntity | undefined {
        const pos = this.getPos();
        return spatialManager.findEntityInRange(pos.posX, pos.posY, this.getRadius());
    }

    findHitEntityType(types: string[], hasMapping?: boolean): IEntity | undefined {
        const pos = this.getPos();
        if (this.spatialMapping && hasMapping)
            return spatialManager.findEntityInRangeByType(
                pos.posX, pos.posY, this.getRadius(), types, this.spatialMapping
            );
        return spatialManager.findEntityInRangeByType(
            pos.posX, pos.posY, this.getRadius(), types
        );
    }

    isColliding(types?: string[]): IEntity | undefined {
        return this.findHitEntityType(types ?? []);
    }

    wrapPosition(): void {
        this.cx = wrapRange(this.cx, 0, mapManager.rightX);
    }

    // To be implemented by subclasses
    update(_du: number): void { }
    render(_ctx: CanvasRenderingContext2D): void { }
}
