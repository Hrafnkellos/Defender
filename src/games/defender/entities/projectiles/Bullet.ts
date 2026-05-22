import { Entity }           from '../../../../engine/entities/Entity';
import { spatialManager }   from '../../../../engine/managers/spatialManager';
import { KILL_ME_NOW }      from '../../../../engine/managers/entityManager';
import { mapManager }       from '../../../../engine/managers/mapManager';
import { NOMINAL_UPDATE_INTERVAL } from '../../../../engine/utils/config';
import { wrapRange }        from '../../../../engine/utils/util';
import { consts }           from '../../../../engine/utils/config';
import { sound }            from '../../sound';
import { sprites }          from '../../sprites';

export class Bullet extends Entity {
    rotation:   number = 0;
    velX:       number = 2;
    velY:       number = 2;
    entityType: string = "bullet";
    lifeSpan:   number = 1500 / NOMINAL_UPDATE_INTERVAL;

    constructor(descr: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr);
        this.fireSound();
    }

    fireSound():   void { sound?.playSound(0, 1, 0.1); }
    zappedSound(): void { sound?.playSound(1, 1, 0.1); }

    update(du: number): number | void {
        spatialManager.unregister(this);

        this.lifeSpan -= du;
        if (this.lifeSpan < 0) return KILL_ME_NOW;

        this.cx += this.velX * du;
        this.cy += this.velY * du;
        this.rotation = wrapRange(this.rotation + du, 0, consts.FULL_CIRCLE);

        const hit = this.findHitEntity();
        if (hit) {
            if (hit.takeBulletHit) hit.takeBulletHit.call(hit);
            return KILL_ME_NOW;
        }

        spatialManager.register(this);
    }

    getRadius(): number { return 4; }

    takeBulletHit(): void {
        this.kill();
        this.zappedSound();
    }

    render(ctx: CanvasRenderingContext2D): void {
        const fadeThresh = (1500 / NOMINAL_UPDATE_INTERVAL) / 3;
        if (this.lifeSpan < fadeThresh) ctx.globalAlpha = this.lifeSpan / fadeThresh;
        sprites.bullet?.drawCentredAt(ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation);
        ctx.globalAlpha = 1;
    }
}
