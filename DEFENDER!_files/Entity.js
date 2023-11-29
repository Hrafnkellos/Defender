"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ======
// ENTITY
// ======
/*

Provides a set of common functions which can be "inherited" by all other
game Entities.

JavaScript's prototype-based inheritance system is unusual, and requires
some care in use. In particular, this "base" should only provide shared
functions... shared data properties are potentially quite confusing.

*/

function Entity() {

    /*
        // Diagnostics to check inheritance stuff
        this._entityProperty = true;
        console.dir(this);
    */

};

Entity.prototype.setup = function (descr) {

    // Apply all setup properties from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }

    // Get my (unique) spatial ID
    this._spatialID = spatialManager.getNewSpatialID();
    spatialManager.register(this);

    // I am not dead yet!
    this._isDeadNow = false;
};

Entity.prototype.setPos = function (cx, cy) {
    this.cx = cx;
    this.cy = cy;
};
Entity.prototype.randomFillstyle = function () {
    this.eFillStyle = '#' + util.getRandomInt(0, 255).toString(16) + util.getRandomInt(0, 255).toString(16) + util.getRandomInt(0, 255).toString(16);
};
Entity.prototype.eFillStyle = "000000";

Entity.prototype.getPos = function () {
    return { posX: this.cx, posY: this.cy };
};

Entity.prototype.getRadius = function () {
    return this.getRadius() || 1;
};

Entity.prototype.getSpatialID = function () {
    return this._spatialID;
};

Entity.prototype.kill = function () {
    if (this) this._isDeadNow = true;
};

Entity.prototype.findHitEntity = function () {
    var pos = this.getPos();
    return spatialManager.findEntityInRange(
        pos.posX, pos.posY, this.getRadius()
    );
};
Entity.prototype.findHitEntityType = function (type, hasMapping) {
    var pos = this.getPos();
    if (this.spatialMapping && hasMapping)
        return spatialManager.findEntityInRangeByType(
            pos.posX, pos.posY, this.getRadius(), type, this.spatialMapping
        );

    return spatialManager.findEntityInRangeByType(
        pos.posX, pos.posY, this.getRadius(), type
    );
};

// This is just little "convenience wrapper"
Entity.prototype.isColliding = function (type) {
    return this.findHitEntityType(type);
};

Entity.prototype.maybeFireBullet = function (du) {
    var fireProb = util.randRange(0, 1);
    this.timeToFire -= du;
    if (fireProb < this.chanceOfFire && this.timeToFire <= 0 && mapManager.isOnScreen(this.cx)) {

        var ship = entityManager._ships[0];

        var rotation = Math.atan2(-(ship.cy - this.cy), ((ship.cx) - (this.cx)));


        this.timeToFire = this.rateOfFire * Math.random();

        var dX = Math.cos(rotation);
        var dY = -Math.sin(rotation);

        var launchDist = this.getRadius() * 1.2;

        var relVel = 3;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;

        entityManager.fireAlienBullet(
            this.cx + dX * launchDist, this.cy + dY * launchDist,
            relVelX, relVelY, rotation);

    }
};

Entity.prototype.wrapPosition = function () {
    this.cx = util.wrapRange(this.cx, 0, mapManager.rightX);
    if (this.cx < mapManager.leftX)
        this.cx = mapManager.screenRight - (mapManager.Leftx + this.cx);
    if (this.cx > mapManager.rightX)
        this.cx = mapManager.screenLeft + (this.cx - mapManager.rightX);

};
Entity.prototype.wrapMainView = function (x) {
    x = util.wrapRange(x, 0, mapManager.rightX);
    mapManager.screenLeft = x - 450;
    mapManager.screenRight = x + 450;
}