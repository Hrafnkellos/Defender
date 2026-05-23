import { Entity }           from '../../../../engine/entities/Entity';
import { camera }       from '../../../../engine/managers/camera';
import { NOMINAL_UPDATE_INTERVAL } from '../../../../engine/utils/config';
import { wrapRange }        from '../../../../engine/utils/util';
import { consts }           from '../../../../engine/utils/config';
import { sound }            from '../../sound';
import { sprites }          from '../../sprites';
import { IDefenderEntity }  from '../IDefenderEntity';

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

    update(du: number): void {
        this.lifeSpan -= du;
        if (this.lifeSpan < 0) { this.kill(); return; }

        this.cx += this.velX * du;
        this.cy += this.velY * du;
        this.rotation = wrapRange(this.rotation + du, 0, consts.FULL_CIRCLE);

        const hit = this.findHitEntity();
        if (hit) {
            (hit as IDefenderEntity).takeBulletHit?.();
            this.kill();
        }
    }

    getRadius(): number { return 4; }

    takeBulletHit(): void {
        this.kill();
        this.zappedSound();
    }

    render(ctx: CanvasRenderingContext2D): void {
        const fadeThresh = (1500 / NOMINAL_UPDATE_INTERVAL) / 3;
        if (this.lifeSpan < fadeThresh) ctx.globalAlpha = this.lifeSpan / fadeThresh;
        sprites.bullet?.drawCentredAt(ctx, this.cx - camera.screenLeft, this.cy, this.rotation);
        ctx.globalAlpha = 1;
    }
}
