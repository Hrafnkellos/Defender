import { Enemy }          from '../Enemy';
import { camera }     from '../../../../engine/managers/camera';
import { drawWrappedSprite } from '../../utils/draw';
import { g_canvas }       from '../../../../engine/utils/config';
import { randRange, randPoint } from '../../../../engine/utils/util';
import { moveAround, wrapX } from '../../utils/ai';
import { sprites }        from '../../sprites';
import { sound }          from '../../sound';
import { entityManager as defEntityManager } from '../../managers/entityManager';
import { gameManager }    from '../../managers/gameManager';

export class Mothership extends Enemy {
    scale:        number  = 0.23;
    velX:         number  = 0;
    velY:         number  = 0;
    baseVel:      number  = 1;
    chanceOfFire: number  = 0.05;
    points:       number  = 1000;
    entityType:   string  = "mothership";
    travelPoint:  { posX: number; posY: number } = { posX: 0, posY: 0 };

    constructor(descr?: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr ?? {});
        if (!this.cx) this.cx = randRange(0, camera.rightX - this.getRadius());
        this.cy          = randRange(100 + this.getRadius(), g_canvas.height);
        this.travelPoint = randPoint(0, camera.rightX, 100 + this.getRadius(), g_canvas.height);
        this.rateOfFire  = 400;
        this.timeToFire  = this.rateOfFire * Math.random();
    }

    death(): void { sound?.playSound(5, 1, 0.1); }

    getRadius(): number {
        return this.scale * ((sprites.defender2?.width ?? 256) / 2) * 0.9;
    }

    update(du: number): void {
        sprites.defender2?.animate();

        if (this._isDeadNow) {
            this.death();
            defEntityManager._generateSwarmers(this.cx, this.cy);
            defEntityManager.generateParticleExplosion(this.cx, this.cy);
            return;
        }

        const tv = moveAround(this.travelPoint, this as unknown as Parameters<typeof moveAround>[1], 100 + this.getRadius(), g_canvas.height, 3);
        this.velX        = tv.velX;
        this.velY        = tv.velY;
        this.travelPoint = tv.travelPoint;

        this.maybeFireBullet(du);

        this.cx += this.velX * du;
        this.cy += this.velY * du;
        this.cx = wrapX(this.cx);
    }

    takeBulletHit(): void {
        this.kill();
        gameManager.increaseScore(this.points);
    }

    render(ctx: CanvasRenderingContext2D): void {
        const sprite = sprites.defender2;
        if (!sprite) return;
        sprite.scale = this.scale;
        drawWrappedSprite(sprite, ctx, this.cx - camera.screenLeft, this.cy, (this as unknown as {rotation?: number}).rotation);
    }
}
