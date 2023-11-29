"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ====
// Human
// ====

// A generic contructor which accepts an arbitrary descriptor object
function Human(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.human;
    this.scale = this.scale || 0.2;

    this.cx = util.getRandomInt(0, mapManager.rightX - this.getRadius() * 2);
    this.cy = util.getRandomInt(g_canvas.height - 5, g_canvas.height) - this.getRadius();
    this.isAbducted = false;
    this.travelPoint = util.randPoint(0, mapManager.rightX - this.getRadius(), this.cy, this.cy);

    /*
        // Diagnostics to check inheritance stuff
        this._HumanProperty = true;
        console.dir(this);
    */

};

Human.prototype = new Entity();

Human.prototype.velX = 1;
Human.prototype.velY = 0;
Human.prototype.isAirborne = false;
Human.prototype.isAbducted = false;
Human.prototype.isTracked = false;
Human.prototype.abductor = false;
Human.prototype.baseVel = 0.5;
Human.prototype.entityType = "human";

Human.prototype.update = function (du) {

    //Unregister and check for death
    this.sprite.animate();
    spatialManager.unregister(this);
    if (this._isDeadNow) return entityManager.KILL_ME_NOW;


    if (this.isAbducted) {
        //get position of abductor/ship and update accordingly
        this.travelPoint = this.abductor.getPos();
        this.velX = this.abductor.velX;
        this.velY = this.abductor.velY;

        //Due to key input we need to do this this way when the ship catches humans
        if (this.abductor.entityType === "ship") {
            this.cy = this.abductor.getPos().posY + this.getRadius() * 2;
        }

    }
    else if (this.cy + (this.getRadius()) >= g_canvas.height) {
        //Stop falling if we're at the bottom
        this.isAirborne = false;
        this.velY = 0;
    }
    else {
        //And lastly if we're not falling nor being abducted lets take a walk
        var travelPointVel = util.moveAround(this.travelPoint, this, this.posY, this.posY, 3);
        this.velX = travelPointVel.velX;
        this.travelPoint = travelPointVel.travelPoint;
    }
    this.cx += this.velX * du;
    this.cy += this.velY * du;
    this.wrapPosition();

    spatialManager.register(this);
};

Human.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 1.1;
};

Human.prototype.abduct = function (abductor) {
    this.abductor = abductor;
    this.isAirborne = false;
    this.isAbducted = true;
};

Human.prototype.release = function () {
    gameManager.increaseScore(500);
    this.abductor = false;
    this.isAirborne = true;
    this.isAbducted = false;
    this.isTracked = false;
    this.velY = 1;
    this.velX = 0;
};

Human.prototype.takeBulletHit = function () {
    this.kill();
    // if (this.abductor != null)
    // {
    //     this.abductor.hasHuman = false;
    // }
};

Human.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawWrappedCentredAt(
        ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation
    );
};
