import { Entity }           from '../../../../engine/entities/Entity';
import { camera }       from '../../../../engine/managers/camera';
import { NOMINAL_UPDATE_INTERVAL } from '../../../../engine/utils/config';
import { wrapRange }    from '../../../../engine/utils/util';
import { drawWrappedLine, wrappedCenteredFillBox } from '../../utils/draw';
import { wrapX }            from '../../utils/ai';
import { consts }           from '../../../../engine/utils/config';
import { sound }            from '../../sound';
import { IDefenderEntity }  from '../IDefenderEntity';

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

    update(du: number): void {
        this.lifeSpan -= du;
        if (this.lifeSpan < 0) { this.kill(); return; }

        this.cx += this.velX * du;
        this.rotation = wrapRange(this.rotation + du, 0, consts.FULL_CIRCLE);

        const hit = this.findHitEntityType(["lander", "human", "baiter", "mothership", "swarmer"], true);
        if (hit) {
            (hit as IDefenderEntity).takeBulletHit?.();
            hit.kill();
            this.kill();
            return;
        }

        this.cx = wrapX(this.cx);
        this.randomFillstyle();
    }

    getRadius(): number { return 3; }

    takeBulletHit(): void {
        this.kill();
        this.zappedSound();
    }

    render(ctx: CanvasRenderingContext2D): void {
        const fadeThresh = (650 / NOMINAL_UPDATE_INTERVAL) / 3;
        if (this.lifeSpan < fadeThresh) ctx.globalAlpha = this.lifeSpan / fadeThresh;
        drawWrappedLine(ctx, this.scx, this.scy, this.cx, this.cy, this.eFillStyle);
        wrappedCenteredFillBox(ctx, this.cx - camera.screenLeft, this.cy, this.getRadius(), this.getRadius(), this.eFillStyle);
        ctx.globalAlpha = 1;
    }
}
