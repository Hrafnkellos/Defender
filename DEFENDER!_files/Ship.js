"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ==========
// SHIP STUFF
// ==========

// A generic contructor which accepts an arbitrary descriptor object
function Ship(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();

    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.defender;

    // Set normal drawing scale, and warp state off
    this._scale = 0.30;
    this._isWarping = false;
    this.friendlyFire = false;
};

Ship.prototype = new Entity();

Ship.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_rotation = this.rotation;
};

Ship.prototype.KEY_UP     = 38; //cursor up
Ship.prototype.KEY_DOWN   = 40; //cursor down
Ship.prototype.KEY_LEFT   = 37; //cursor left
Ship.prototype.KEY_RIGHT  = 39; //cursor right

Ship.prototype.ALT_KEY_UP     = 'W'.charCodeAt(0);
Ship.prototype.ALT_KEY_DOWN   = 'S'.charCodeAt(0);
Ship.prototype.ALT_KEY_LEFT   = 'A'.charCodeAt(0);
Ship.prototype.ALT_KEY_RIGHT  = 'D'.charCodeAt(0);
Ship.prototype.CAMERA_MODE    = 'L'.charCodeAt(0);

Ship.prototype.HYPER_SPACE    = ['E'.charCodeAt(0), 16];// Shift key
Ship.prototype.SMART_BOMB	  = [17, 9]; //Tab key or ctrl key

Ship.prototype.KEY_FIRE       = ' '.charCodeAt(0); //space

// Map Manager Variables
Ship.prototype.leftBoundry = 100;
Ship.prototype.rightBoundry = 500;

// Initial, inheritable, default values
Ship.prototype.rotation = 1.55555;
Ship.prototype.cx = 2000;
Ship.prototype.cy = 200;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 12;
Ship.prototype.numSubSteps = 1;
Ship.prototype.maxVel = 6;
Ship.prototype.inertia = 0.033;
Ship.prototype.rof = true;
Ship.prototype.entityType = "ship";
Ship.prototype.fireRate = 180;
Ship.prototype.flipp = 0;
Ship.prototype.spatialMapping = [[30,0,30], [0,0,30], [-30,0,30]];
Ship.prototype.forcefield = true;

Ship.prototype.cameraMode = true;
Ship.prototype.screenPadding = 240;
Ship.prototype.screenSpeed = 6;
Ship.prototype.screenX = 2000;

Ship.prototype.warpSound =  function(){sManager.playSound(4, 1, 0.1);}
Ship.prototype.explode =  function(){sManager.playSound(7, 1, 0.1);}

Ship.prototype.warp = function () {

	this.reset();
	return;

    this._isWarping = true;
    this._scaleDirn = -1;
    this.warpSound();

    // Unregister me from my old posistion
    // ...so that I can't be collided with while warping
    spatialManager.unregister(this);
};

Ship.prototype._updateWarp = function (du) {

    var SHRINK_RATE = 3 / SECS_TO_NOMINALS;
    this._scale += this._scaleDirn * SHRINK_RATE * du;

    if (this._scale < 0.2) {

        this._moveToASafePlace();
        this.halt();
        this._scaleDirn = 1;

    } else if (this._scale > 1) {

        this._scale = 1;
        this._isWarping = false;

        // Reregister me from my old posistion
        // ...so that I can be collided with again
        spatialManager.register(this);
        spatialManager.register(this);
    }
};

Ship.prototype._moveToASafePlace = function () {

    // Move to a safe place some suitable distance away
    var origX = this.cx,
        origY = this.cy,
        MARGIN = 40,
        isSafePlace = false;

    for (var attempts = 0; attempts < 100; ++attempts) {

        var warpDistance = 100 + Math.random() * g_canvas.height/2-150;
        var warpDirn = Math.random() * consts.FULL_CIRCLE;

        this.cx = origX + warpDistance * Math.sin(warpDirn);
        this.cy = origY - warpDistance * Math.cos(warpDirn);

        // Don't go too near the edges, and don't move into a collision!
        if (!util.isBetween(this.cx, MARGIN, g_canvas.width - MARGIN)) {
            isSafePlace = false;
        } else if (!util.isBetween(this.cy, MARGIN, g_canvas.height - MARGIN)) {
            isSafePlace = false;
        } else {
            isSafePlace = !this.isColliding();
        }
        // Get out as soon as we find a safe place
        if (isSafePlace) break;
    }
};

