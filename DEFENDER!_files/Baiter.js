"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ====
// Baiter
// ====

// A generic contructor which accepts an arbitrary descriptor object
function Baiter(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Default sprite and scale, if not otherwise specified
    //this.sprite = this.sprite || g_sprites.baiter;
    this.sprite = this.sprite || g_sprites.creep1;
    this.scale  = this.scale  || 0.18;

    var shipPos = entityManager.getShipPos();
    this.cx = util.randRange(shipPos.posX+160, shipPos.posX+240);
    this.cy = util.randRange(shipPos.posY-80, shipPos.posY-60);

    this.rateOfFire = 700;
    this.timeToFire = this.rateOfFire * Math.random();
    this.travelPoint = util.randPoint(shipPos.posX-50, shipPos.posX+50, shipPos.posY-80, shipPos.posY-50);
/*
    // Diagnostics to check inheritance stuff
    this._BaiterProperty = true;
    console.dir(this);
*/

};

Baiter.prototype = new Entity();

Baiter.prototype.velX = 1;
Baiter.prototype.velY = 1;
Baiter.prototype.points = 200;
Baiter.prototype.entityType = "baiter";
Baiter.prototype.baseVel = 2;
Baiter.prototype.chanceOfFire = 0.8;
Baiter.prototype.death =  function(){sManager.playSound(5, 1, 0.1);}


Baiter.prototype.update = function (du) {

    this.sprite.animate();
    //Unregister and check for death
    spatialManager.unregister(this);
    if(this._isDeadNow) {
      this.death();
      entityManager.generateParticleExplosion(this.cx,this.cy);
      return entityManager.KILL_ME_NOW;
    }

    var hitEntity = this.isColliding();
    if(hitEntity){
      if(hitEntity.entityType !== "lander" && hitEntity.entityType !== "human" && hitEntity.entityType !== "baiter")
      this.death();
      this.kill();
    }

    //maybe alien a bullet
    this.maybeFireBullet(du);

    //Follow set a travelPoint which of the position of the ship.
    var shipPos = entityManager.getShipPos();
    var travelPointVel = util.moveAround(this.travelPoint, this, shipPos.posY-90, shipPos.posY+90, 3);
    this.velX = travelPointVel.velX;
    this.velY = travelPointVel.velY;
    this.travelPoint = travelPointVel.travelPoint;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.wrapPosition();
    spatialManager.register(this);


};


Baiter.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};


Baiter.prototype.takeBulletHit = function () {
    this.kill();
    gameManager.increaseScore(200);
};


Baiter.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawWrappedCentredAt(
        ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation
    );
};
