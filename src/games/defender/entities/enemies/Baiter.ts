import { Enemy }          from '../Enemy';
import { spatialManager } from '../../../../engine/managers/spatialManager';
import { mapManager }     from '../../../../engine/managers/mapManager';
import { randRange, moveAround } from '../../../../engine/utils/util';
import { sprites }        from '../../sprites';
import { sound }          from '../../sound';
import { entityManager as defEntityManager } from '../../managers/entityManager';
import { gameManager }    from '../../managers/gameManager';

export class Baiter extends Enemy {
    velX:         number = 1;
    velY:         number = 1;
    points:       number = 200;
    entityType:   string = "baiter";
    baseVel:      number = 2;
    chanceOfFire: number = 0.8;
    travelPoint:  { posX: number; posY: number } = { posX: 0, posY: 0 };

    constructor(descr?: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr ?? {});
        const shipPos    = defEntityManager.getShipPos();
        this.cx          = randRange(shipPos.posX + 160, shipPos.posX + 240);
        this.cy          = randRange(shipPos.posY - 80,  shipPos.posY - 60);
        this.rateOfFire  = 700;
        this.timeToFire  = this.rateOfFire * Math.random();
        this.travelPoint = { posX: randRange(shipPos.posX - 50, shipPos.posX + 50), posY: randRange(shipPos.posY - 80, shipPos.posY - 50) };
    }

    death(): void { sound?.playSound(5, 1, 0.1); }

    getRadius(): number {
        return this.scale * ((sprites.creep1?.width ?? 256) / 2) * 0.9;
    }

    get scale(): number { return (this as unknown as {_scale?: number})._scale ?? 0.18; }
    set scale(v: number) { (this as unknown as {_scale: number})._scale = v; }

    update(du: number): void {
        sprites.creep1?.animate();
        spatialManager.unregister(this);

        if (this._isDeadNow) {
            this.death();
            defEntityManager.generateParticleExplosion(this.cx, this.cy);
            return;
        }

        const hit = this.isColliding();
        if (hit && hit.entityType !== "lander" && hit.entityType !== "human" && hit.entityType !== "baiter") {
            this.death();
            this.kill();
        }

        this.maybeFireBullet(du);

        const shipPos = defEntityManager.getShipPos();
        const yMin    = Math.max(shipPos.posY - 90, 200);
        this.travelPoint = { posX: randRange(shipPos.posX - 50, shipPos.posX + 50), posY: randRange(yMin, shipPos.posY - 80) };

        const tv = moveAround(this.travelPoint, this as unknown as Parameters<typeof moveAround>[1], yMin, shipPos.posY + 90, 3);
        this.velX        = tv.velX;
        this.velY        = tv.velY;
        this.travelPoint = tv.travelPoint;

        this.cx += this.velX * du;
        this.cy += this.velY * du;
        this.wrapPosition();
        spatialManager.register(this);
    }

    takeBulletHit(): void {
        this.kill();
        gameManager.increaseScore(200);
    }

    render(ctx: CanvasRenderingContext2D): void {
        const sprite = sprites.creep1;
        if (!sprite) return;
        sprite.scale = this.scale;
        sprite.drawWrappedCentredAt(ctx, this.cx - mapManager.screenLeft, this.cy, (this as unknown as {rotation?: number}).rotation);
    }
}
