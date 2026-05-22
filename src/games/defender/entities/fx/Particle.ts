import { Entity }           from '../../../../engine/entities/Entity';
import { KILL_ME_NOW }      from '../../../../engine/managers/entityManager';
import { mapManager }       from '../../../../engine/managers/mapManager';
import { g_canvas, NOMINAL_UPDATE_INTERVAL } from '../../../../engine/utils/config';
import { getRandomInt, wrappedcenteredFillBox } from '../../../../engine/utils/util';
import { Vector }           from '../../../../engine/rendering/Vector';

const PARTICLE_SIZE = 4;

export class Particle extends Entity {
    position:     Vector;
    velocity:     Vector;
    acceleration: Vector;
    velX:         number = 0;
    velY:         number = 0;
    entityType:   string = "particle";
    fading:       boolean = false;
    fillStyle:    string = "";
    lifeSpan:     number = 650 / NOMINAL_UPDATE_INTERVAL;

    constructor(
        descr?:       Partial<Record<string, unknown>>,
        point?:       Vector,
        velocity?:    Vector,
        acceleration?: Vector
    ) {
        super();
        this.setup(descr ?? {});
        this.position     = point        ?? new Vector(2000, 110);
        this.velocity     = velocity     ?? new Vector(0, 0);
        this.acceleration = acceleration ?? new Vector(0, 0);
        this.randomisePosition();
    }

    randomisePosition(): void {
        const nx = this.cx || Math.random() * (mapManager.rightX + 500) - 250;
        const ny = this.cy || Math.random() * (g_canvas.height - 200) + 100;
        this.position.x = nx;
        this.position.y = ny;
    }

    private move(): void {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
    }

    update(du: number): number | void {
        const fills = ['fd0d40','fff13a','8ef90f','edfffe','d457f8','f27734'];
        this.fillStyle = fills[getRandomInt(0, 5)];

        if (this.fading) this.lifeSpan -= du;
        if (this.lifeSpan < 0) return KILL_ME_NOW;

        this.move();
        this.cx = this.position.x;
        this.cy = this.position.y;
    }

    render(ctx: CanvasRenderingContext2D): void {
        const fadeThresh = (650 / NOMINAL_UPDATE_INTERVAL) / 3;
        if (this.lifeSpan < fadeThresh && this.fading) ctx.globalAlpha = this.lifeSpan / fadeThresh;
        const old = ctx.fillStyle;
        wrappedcenteredFillBox(ctx, this.cx - mapManager.screenLeft, this.cy, PARTICLE_SIZE / 2, PARTICLE_SIZE / 2, this.fillStyle);
        ctx.globalAlpha = 1;
        ctx.fillStyle   = old;
    }
}
