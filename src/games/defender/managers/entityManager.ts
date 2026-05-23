// Defender.entityManager — maintains typed arrays for all entity types.
// Factory methods create entities; registerWithEngine() hooks into the engine loop.

import { entityManager as engineEntityManager } from '../../../engine/managers/entityManager';
import { spatialManager } from '../../../engine/managers/spatialManager';
import { g_canvas }       from '../../../engine/utils/config';
import { getRandomInt, wrappedDistSq } from '../../../engine/utils/util';
import { Vector }         from '../../../engine/rendering/Vector';
import { camera }     from '../../../engine/managers/camera';

// Entity class imports (circular dep — resolved at runtime since only used inside methods)
import { Ship }       from '../entities/player/Ship';
import { Lander }     from '../entities/enemies/Lander';
import { Baiter }     from '../entities/enemies/Baiter';
import { Mothership } from '../entities/enemies/Mothership';
import { Swarmer }    from '../entities/enemies/Swarmer';
import { Laser }      from '../entities/projectiles/Laser';
import { Bullet }     from '../entities/projectiles/Bullet';
import { AlienBullet } from '../entities/projectiles/AlienBullet';
import { Human }      from '../entities/fx/Human';
import { Particle }   from '../entities/fx/Particle';
import { gameManager } from './gameManager';

export const entityManager = {

    _bullets:     [] as Bullet[],
    _lazers:      [] as Laser[],
    _ships:       [] as Ship[],
    _humans:      [] as Human[],
    _landers:     [] as Lander[],
    _baiters:     [] as Baiter[],
    _particles:   [] as Particle[],
    _alienbullets:[] as AlienBullet[],
    _motherships: [] as Mothership[],
    _swarmers:    [] as Swarmer[],

    // Call once at startup to hook our arrays into the engine loop.
    registerWithEngine(): void {
        engineEntityManager.addCategory(this._particles);
        engineEntityManager.addCategory(this._bullets);
        engineEntityManager.addCategory(this._lazers);
        engineEntityManager.addCategory(this._ships);
        engineEntityManager.addCategory(this._humans);
        engineEntityManager.addCategory(this._alienbullets);
        engineEntityManager.addCategory(this._landers);
        engineEntityManager.addCategory(this._baiters);
        engineEntityManager.addCategory(this._motherships);
        engineEntityManager.addCategory(this._swarmers);
    },

    init(): void {
        this._generateHumans();
        this._generateLanders();
        this._generateParticles();
        this._generateMotherships();
    },

    // ─── GENERATORS ───────────────────────────────────────────────────────────

    _generateHumans(): void {
        for (let i = 0; i < 4; i++) this.generateHuman();
    },

    _generateLanders(): void {
        for (let i = 0; i < gameManager.landers; i++) this.generateLander();
    },

    _generateBaiters(): void {
        this.generateBaiter();
    },

    _generateParticles(): void {
        for (let i = 0; i < 200; i++) this.generateParticle();
    },

    _generateMotherships(): void {
        for (let i = 0; i < gameManager.motherships; i++) this.generateMothership();
    },

    _generateSwarmers(cx: number, cy: number): void {
        for (let i = 0; i < 7; i++) this.generateSwarmer(cx, cy);
    },

    generateParticleExplosion(cx: number, cy: number): void {
        for (let i = 0; i < 30; i++) {
            const origin = new Vector(cx, cy);
            this.generateParticle({ cx, cy, fading: true }, origin, new Vector(getRandomInt(-5, -1), getRandomInt(-5, -1)));
            this.generateParticle({ cx, cy, fading: true }, origin, new Vector(getRandomInt(-7, 8),  getRandomInt(-7, 8)));
            this.generateParticle({ cx, cy, fading: true }, origin, new Vector(getRandomInt(1,  7),  getRandomInt(1,  7)));
        }
    },

    // ─── FACTORIES ────────────────────────────────────────────────────────────

    fireBullet(cx: number, cy: number, velX: number, velY: number, rotation: number): void {
        this._bullets.push(new Bullet({ cx, cy, velX, velY, rotation }));
    },

    fireLazer(cx: number, cy: number, velX: number, velY: number, rotation: number): void {
        this._lazers.push(new Laser({ cx, cy, scx: cx, scy: cy, velX, velY, rotation }));
    },

    fireAlienBullet(cx: number, cy: number, velX: number, velY: number, rotation: number): void {
        this._alienbullets.push(new AlienBullet({ cx, cy, velX, velY, rotation }));
    },

    generateShip(descr?: Partial<Record<string, unknown>>):       void { this._ships.push(new Ship(descr)); },
    generateHuman(descr?: Partial<Record<string, unknown>>):      void { this._humans.push(new Human(descr)); },
    generateLander(descr?: Partial<Record<string, unknown>>):     void { this._landers.push(new Lander(descr)); },
    generateBaiter(descr?: Partial<Record<string, unknown>>):     void { this._baiters.push(new Baiter(descr)); },
    generateMothership(descr?: Partial<Record<string, unknown>>): void { this._motherships.push(new Mothership(descr)); },

    generateParticle(descr?: Partial<Record<string, unknown>>, point?: Vector, velocity?: Vector, acceleration?: Vector): void {
        this._particles.push(new Particle(descr, point, velocity, acceleration));
    },

    generateSwarmer(cx: number, cy: number): void {
        this._swarmers.push(new Swarmer({ cx, cy }));
    },

    // ─── QUERIES ──────────────────────────────────────────────────────────────

    getShipPos(): { posX: number; posY: number } {
        return this._ships[0].getPos();
    },

    getShipVel(): { velX: number; velY: number } {
        return { velX: this._ships[0].velX, velY: this._ships[0].velY };
    },

    // ─── COMMANDS ─────────────────────────────────────────────────────────────

    resetShips(): void {
        for (const ship of this._ships) ship.reset();
    },

    haltShips(): void {
        for (const ship of this._ships) ship.halt();
    },

    mutateAll(): void {
        for (const lander of this._landers) lander.mutate();
    },

    killOnScreen(): void {
        const groups = [this._landers, this._baiters, this._motherships, this._swarmers] as Array<Array<{cx: number; takeBulletHit?(): void}>>;
        for (const group of groups) {
            for (const e of group) {
                if (camera.isOnScreen(e.cx)) e.takeBulletHit?.();
            }
        }
    },

    clearAll(): void {
        const all = [
            this._particles, this._bullets, this._lazers, this._ships,
            this._humans, this._alienbullets, this._landers, this._baiters,
            this._motherships, this._swarmers
        ] as Array<Array<import('../../../engine/entities/IEntity').IEntity>>;
        for (const cat of all) {
            while (cat.length > 0) {
                spatialManager.unregister(cat[0]);
                cat.splice(0, 1);
            }
        }
    },

    yoinkNearestShip(posX: number, posY: number): void {
        let closest: Ship | null = null;
        let closestSq = 1000 * 1000;
        for (const ship of this._ships) {
            const pos    = ship.getPos();
            const distSq = wrappedDistSq(pos.posX, pos.posY, posX, posY, g_canvas.width, g_canvas.height);
            if (distSq < closestSq) { closest = ship; closestSq = distSq; }
        }
        if (closest) { closest.cx = posX; closest.cy = posY; }
    }

};
