import { Entity }           from '../../../../engine/entities/Entity';
import { spatialManager }   from '../../../../engine/managers/spatialManager';
import { mapManager }       from '../../../../engine/managers/mapManager';
import { NOMINAL_UPDATE_INTERVAL } from '../../../../engine/utils/config';
import { wrapRange, wrappedCenteredFillBox } from '../../../../engine/utils/util';
import { consts }           from '../../../../engine/utils/config';

export class AlienBullet extends Entity {
    rotation:   number = 0;
    velX:       number = 2;
    velY:       number = 2;
    entityType: string = "alienbullet";
    lifeSpan:   number = 3000 / NOMINAL_UPDATE_INTERVAL;

    constructor(descr: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr);
    }

    update(du: number): void {
        spatialManager.unregister(this);

        this.lifeSpan -= du;
        if (this._isDeadNow || this.lifeSpan < 0) { this.kill(); return; }

        this.cx += this.velX * du;
        this.cy += this.velY * du;
        this.wrapPosition();
        this.rotation = wrapRange(this.rotation + du, 0, consts.FULL_CIRCLE);

        spatialManager.register(this);
    }

    getRadius(): number { return 4; }

    render(ctx: CanvasRenderingContext2D): void {
        const fadeThresh = (3000 / NOMINAL_UPDATE_INTERVAL) / 3;
        if (this.lifeSpan < fadeThresh) ctx.globalAlpha = this.lifeSpan / fadeThresh;
        wrappedCenteredFillBox(ctx, this.cx - mapManager.screenLeft, this.cy, this.getRadius(), this.getRadius(), "white");
        ctx.globalAlpha = 1;
    }
}
