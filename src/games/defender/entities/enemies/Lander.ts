import { Enemy }          from '../Enemy';
import { spatialManager } from '../../../../engine/managers/spatialManager';
import { camera }     from '../../../../engine/managers/camera';
import { g_canvas }       from '../../../../engine/utils/config';
import { randRange, randPoint, moveAround } from '../../../../engine/utils/util';
import { sprites }        from '../../sprites';
import { sound }          from '../../sound';
import { entityManager as defEntityManager } from '../../managers/entityManager';
import { gameManager }    from '../../managers/gameManager';

export class Lander extends Enemy {
    scale:        number  = 0.3;
    velX:         number  = 0;
    velY:         number  = 0;
    baseVel:      number  = 2;
    mutated:      boolean = false;
    chanceOfFire: number  = 0.05;
    points:       number  = 150;
    entityType:   string  = "lander";
    hasHuman:     unknown = undefined;
    travelPoint:  { posX: number; posY: number } = { posX: 0, posY: 0 };

    constructor(descr?: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr ?? {});
        this.cx          = randRange(0, camera.rightX - this.getRadius());
        this.cy          = randRange(100 + this.getRadius(), g_canvas.height);
        this.travelPoint = randPoint(0, camera.rightX, 100 + this.getRadius(), g_canvas.height - this.getRadius());
        this.rateOfFire  = 1000;
        this.timeToFire  = this.rateOfFire * Math.random();
    }

    death(): void { sound?.playSound(5, 1, 0.1); }

    getRadius(): number {
        const sprite = this.mutated ? sprites.mutant : sprites.lander;
        return this.scale * ((sprite?.width ?? 128) / 2) * 0.9;
    }

    update(du: number): void {
        const sprite = this.mutated ? sprites.mutant : sprites.lander;
        sprite?.animate();

        if (this._isDeadNow) {
            this.death();
            this.releaseHuman();
            defEntityManager.generateParticleExplosion(this.cx, this.cy);
            return;
        }

        const top = 100 + this.getRadius();
        if (this.cy - this.getRadius() <= top && this.hasHuman && !this.mutated) this.mutate();

        const tv = moveAround(this.travelPoint, this as unknown as Parameters<typeof moveAround>[1], top, g_canvas.height, 3);
        this.velX        = tv.velX;
        this.velY        = tv.velY;
        this.travelPoint = tv.travelPoint;

        if (!this.hasHuman && this.baseVel < 2) this.baseVel = 2;

        if (!this.mutated && !this.hasHuman) {
            const human = spatialManager.findEntityInRangeByType(this.getPos().posX, this.getPos().posY, 100, ["human"]);
            if (human && human.entityType === "human" && !(human as unknown as {isTracked: boolean}).isTracked) {
                (human as unknown as {isTracked: boolean}).isTracked  = true;
                this.hasHuman    = human;
                this.travelPoint = { posX: human.getPos().posX, posY: human.getPos().posY - (human as unknown as {getRadius(): number}).getRadius() - this.getRadius() };
                this.baseVel     = 0.75;
            }
        }

        if (!this.mutated && this.hasHuman && !(this.hasHuman as unknown as {isAbducted: boolean}).isAbducted) {
            const h = this.hasHuman as unknown as {getPos(): {posX: number; posY: number}; getRadius(): number};
            this.travelPoint = { posX: h.getPos().posX, posY: h.getPos().posY - h.getRadius() - this.getRadius() };
        }

        this.maybeFireBullet(du);

        this.cx += this.velX * du;
        this.cy += this.velY * du;
        this.wrapPosition();
    }

    mutate(): void {
        this.rateOfFire = 500;
        this.mutated    = true;
        try { (this.hasHuman as unknown as {kill(): void}).kill(); } catch (_e) {}
        this.hasHuman   = false;
        this.baseVel    = 2 * 1.5;
    }

    releaseHuman(): void {
        if (this.hasHuman) (this.hasHuman as unknown as {release(): void}).release();
        this.hasHuman = false;
    }

    takeBulletHit(): void {
        this.kill();
        this.releaseHuman();
        gameManager.increaseScore(this.points);
    }

    render(ctx: CanvasRenderingContext2D): void {
        const sprite = this.mutated ? sprites.mutant : sprites.lander;
        if (!sprite) return;
        sprite.scale = this.scale;
        sprite.drawWrappedCentredAt(ctx, this.cx - camera.screenLeft, this.cy, (this as unknown as {rotation?: number}).rotation);
    }
}
