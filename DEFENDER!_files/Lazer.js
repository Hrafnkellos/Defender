"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ======
// Lazer
// ======

// A generic contructor which accepts an arbitrary descriptor object
function Lazer(descr) {

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

Lazer.prototype = new Entity();

Lazer.prototype.fireSound = () => sManager.playSound(11, 1, 0.1);
Lazer.prototype.zappedSound =  () => sManager.playSound(1, 1, 0.1);
Lazer.prototype.entityType = "lazer";

// Initial, inheritable, default values
Lazer.prototype.rotation = 0;
Lazer.prototype.cx = 200;
Lazer.prototype.cy = 200;
Lazer.prototype.scx = 200;
Lazer.prototype.scy = 200;
Lazer.prototype.velX = 2;
Lazer.prototype.velY = 2;
Lazer.prototype.color = '008080';
Lazer.prototype.spatialMapping = [[0,0,0], [-8,0,0], [-16,0,0], [-24,0,0], [-32,0,0], [-40,0,0]];

// Convert times from milliseconds to "nominal" time units.
Lazer.prototype.lifeSpan = 650 / NOMINAL_UPDATE_INTERVAL;

Lazer.prototype.update = function (du) {

	spatialManager.unregister(this);

    this.lifeSpan -= du;
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    this.cx += this.velX * du;

    this.rotation += 1 * du;
    this.rotation = util.wrapRange(this.rotation,
                                   0, consts.FULL_CIRCLE);

    var hitEntity = this.findHitEntityType(["lander", "human"/*, "alienbullet"*/, "baiter", "mothership", "swarmer"], true);
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
        hitEntity.kill();
        return entityManager.KILL_ME_NOW;
    }
    this.wrapPosition();

    this.randomFillstyle();
	spatialManager.register(this);
};

Lazer.prototype.getRadius = function () {
    return 3;
};

Lazer.prototype.takeBulletHit = function () {
    this.kill();

    // Make a noise when I am zapped by another bullet
    this.zappedSound();
};

Lazer.prototype.render = function (ctx) {

    var fadeThresh = Lazer.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }
    util.drawWrapedLine(ctx,this.scx ,this.scy,this.cx,this.cy, this.eFillStyle);
    //util.drawWrapedLine(ctx,this.scx - mapManager.screenLeft,this.scy,this.cx - mapManager.screenLeft,this.cy, this.eFillStyle);
    util.wrappedcenteredFillBox( ctx ,this.cx- mapManager.screenLeft,this.cy, this.getRadius(), this.getRadius(), this.eFillStyle);
    /*g_sprites.bullet.drawCentredAt(
        ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation
    );*/

    ctx.globalAlpha = 1;
};
