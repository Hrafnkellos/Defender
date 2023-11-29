"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ====
// Swarmer
// ====

// A generic contructor which accepts an arbitrary descriptor object
function Swarmer(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);


    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.defender3;
    this.scale = this.scale || 0.12;


    this.travelPoint = { posX: entityManager._ships[0].cx, posY: entityManager._ships[0].cy };

    this.velX = Math.cos(Math.random() * 6);
    this.velY = -Math.sin(Math.random() * 6);
    this.dispersionTime = 300;

    this.rateOfFire = 1000;
    this.timeToFire = this.rateOfFire * Math.random();

    /*
        // Diagnostics to check inheritance stuff
        this._SwarmerProperty = true;
        console.dir(this);
    */

};

Swarmer.prototype = new Entity();

Swarmer.prototype.baseVel = 1;
Swarmer.prototype.chanceOfFire = 0.05;
Swarmer.prototype.points = 150;
Swarmer.prototype.entityType = "swarmer";
Swarmer.prototype.death = function () { sManager.playSound(5, 1, 0.1); }

Swarmer.prototype.update = function (du) {

    //Unregister and check for death
    spatialManager.unregister(this);
    if (this._isDeadNow) {
        this.death();
        entityManager.generateParticleExplosion(this.cx, this.cy);
        return entityManager.KILL_ME_NOW;
    }
    this.sprite.animate();
    //maybe alien a bullet
    this.maybeFireBullet(du);

    var xTarget = entityManager._ships[0].cx;
    if (this.cx > mapManager.rightX - mapManager.rightX / 4 && entityManager._ships[0].cx < mapManager.rightX - mapManager.rightX * 3 / 4)
        xTarget += mapManager.rightX;
    this.travelPoint = { posX: xTarget, posY: entityManager._ships[0].cy };

    var top = 100 + this.getRadius(); //Refers to the top of the canvas.
    //shoulde probably call something like map.mapTop();
    if (this.dispersionTime > 0) {
        this.cx += this.velX * 5;
        if (this.cy <= g_canvas.height && this.cy > 100) this.cy += this.velY * 5;
        this.dispersionTime -= 8;
    }
    else {
        var ship = entityManager._ships[0];
        var rotation = Math.atan2(-(ship.cy - this.cy), ((ship.cx) - (this.cx)));
        var dX = Math.cos(rotation);
        var dY = -Math.sin(rotation);

        this.velX = dX * 5.5;
        this.velY = dY * (Math.random() * 6);

        this.cx += this.velX * du;
        this.cy += this.velY * du;
    }

    this.wrapPosition();

    spatialManager.register(this);
};




Swarmer.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};



Swarmer.prototype.takeBulletHit = function () {
    this.kill();
    gameManager.increaseScore(this.points);
};


Swarmer.prototype.render = function (ctx) {
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
