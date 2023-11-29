"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ====
// Mothership
// ====

// A generic contructor which accepts an arbitrary descriptor object
function Mothership(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);


    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.defender2;
    this.scale = this.scale || 0.23;

    this.cx = util.randRange(0, mapManager.rightX - this.getRadius());//g_canvas.width);
    this.cy = util.randRange(100 + this.getRadius(), g_canvas.height);//for minimap

    this.travelPoint = util.randPoint(0, mapManager.rightX, 100 + this.getRadius(), g_canvas.height);

    this.rateOfFire = 400;
    this.timeToFire = this.rateOfFire * Math.random();

    /*
        // Diagnostics to check inheritance stuff
        this._MothershipProperty = true;
        console.dir(this);
    */

};

Mothership.prototype = new Entity();

Mothership.prototype.velX = 0;
Mothership.prototype.velY = 0;
Mothership.prototype.baseVel = 1;
Mothership.prototype.chanceOfFire = 0.05;
Mothership.prototype.points = 1000;
Mothership.prototype.entityType = "mothership";
Mothership.prototype.death = function () { sManager.playSound(5, 1, 0.1); }

Mothership.prototype.update = function (du) {

    //Unregister and check for death
    this.sprite.animate();
    spatialManager.unregister(this);
    if (this._isDeadNow) {
        this.death();
        entityManager._generateSwarmers(this.cx, this.cy);
        entityManager.generateParticleExplosion(this.cx, this.cy);
        return entityManager.KILL_ME_NOW;
    }

    var top = 100 + this.getRadius(); //Refers to the top of the canvas.
    //shoulde probably call something like map.mapTop();

    var travelPointVel = util.moveAround(this.travelPoint, this, 100 + this.getRadius(), g_canvas.height, 3);
    this.velX = travelPointVel.velX;
    this.velY = travelPointVel.velY;
    this.travelPoint = travelPointVel.travelPoint;

    //maybe alien a bullet
    this.maybeFireBullet(du);

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.wrapPosition();

    spatialManager.register(this);
};

Mothership.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};

Mothership.prototype.takeBulletHit = function () {
    this.kill();
    gameManager.increaseScore(this.points);
};

Mothership.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawWrappedCentredAt(
        ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation
    );
    /*this.sprite.drawWrappedCentredAt(
        ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation
    );*/
};
