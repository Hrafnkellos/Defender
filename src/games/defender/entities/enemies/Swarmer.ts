import { Enemy }          from '../Enemy';
import { camera }     from '../../../../engine/managers/camera';
import { g_canvas }       from '../../../../engine/utils/config';
import { sprites }        from '../../sprites';
import { sound }          from '../../sound';
import { entityManager as defEntityManager } from '../../managers/entityManager';
import { gameManager }    from '../../managers/gameManager';

export class Swarmer extends Enemy {
    scale:          number  = 0.12;
    velX:           number  = 0;
    velY:           number  = 0;
    baseVel:        number  = 1;
    chanceOfFire:   number  = 0.05;
    points:         number  = 150;
    entityType:     string  = "swarmer";
    dispersionTime: number  = 300;
    travelPoint:    { posX: number; posY: number } = { posX: 0, posY: 0 };

    constructor(descr?: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr ?? {});
        const ship        = defEntityManager._ships[0];
        this.travelPoint  = { posX: ship.cx, posY: ship.cy };
        this.velX         = Math.cos(Math.random() * 6);
        this.velY         = -Math.sin(Math.random() * 6);
        this.rateOfFire   = 1000;
        this.timeToFire   = this.rateOfFire * Math.random();
    }

    death(): void { sound?.playSound(5, 1, 0.1); }

    getRadius(): number {
        return this.scale * ((sprites.defender3?.width ?? 256) / 2) * 0.9;
    }

    update(du: number): void {
        if (this._isDeadNow) {
            this.death();
            defEntityManager.generateParticleExplosion(this.cx, this.cy);
            return;
        }

        sprites.defender3?.animate();
        this.maybeFireBullet(du);

        const ship    = defEntityManager._ships[0];
        const mm      = camera;
        let   xTarget = ship.cx;

        if (this.cx > mm.rightX - mm.rightX / 4 && ship.cx < mm.rightX - mm.rightX * 3 / 4)
            xTarget += mm.rightX;

        this.travelPoint = { posX: xTarget, posY: ship.cy };

        if (this.dispersionTime > 0) {
            this.cx += this.velX * 5;
            if (this.cy <= g_canvas.height && this.cy > 100) this.cy += this.velY * 5;
            this.dispersionTime -= 8;
        } else {
            const rotation = Math.atan2(-(ship.cy - this.cy), ship.cx - this.cx);
            this.velX = Math.cos(rotation) * 5.5;
            this.velY = -Math.sin(rotation) * (Math.random() * 6);
            this.cx  += this.velX * du;
            this.cy  += this.velY * du;
        }

        this.wrapPosition();
    }

    takeBulletHit(): void {
        this.kill();
        gameManager.increaseScore(this.points);
    }

    render(ctx: CanvasRenderingContext2D): void {
        const sprite = sprites.defender3;
        if (!sprite) return;
        sprite.scale = this.scale;
        sprite.drawWrappedCentredAt(ctx, this.cx - camera.screenLeft, this.cy, (this as unknown as {rotation?: number}).rotation);
    }
}
