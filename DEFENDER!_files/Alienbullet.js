"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ======
// Alienbullet
// ======

// A generic contructor which accepts an arbitrary descriptor object
function Alienbullet(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.target = descr.target;
    this.initPos = descr.initPos;
}

Alienbullet.prototype = new Entity();

// Initial, inheritable, default values
Alienbullet.prototype.rotation = 0;
Alienbullet.prototype.cx = 200;
Alienbullet.prototype.cy = 200;
Alienbullet.prototype.velX = 2;
Alienbullet.prototype.velY = 2;
Alienbullet.prototype.entityType = "alienbullet";

// Convert times from milliseconds to "nominal" time units.
Alienbullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Alienbullet.prototype.update = function (du) {

    spatialManager.unregister(this);

    this.lifeSpan -= du;
    if(this._isDeadNow) {
    	return entityManager.KILL_ME_NOW;
    }
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.wrapPosition()

    this.rotation += 1 * du;
    this.rotation = util.wrapRange(this.rotation,
                                   0, consts.FULL_CIRCLE);

    spatialManager.register(this);
};

Alienbullet.prototype.getRadius = function () {
    return 4;
};

Alienbullet.prototype.takeAlienbulletHit = function () {
    this.kill();
};

Alienbullet.prototype.render = function (ctx) {

    var fadeThresh = Alienbullet.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }

    util.wrappedcenteredFillBox(ctx, this.cx - mapManager.screenLeft, this.cy, this.getRadius(), this.getRadius(), "white");

    ctx.globalAlpha = 1;
};