Ship.prototype.update = function (du) {

    // Handle warping
    if (this._isWarping) {
        this._updateWarp(du);
        return;
    }

    // TODO: YOUR STUFF HERE! --- Unregister and check for death
	spatialManager.unregister(this);

    // Perform movement substeps
    var steps = this.numSubSteps;
    var dStep = du / steps;
    for (var i = 0; i < steps; ++i) {
        this.computeSubStep(dStep);
    }

    this.maybeFireBullet();

	this.maybeDropBomb();

    this.wrapPosition();

    if(eatKey(this.CAMERA_MODE)) this.cameraMode = !this.cameraMode;

    if(eatKey(this.HYPER_SPACE[0]) || eatKey(this.HYPER_SPACE[1]))
    {
        if(this.flipp)this.cx -= 1000;
        else this.cx += 1000;
    }

    if(this.cameraMode)this.MainCamera(du);
    else this.wrapMainView(this.cx);


    if(this.forcefield){
        var hitEntity = this.findHitEntityType(["lander","human", "alienbullet","baiter", "mothership", "swarmer"]);
        if(hitEntity){
            if(hitEntity.entityType !== "bullet" && hitEntity.entityType !== "human")
            {
                this.forcefield = false;
                hitEntity.kill();
            }
            else if(hitEntity.entityType === "human" && !this.hasHuman)
            {
                if(hitEntity.isAirborne && this.cy < 450)
                {
                    this.hasHuman = hitEntity;
                    this.hasHuman.abduct(this);
                }
            }
            else{
                spatialManager.register(this);
            }
        }
    }
    else
    {
        var hitEntity = this.findHitEntityType(["lander", "human", "alienbullet", "baiter", "mothership", "swarmer"], true);
        if (hitEntity) {
        	if(hitEntity.entityType !== "bullet" && hitEntity.entityType !== "human")
            {
        		//hitEntity.kill();
            	this.takeBulletHit();
            }
            else if(hitEntity.entityType === "human" && !this.hasHuman)
            {
                if(hitEntity.isAirborne && this.cy < 450)
                {
                    this.hasHuman = hitEntity;
                    this.hasHuman.abduct(this);
                }
            }
        }else{
            spatialManager.register(this);
        }
    }

    //release human when close to earth
    if(this.cy >= 450 && this.hasHuman)
    {
        this.hasHuman.release();
        this.hasHuman = false;
    }
};

Ship.prototype.MainCamera = function(du){
    if(this.flipp)
        this.screenX -= this.screenSpeed*du;
    else
        this.screenX += this.screenSpeed*du;

    if(this.screenX - this.cx > mapManager.rightX)
    {
        this.screenX = this.screenX-this.cx-mapManager.rightX - this.screenSpeed+15;
    }
    if(this.screenX - this.cx < -mapManager.rightX)
    {
        this.screenX = this.screenX+(2*mapManager.rightX)-this.cx-this.screenSpeed;
    }

    if(this.screenX - this.cx > this.screenPadding)
    {
        this.screenX = this.cx+this.screenPadding;//+(this.screenPadding + this.screenX);
    }
    else if (this.screenX - this.cx < -this.screenPadding)
    {
        this.screenX = this.cx-this.screenPadding;
    }
    else{}

    this.wrapMainView(this.screenX);
}

Ship.prototype.computeSubStep = function (du) {

    //var thrust = this.computeThrustMag();
    var thrust = this.computeThrustMagLeftRight();

    // Apply thrust directionally, based on our rotation
    var accelX = +Math.sin(this.rotation) * thrust;

    //mechanical up and down for ship.
    if (keys[this.KEY_UP] || keys[this.ALT_KEY_UP]) {
        if(!(this.cy - (3.5 + this.getRadius()-30) < 100))
        this.cy -= 3.5 * du;
    }
    if (keys[this.KEY_DOWN] || keys[this.ALT_KEY_DOWN]) {
        if(!(this.cy + (3.5 + this.getRadius()-30) > g_canvas.height))
        this.cy += 3.5 * du;
    }

    //ship slowdown
    if(this.velX !== 0 && this.velX > 0) accelX -= this.inertia;
    if(this.velX !== 0 && this.velX < 0) accelX += this.inertia;
    if(this.velX > 6) this.velX = 6;
    if(this.velX < -6) this.velX = -6;

    this.applyAccel(accelX, du);
};

