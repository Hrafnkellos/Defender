import { Entity }           from '../../../../engine/entities/Entity';
import { spatialManager }   from '../../../../engine/managers/spatialManager';
import { KILL_ME_NOW }      from '../../../../engine/managers/entityManager';
import { mapManager }       from '../../../../engine/managers/mapManager';
import { NOMINAL_UPDATE_INTERVAL } from '../../../../engine/utils/config';
import { wrapRange, drawWrapedLine, wrappedcenteredFillBox } from '../../../../engine/utils/util';
import { consts }           from '../../../../engine/utils/config';
import { sound }            from '../../sound';

export class Laser extends Entity {
    rotation:   number = 0;
    scx:        number = 200; // start-of-line x (set on construction)
    scy:        number = 200; // start-of-line y
    velX:       number = 2;
    velY:       number = 2;
    color:      string = '008080';
    entityType: string = "lazer"; // kept for spatialManager type checks
    spatialMapping: [number, number, number][] = [[0,0,0],[-8,0,0],[-16,0,0],[-24,0,0],[-32,0,0],[-40,0,0]];
    lifeSpan:   number = 650 / NOMINAL_UPDATE_INTERVAL;

    constructor(descr: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr);
        this.fireSound();
    }

    fireSound():   void { sound?.playSound(11, 1, 0.1); }
    zappedSound(): void { sound?.playSound(1,  1, 0.1); }

    update(du: number): number | void {
        spatialManager.unregister(this);

        this.lifeSpan -= du;
        if (this.lifeSpan < 0) return KILL_ME_NOW;

        this.cx += this.velX * du;
        this.rotation = wrapRange(this.rotation + du, 0, consts.FULL_CIRCLE);

        const hit = this.findHitEntityType(["lander", "human", "baiter", "mothership", "swarmer"], true);
        if (hit) {
            if (hit.takeBulletHit) hit.takeBulletHit.call(hit);
            hit.kill();
            return KILL_ME_NOW;
        }

        this.wrapPosition();
        this.randomFillstyle();
        spatialManager.register(this);
    }

    getRadius(): number { return 3; }

    takeBulletHit(): void {
        this.kill();
        this.zappedSound();
    }

    render(ctx: CanvasRenderingContext2D): void {
        const fadeThresh = (650 / NOMINAL_UPDATE_INTERVAL) / 3;
        if (this.lifeSpan < fadeThresh) ctx.globalAlpha = this.lifeSpan / fadeThresh;
        drawWrapedLine(ctx, this.scx, this.scy, this.cx, this.cy, this.eFillStyle);
        wrappedcenteredFillBox(ctx, this.cx - mapManager.screenLeft, this.cy, this.getRadius(), this.getRadius(), this.eFillStyle);
        ctx.globalAlpha = 1;
    }
}
