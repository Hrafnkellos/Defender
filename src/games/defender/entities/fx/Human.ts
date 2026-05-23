import { Entity }         from '../../../../engine/entities/Entity';
import { spatialManager } from '../../../../engine/managers/spatialManager';
import { mapManager }     from '../../../../engine/managers/mapManager';
import { g_canvas }       from '../../../../engine/utils/config';
import { getRandomInt, randRange, moveAround } from '../../../../engine/utils/util';
import { sprites }        from '../../sprites';
import { gameManager }    from '../../managers/gameManager';

export class Human extends Entity {
    scale:       number  = 0.2;
    velX:        number  = 1;
    velY:        number  = 0;
    isAirborne:  boolean = false;
    isAbducted:  boolean = false;
    isTracked:   boolean = false;
    abductor:    Entity | false = false;
    baseVel:     number  = 0.5;
    entityType:  string  = "human";
    travelPoint: { posX: number; posY: number } = { posX: 0, posY: 0 };

    constructor(descr?: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr ?? {});
        const sprite = sprites.human;
        if (!this.cx) this.cx = getRandomInt(0, mapManager.rightX - this.getRadius() * 2);
        if (!this.cy) this.cy = getRandomInt(g_canvas.height - 5, g_canvas.height) - this.getRadius();
        this.travelPoint = { posX: randRange(0, mapManager.rightX - this.getRadius()), posY: this.cy };
        if (sprite) {
            const existingScale = (this as unknown as Record<string, unknown>).scale as number | undefined;
            if (existingScale !== undefined) this.scale = existingScale;
        }
    }

    getRadius(): number {
        const sprite = sprites.human;
        return this.scale * ((sprite?.width ?? 128) / 2) * 1.1;
    }

    abduct(abductor: Entity): void {
        this.abductor   = abductor;
        this.isAirborne = false;
        this.isAbducted = true;
    }

    release(): void {
        gameManager.increaseScore(500);
        this.abductor   = false;
        this.isAirborne = true;
        this.isAbducted = false;
        this.isTracked  = false;
        this.velY       = 1;
        this.velX       = 0;
    }

    takeBulletHit(): void { this.kill(); }

    update(du: number): void {
        sprites.human?.animate();
        spatialManager.unregister(this);
        if (this._isDeadNow) return;

        if (this.isAbducted && this.abductor) {
            this.travelPoint = this.abductor.getPos();
            this.velX        = (this.abductor as unknown as { velX: number }).velX ?? 0;
            this.velY        = (this.abductor as unknown as { velY: number }).velY ?? 0;
            if (this.abductor.entityType === "ship")
                this.cy = this.abductor.getPos().posY + this.getRadius() * 2;
        } else if (this.cy + this.getRadius() >= g_canvas.height) {
            this.isAirborne = false;
            this.velY       = 0;
        } else {
            const tv      = moveAround(this.travelPoint, this, this.cy, this.cy, 3);
            this.velX     = tv.velX;
            this.travelPoint = tv.travelPoint;
        }

        this.cx += this.velX * du;
        this.cy += this.velY * du;
        this.wrapPosition();
        spatialManager.register(this);
    }

    render(ctx: CanvasRenderingContext2D): void {
        const sprite = sprites.human;
        if (!sprite) return;
        sprite.scale = this.scale;
        sprite.drawWrappedCentredAt(ctx, this.cx - mapManager.screenLeft, this.cy, (this as unknown as {rotation?: number}).rotation);
    }
}
