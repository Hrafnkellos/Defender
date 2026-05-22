import { Entity }         from '../../../../engine/entities/Entity';
import { spatialManager } from '../../../../engine/managers/spatialManager';
import { mapManager }     from '../../../../engine/managers/mapManager';
import { g_canvas, SECS_TO_NOMINALS, consts } from '../../../../engine/utils/config';
import { keys, eatKey }   from '../../../../engine/input/keys';
import { isBetween, WrappedFillCircleStyle, wrappedStrokeCircleStyle } from '../../../../engine/utils/util';
import { sprites }        from '../../sprites';
import { sound }          from '../../sound';
import { entityManager as defEntityManager } from '../../managers/entityManager';
import { gameManager }    from '../../managers/gameManager';

const NOMINAL_THRUST = +0.2;

export class Ship extends Entity {
    rotation:      number  = 1.55555;
    velX:          number  = 0;
    velY:          number  = 0;
    launchVel:     number  = 12;
    numSubSteps:   number  = 1;
    maxVel:        number  = 6;
    inertia:       number  = 0.033;
    rof:           boolean = true;
    entityType:    string  = "ship";
    fireRate:      number  = 180;
    flipp:         number  = 0;
    spatialMapping: [number, number, number][] = [[30, 0, 30], [0, 0, 30], [-30, 0, 30]];
    forcefield:    boolean = true;
    cameraMode:    boolean = true;
    screenPadding: number  = 240;
    screenSpeed:   number  = 6;
    screenX:       number  = 2000;
    friendlyFire:  boolean = false;
    hasHuman:      unknown = false;

    _scale:       number  = 0.30;
    _isWarping:   boolean = false;
    reset_cx:     number  = 0;
    reset_cy:     number  = 0;
    reset_rotation: number = 1.55555;

    static KEY_UP    = 38;
    static KEY_DOWN  = 40;
    static KEY_LEFT  = 37;
    static KEY_RIGHT = 39;
    static ALT_KEY_UP    = 'W'.charCodeAt(0);
    static ALT_KEY_DOWN  = 'S'.charCodeAt(0);
    static ALT_KEY_LEFT  = 'A'.charCodeAt(0);
    static ALT_KEY_RIGHT = 'D'.charCodeAt(0);
    static CAMERA_MODE   = 'L'.charCodeAt(0);
    static HYPER_SPACE   = ['E'.charCodeAt(0), 16] as const;
    static SMART_BOMB    = [17, 9] as const;
    static KEY_FIRE      = ' '.charCodeAt(0);
    static leftBoundry   = 100;
    static rightBoundry  = 500;

    constructor(descr?: Partial<Record<string, unknown>>) {
        super();
        this.setup(descr ?? {});
        this.rememberResets();
        if (!this.sprite) {/* sprite assigned via sprites.defender */}
        this._scale     = 0.30;
        this._isWarping = false;
        this.friendlyFire = false;
    }

    get sprite() { return sprites.defender; }

    rememberResets(): void {
        this.reset_cx       = this.cx;
        this.reset_cy       = this.cy;
        this.reset_rotation = this.rotation;
    }

    warpSound(): void { sound?.playSound(4, 1, 0.1); }
    explode():   void { sound?.playSound(7, 1, 0.1); }

    warp(): void {
        this.reset();
    }

    private _moveToASafePlace(): void {
        const origX = this.cx, origY = this.cy, MARGIN = 40;
        for (let attempts = 0; attempts < 100; ++attempts) {
            const dist = 100 + Math.random() * g_canvas.height / 2 - 150;
            const dirn = Math.random() * consts.FULL_CIRCLE;
            this.cx = origX + dist * Math.sin(dirn);
            this.cy = origY - dist * Math.cos(dirn);
            const safe = isBetween(this.cx, MARGIN, g_canvas.width  - MARGIN) &&
                         isBetween(this.cy, MARGIN, g_canvas.height - MARGIN) &&
                         !this.isColliding();
            if (safe) break;
        }
    }

    update(du: number): number | void {
        if (this._isWarping) { this._updateWarp(du); return; }

        spatialManager.unregister(this);

        const steps = this.numSubSteps, dStep = du / steps;
        for (let i = 0; i < steps; ++i) this.computeSubStep(dStep);

        this.maybeFireBullet();
        this.maybeDropBomb();
        this.wrapPosition();

        if (eatKey(Ship.CAMERA_MODE)) this.cameraMode = !this.cameraMode;

        if (eatKey(Ship.HYPER_SPACE[0]) || eatKey(Ship.HYPER_SPACE[1]))
            this.cx += this.flipp ? -1000 : 1000;

        if (this.cameraMode) this.MainCamera(du);
        else                 this.wrapMainView(this.cx);

        const types = ["lander", "human", "alienbullet", "baiter", "mothership", "swarmer"];

        if (this.forcefield) {
            const hit = this.findHitEntityType(types);
            if (hit) {
                if (hit.entityType !== "bullet" && hit.entityType !== "human") {
                    this.forcefield = false;
                    hit.kill();
                } else if (hit.entityType === "human" && !this.hasHuman &&
                           (hit as unknown as {isAirborne: boolean}).isAirborne && this.cy < 450) {
                    this.hasHuman = hit;
                    (hit as unknown as {abduct(s: Ship): void}).abduct(this);
                } else {
                    spatialManager.register(this);
                }
            }
        } else {
            const hit = this.findHitEntityType(types, true);
            if (hit) {
                if (hit.entityType !== "bullet" && hit.entityType !== "human") {
                    this.takeBulletHit();
                } else if (hit.entityType === "human" && !this.hasHuman &&
                           (hit as unknown as {isAirborne: boolean}).isAirborne && this.cy < 450) {
                    this.hasHuman = hit;
                    (hit as unknown as {abduct(s: Ship): void}).abduct(this);
                }
            } else {
                spatialManager.register(this);
            }
        }

        if (this.cy >= 450 && this.hasHuman) {
            (this.hasHuman as unknown as {release(): void}).release();
            this.hasHuman = false;
        }
    }