var NOMINAL_THRUST = +0.2;
var NOMINAL_RETRO  = -0.1;

Ship.prototype.computeThrustMagLeftRight = function () {

    var thrust = 0;

    if (keys[this.KEY_LEFT] || keys[this.ALT_KEY_LEFT]) {
        this.sprite.animate();
        thrust += NOMINAL_THRUST;
        this.flipp = 1;
        if(this.rotation>0)this.rotation = -this.rotation;
    }
    else if (keys[this.KEY_RIGHT] || keys[this.ALT_KEY_RIGHT]) {
        this.sprite.animate();
        thrust += NOMINAL_THRUST;
        this.flipp = 0;
        if(this.rotation<0)this.rotation = -this.rotation;
    }
    else{this.sprite.animateReset();};

    return thrust;
};

Ship.prototype.applyAccel = function (accelX, du) {

    // u = original velocity
    var oldVelX = this.velX;

    // v = u + at
    if(Math.abs(this.velX + accelX) <= this.maxVel) this.velX += accelX * du;
    //if(Math.abs(this.velY + accelY) <= this.maxVel) this.velY += accelY * du;

    // v_ave = (u + v) / 2
    var aveVelX = (oldVelX + this.velX) / 2;
    //var aveVelY = (oldVelY + this.velY) / 2;

    // Decide whether to use the average or not (average is best!)
    var intervalVelX = g_useAveVel ? aveVelX : this.velX;
   // var intervalVelY = g_useAveVel ? aveVelY : this.velY;

    // s = s + v_ave * t
    var nextX = this.cx + intervalVelX * du;
    //var nextY = this.cy + intervalVelY * du;

    // s = s + v_ave * t
    this.cx += du * intervalVelX;
    //this.cy += du * intervalVelY;

	mapManager.screenLeft += du * intervalVelX;
	mapManager.screenRight += du * intervalVelX;

};

Ship.prototype.maybeFireBullet = function () {

    if (keys[this.KEY_FIRE] && this.rof) {

        var dX = +Math.sin(this.rotation);
        var dY = -Math.cos(this.rotation);
        var launchDist = this.getRadius() * 1.2;

        var relVel = this.launchVel*1.7;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;

        entityManager.fireLazer(
           this.cx + dX * launchDist, this.cy + dY * launchDist,
           this.velX + relVelX, this.velY + relVelY,
           this.rotation);

        this.rof = false;
		var thisIndex = entityManager._ships.indexOf(this);
		setTimeout(function(){ entityManager._ships[thisIndex].rof = true;}, this.fireRate);
    }

};

Ship.prototype.maybeDropBomb = function()
{
	if(eatKey(this.SMART_BOMB[0]) || eatKey(this.SMART_BOMB[1]))
	{
		if(gameManager.bombs <= 0) return;
		entityManager.killOnScreen();
		gameManager.bombs--;
		gameManager.bombVisuals = 200;
	}
}

//may need to be adjusted for sprite images.
Ship.prototype.getRadius = function () {
    return (this.sprite.width*this._scale*0.7 / 2) * 0.9;
};

Ship.prototype.takeBulletHit = function () {
    gameManager.decreaseLives();
    this.warp();
    if(this.hasHuman)
    {
        this.hasHuman.kill();
    }
};

Ship.prototype.releaseHuman = function () {
    if(this.hasHuman)
    {
        this.hasHuman.release();
        this.hasHuman = false;
    }
};

Ship.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;
    this._moveToASafePlace();
    this.flipp = 0;
    this.forcefield = true;
    this.explode();

    this.halt();

	mapManager.screenLeft = this.cx - 450;
	mapManager.screenRight = this.cx + 450;
};

Ship.prototype.halt = function () {
    this.velX = 0;
    this.velY = 0;
};

var NOMINAL_ROTATE_RATE = 0.1;

Ship.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    this.sprite.drawWrappedCentredAt(ctx, this.cx - mapManager.screenLeft, this.cy, this.rotation-1.555,this.flipp   );
    if(this.forcefield)
    {
    	util.WrappedFillCircleStyle(ctx, this.cx - mapManager.screenLeft, this.cy, this.getRadius(),  "rgba(0,0,255,0.1)");
    	util.wrappedStrokeCircleStyle(ctx, this.cx - mapManager.screenLeft, this.cy, this.getRadius(),  "rgba(0,0,255,1)");
    }
};
