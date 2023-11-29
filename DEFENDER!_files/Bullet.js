// ======
// BULLET
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Bullet(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Make a noise when I am created (i.e. fired)
    this.fireSound();

/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Bullet.prototype = new Entity();

Bullet.prototype.fireSound = function(){sManager.playSound(0, 1, 0.1);}
Bullet.prototype.zappedSound =  function(){sManager.playSound(1, 1, 0.1);}
Bullet.prototype.entityType = "bullet";

// Initial, inheritable, default values
Bullet.prototype.rotation = 0;
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 2;
Bullet.prototype.velY = 2;

// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 1500 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function (du) {

	spatialManager.unregister(this);

    this.lifeSpan -= du;
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.rotation += 1 * du;
    this.rotation = util.wrapRange(this.rotation,
                                   0, consts.FULL_CIRCLE);

    // Handle collisions
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
        return entityManager.KILL_ME_NOW;
    }

	spatialManager.register(this);
};

Bullet.prototype.getRadius = function () {
    return 4;
};

Bullet.prototype.takeBulletHit = function () {
    this.kill();

    // Make a noise when I am zapped by another bullet
    this.zappedSound();
};

Bullet.prototype.render = function (ctx) {

    var fadeThresh = Bullet.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }

    g_sprites.bullet.drawCentredAt(
        ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation
    );

    ctx.globalAlpha = 1;
};
