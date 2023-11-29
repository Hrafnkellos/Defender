"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"

We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/

// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/

var entityManager = {

    // "PRIVATE" DATA

    _bullets: [],
    _lazers: [],
    _ships: [],
    _humans: [],
    _landers: [],
    _baiters: [],
    _particles: [],
    _alienbullets: [],
    _motherships: [],
    _swarmers: [],

    // "PRIVATE" METHODS

    _generateHumans: function () {
        var i,
            NUM_HUMANS = 4;

        for (i = 0; i < NUM_HUMANS; ++i) {
            this.generateHuman();
        }
    },

    generateParticleExplosion: function (cx, cy) {
        var i,
            NUM_PARTICLES = 30;

        for (i = 0; i < NUM_PARTICLES; ++i) {
            var origin = new Vector(cx, cy);
            this.generateParticle({ cx: cx, cy: cy, fading: true },
                origin,
                new Vector(util.getRandomInt(-0.5, -7), util.getRandomInt(-0.5, -7)));
            this.generateParticle({ cx: cx, cy: cy, fading: true },
                origin,
                new Vector(util.getRandomInt(-7, 8), util.getRandomInt(-7, 8)));
            this.generateParticle({ cx: cx, cy: cy, fading: true },
                origin,
                new Vector(util.getRandomInt(0.5, 7), util.getRandomInt(0.5, 7)));
        }
    },

    _generateLanders: function () {
        var i,
            NUM_LANDERS = gameManager.landers;

        for (var i = 0; i < NUM_LANDERS; i++) {
            this.generateLander();
        };
    },


    _generateBaiters: function () {
        var i,
            NUM_BAITERS = 1;

        for (var i = 0; i < NUM_BAITERS; i++) {
            this.generateBaiter();
        };
    },

    _generateParticles: function () {
        var i,
            NUM_PARTICLES = 200;

        for (i = 0; i < NUM_PARTICLES; ++i) {
            this.generateParticle();
        }
    },

    _generateMotherships: function () {
        var i, NUM_MOTHERSHIPS = gameManager.motherships;
        for (i = 0; i < NUM_MOTHERSHIPS; i++)
            this.generateMothership();
    },

    _generateSwarmers: function (cx, cy) {
        var i;
        for (i = 0; i < 7; i++)
            this.generateSwarmer(cx, cy);
    },

    _findNearestShip: function (posX, posY) {
        var closestShip = null,
            closestIndex = -1,
            closestSq = 1000 * 1000;

        for (var i = 0; i < this._ships.length; ++i) {

            var thisShip = this._ships[i];
            var shipPos = thisShip.getPos();
            var distSq = util.wrappedDistSq(
                shipPos.posX, shipPos.posY,
                posX, posY,
                g_canvas.width, g_canvas.height);

            if (distSq < closestSq) {
                closestShip = thisShip;
                closestIndex = i;
                closestSq = distSq;
            }
        }
        return {
            theShip: closestShip,
            theIndex: closestIndex
        };
    },

    _forEachOf: function (aCategory, fn) {
        for (var i = 0; i < aCategory.length; ++i) {
            fn.call(aCategory[i]);
        }
    },

    // PUBLIC METHODS

    // A special return value, used by other objects,
    // to request the blessed release of death!
    //
    KILL_ME_NOW: -1,

    // Some things must be deferred until after initial construction
    // i.e. thing which need `this` to be defined.
    //
    deferredSetup: function () {
        this._categories = [this._particles, this._bullets, this._lazers, this._ships, this._humans,
        this._alienbullets, this._landers, this._baiters, this._motherships, this._swarmers];
    },

    init: function () {
        this._generateHumans();
        this._generateLanders();
        //this._generateBaiters();
        this._generateParticles();
        this._generateMotherships();
    },

    fireBullet: function (cx, cy, velX, velY, rotation) {
        this._bullets.push(new Bullet({
            cx: cx,
            cy: cy,
            velX: velX,
            velY: velY,

            rotation: rotation
        }));
    },

    fireLazer: function (cx, cy, velX, velY, rotation) {
        this._lazers.push(new Lazer({
            cx: cx,
            cy: cy,
            scx: cx,
            scy: cy,
            velX: velX,
            velY: velY,

            rotation: rotation
        }));
    },

    fireAlienBullet: function (cx, cy, velX, velY, rotation) {
        this._alienbullets.push(new Alienbullet({
            cx: cx,
            cy: cy,
            velX: velX,
            velY: velY,
            rotation: rotation
        }));
    },

    generateShip: function (descr) {
        this._ships.push(new Ship(descr));
    },

    generateHuman: function (descr) {
        this._humans.push(new Human(descr));
    },

    generateLander: function (descr) {
        this._landers.push(new Lander(descr));
    },

    generateBaiter: function (descr) {
        this._baiters.push(new Baiter(descr));
    },

    generateParticle: function (descr, point, velocity, acceleration) {
        this._particles.push(new Particle(descr, point, velocity, acceleration));
    },

    generateMothership: function (descr) {
        this._motherships.push(new Mothership(descr))
    },

    generateSwarmer: function (cx, cy) {
        this._swarmers.push(new Swarmer({ cx: cx, cy: cy }));
    },

    killNearestShip: function (xPos, yPos) {
        var theShip = this._findNearestShip(xPos, yPos).theShip;
        if (theShip) {
            theShip.kill();
        }
    },

    getShipPos: function () {
        return this._ships[0].getPos();
    },

    getShipVel: function () {
        return { velX: this._ships[0].velX, velY: this._ships[0].velY };
    },

    resetShips: function () {
        this._forEachOf(this._ships, Ship.prototype.reset);
    },

    haltShips: function () {
        this._forEachOf(this._ships, Ship.prototype.halt);
    },

    mutateAll: function () {

        for (var i = 0; i < this._landers.length; i++) {
            this._landers[i].mutate();
        }
    },

    killOnScreen: function () {
        var i, j, enemies = [this._landers, this._baiters, this._motherships, this._swarmers];

        for (i = 0; i < enemies.length; i++) {
            for (j = 0; j < enemies[i].length; j++) {
                if (mapManager.isOnScreen(enemies[i][j].cx)) {
                    enemies[i][j].takeBulletHit();
                }
            }
        }
    },

    clearAll: function () {
        for (var c = 1; c < this._categories.length; ++c) {

            var aCategory = this._categories[c];
            var i = 0;

            while (i < aCategory.length) {
                spatialManager.unregister(aCategory[i]);
                aCategory.splice(i, 1);
            }
        }
    },

    update: function (du) {

        for (var c = 0; c < this._categories.length; ++c) {

            var aCategory = this._categories[c];
            var i = 0;

            while (i < aCategory.length) {

                var status = aCategory[i].update(du);

                if (status === this.KILL_ME_NOW) {
                    // remove the dead guy, and shuffle the others down to
                    // prevent a confusing gap from appearing in the array
                    aCategory.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
        }

        if (this._humans.length === 0) this.mutateAll();// this._generateHumans();
        if (this._landers.length === 0) gameManager.nextLevel();

    },

    render: function (ctx) {

        var debugX = 10, debugY = 100;

        for (var c = 0; c < this._categories.length; ++c) {

            var aCategory = this._categories[c];


            for (var i = 0; i < aCategory.length; ++i) {
                //if(mapManager.isOnScreen(aCategory[i].cx)){
                aCategory[i].render(ctx);
                //}
                mapManager.renderToMinimap(aCategory[i], ctx);
                //debug.text(".", debugX + i * 10, debugY);

            }
            debugY += 10;
        }
    }

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();