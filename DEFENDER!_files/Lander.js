// ====
// Lander
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Lander(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.lander;
    this.scale  = this.scale  || 0.3;

    this.cx = util.randRange(0, mapManager.rightX-this.getRadius());//g_canvas.width);
    this.cy = util.randRange(100+this.getRadius(), g_canvas.height);//for minimap

    this.travelPoint = util.randPoint(0, mapManager.rightX, 100+this.getRadius(), g_canvas.height-this.getRadius());

	this.rateOfFire = 1000;
	this.timeToFire = this.rateOfFire * Math.random();

/*
    // Diagnostics to check inheritance stuff
    this._LanderProperty = true;
    console.dir(this);
*/

};

Lander.prototype = new Entity();

Lander.prototype.velX = 0;
Lander.prototype.velY = 0;
Lander.prototype.baseVel = 2;
Lander.prototype.mutated = false;
Lander.prototype.chanceOfFire = 0.05;
Lander.prototype.points = 150;
Lander.prototype.entityType = "lander";
Lander.prototype.hasHuman = undefined;
Lander.prototype.death =  function(){sManager.playSound(5, 1, 0.1);}

Lander.prototype.update = function (du) {

    //Unregister and check for death
    this.sprite.animate();
    spatialManager.unregister(this);
    if(this._isDeadNow) {
    	this.death();
        this.releaseHuman();
    	entityManager.generateParticleExplosion(this.cx,this.cy);
    	return entityManager.KILL_ME_NOW;
    }
    //Refers to the top of the canvas.
    var top = 100+this.getRadius();

    if(this.cy-this.getRadius() <= top && this.hasHuman && !this.mutated)
    {
      this.mutate();
    }

    var travelPointVel = util.moveAround(this.travelPoint, this, 100+this.getRadius(), g_canvas.height, 3);
    this.velX = travelPointVel.velX;
    this.velY = travelPointVel.velY;
    this.travelPoint = travelPointVel.travelPoint;
    if(!this.hasHuman && this.baseVel < 2) this.baseVel = 2;

    if(!this.mutated && !this.hasHuman)
    {
      //Check if there is a human in the current cell
      var human = spatialManager.findEntityInRangeByType(this.getPos().posX, this.getPos().posY, 100, ["human"]);

      if(human.entityType === "human" && !human.isTracked)
      {
        human.isTracked = true;
        this.hasHuman = human;
        var hx = this.hasHuman.getPos().posX,
            hy = this.hasHuman.getPos().posY - this.hasHuman.getRadius() -this.getRadius();

        this.travelPoint = {posX: hx, posY: hy};
        this.baseVel = 0.75;
      }
    }

    //If we're tracking a human and have not abducted it yet let's
    //update our travelPoint as the human moves.
    if(!this.mutated && this.hasHuman && !this.hasHuman.isAbducted)
    {
        //If the Lander is targeting a human
        //we update coordinates accordingly
        var hx = this.hasHuman.getPos().posX,
            hy = this.hasHuman.getPos().posY - this.hasHuman.getRadius() -this.getRadius();
        this.travelPoint = {posX: hx, posY: hy};
    }

    //maybe alien a bullet
    this.maybeFireBullet(du);

    this.cx += this.velX * du;
    this.cy += this.velY * du;


    this.wrapPosition();

    spatialManager.register(this);
};


Lander.prototype.mutate = function(task) {
	this.rateOfFire = 500;
    this.mutated = true;
	try{this.hasHuman.kill();}catch(err){}
    this.hasHuman = false;
    this.baseVel =  2 * 1.5;
    this.sprite = g_sprites.mutant;
};


Lander.prototype.abduct = function(task) {
    this.mutated = true;
};


Lander.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};


Lander.prototype.releaseHuman = function () {
    if(this.hasHuman)
    {
        this.hasHuman.release();
    }
    this.hasHuman = false;
}
Lander.prototype.takeBulletHit = function () {
    this.kill();
    this.releaseHuman();
	gameManager.increaseScore(this.points);
};

Lander.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawWrappedCentredAt(
        ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation
    );
};