    MainCamera(du: number): void {
        if (this.flipp) this.screenX -= this.screenSpeed * du;
        else            this.screenX += this.screenSpeed * du;

        const mm = mapManager;
        if (this.screenX - this.cx >  mm.rightX) this.screenX = this.screenX - this.cx - mm.rightX - this.screenSpeed + 15;
        if (this.screenX - this.cx < -mm.rightX) this.screenX = this.screenX + 2 * mm.rightX - this.cx - this.screenSpeed;
        if (this.screenX - this.cx >  this.screenPadding) this.screenX = this.cx + this.screenPadding;
        else if (this.screenX - this.cx < -this.screenPadding) this.screenX = this.cx - this.screenPadding;

        this.wrapMainView(this.screenX);
    }

    computeSubStep(du: number): void {
        const thrust = this.computeThrustMagLeftRight();
        const accelX = +Math.sin(this.rotation) * thrust;

        if (keys[Ship.KEY_UP]   || keys[Ship.ALT_KEY_UP]) {
            if (!(this.cy - (3.5 + this.getRadius() - 30) < 100))
                this.cy -= 3.5 * du;
        }
        if (keys[Ship.KEY_DOWN] || keys[Ship.ALT_KEY_DOWN]) {
            if (!(this.cy + (3.5 + this.getRadius() - 30) > g_canvas.height))
                this.cy += 3.5 * du;
        }

        this.applyAccel(accelX, du);
    }

    computeThrustMagLeftRight(): number {
        let thrust = 0;
        if (keys[Ship.KEY_LEFT] || keys[Ship.ALT_KEY_LEFT]) {
            this.sprite?.animate();
            thrust += NOMINAL_THRUST;
            this.flipp = 1;
            if (this.rotation > 0) this.rotation = -this.rotation;
        } else if (keys[Ship.KEY_RIGHT] || keys[Ship.ALT_KEY_RIGHT]) {
            this.sprite?.animate();
            thrust += NOMINAL_THRUST;
            this.flipp = 0;
            if (this.rotation < 0) this.rotation = -this.rotation;
        } else {
            this.sprite?.animateReset();
        }
        return thrust;
    }

    applyAccel(accelX: number, du: number): void {
        const oldVelX = this.velX;
        if (Math.abs(this.velX + accelX) <= this.maxVel) this.velX += accelX * du;
        const aveVelX = (oldVelX + this.velX) / 2;
        const intervalVelX = aveVelX; // average velocity for smoother physics

        this.cx += du * intervalVelX;
        mapManager.screenLeft  += du * intervalVelX;
        mapManager.screenRight += du * intervalVelX;
    }

    maybeFireBullet(): void {
        if (keys[Ship.KEY_FIRE] && this.rof) {
            const dX       = +Math.sin(this.rotation);
            const dY       = -Math.cos(this.rotation);
            const launchDist = this.getRadius() * 1.2;
            const relVel   = this.launchVel * 1.7;

            defEntityManager.fireLazer(
                this.cx + dX * launchDist, this.cy + dY * launchDist,
                this.velX + dX * relVel,   this.velY + dY * relVel,
                this.rotation
            );

            this.rof = false;
            const idx = defEntityManager._ships.indexOf(this);
            setTimeout(() => { defEntityManager._ships[idx].rof = true; }, this.fireRate);
        }
    }

    maybeDropBomb(): void {
        if (eatKey(Ship.SMART_BOMB[0]) || eatKey(Ship.SMART_BOMB[1])) {
            if (gameManager.bombs <= 0) return;
            defEntityManager.killOnScreen();
            gameManager.bombs--;
            gameManager.bombVisuals = 200;
        }
    }

    getRadius(): number {
        const sprite = sprites.defender;
        return ((sprite?.width ?? 512) * this._scale * 0.7 / 2) * 0.9;
    }

    takeBulletHit(): void {
        gameManager.decreaseLives();
        this.warp();
        if (this.hasHuman) (this.hasHuman as unknown as {kill(): void}).kill();
    }

    reset(): void {
        this.setPos(this.reset_cx, this.reset_cy);
        this.rotation = this.reset_rotation;
        this._moveToASafePlace();
        this.flipp      = 0;
        this.forcefield = true;
        this.explode();
        this.halt();
        mapManager.screenLeft  = this.cx - 450;
        mapManager.screenRight = this.cx + 450;
    }

    halt(): void {
        this.velX = 0;
        this.velY = 0;
    }

    render(ctx: CanvasRenderingContext2D): void {
        const sprite = sprites.defender;
        if (!sprite) return;
        sprite.scale = this._scale;
        sprite.drawWrappedCentredAt(ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation - 1.555, this.flipp);
        if (this.forcefield) {
            WrappedFillCircleStyle(ctx, this.cx - mapManager.screenLeft, this.cy, this.getRadius(), "rgba(0,0,255,0.1)");
            wrappedStrokeCircleStyle(ctx, this.cx - mapManager.screenLeft, this.cy, this.getRadius(), "rgba(0,0,255,1)");
        }
    }

    private _updateWarp(du: number): void {
        const SHRINK_RATE = 3 / SECS_TO_NOMINALS;
        this._scale += (this._isWarping ? -1 : 1) * SHRINK_RATE * du;
        if (this._scale < 0.2) {
            this._moveToASafePlace();
            this.halt();
        } else if (this._scale > 1) {
            this._scale     = 1;
            this._isWarping = false;
            spatialManager.register(this);
        }
    }
}
