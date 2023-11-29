"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

//Code Borrowed from
//http://html5hub.com/build-a-javascript-particle-system/#i.c21hbvns9faiwf

var particleSize = 4;

function Particle(descr, point, velocity, acceleration) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.position = point || new Vector(2000, 110);
    this.velocity = velocity || new Vector(0, 0);
    this.acceleration = acceleration || new Vector(0, 0);
    this.randomisePosition();
}

Particle.prototype = new Entity();

Particle.prototype.cx = 0;
Particle.prototype.cy = 0;
Particle.prototype.velX = 0;
Particle.prototype.velY = 0;
Particle.prototype.accelX = 0;
Particle.prototype.accelY = 0;
Particle.prototype.entityType = "particle";
Particle.prototype.fading = false;
Particle.prototype.fillStyle = "";

Particle.prototype.lifeSpan = 650 / NOMINAL_UPDATE_INTERVAL;

Particle.prototype.randomisePosition = function () {
    var nx = this.cx || Math.random() * (mapManager.rightX + 500) - 250;//g_canvas.width;
    var ny = this.cy || Math.random() * (g_canvas.height - 200) + 100;
    this.position.x = nx;
    this.position.y = ny;
    this.rotation = this.rotation || 0;
};

Particle.prototype.randomiseVelocity = function () {
    var MIN_SPEED = 20,
        MAX_SPEED = 70;

    var speed = util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS;
    var dirn = Math.random() * consts.FULL_CIRCLE;

    this.velX = this.velX || speed * Math.cos(dirn);
    this.velY = this.velY || speed * Math.sin(dirn);

    var MIN_ROT_SPEED = 0.5,
        MAX_ROT_SPEED = 2.5;

    this.velRot = this.velRot ||
        util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED) / SECS_TO_NOMINALS;
};

Particle.prototype.move = function (du) {
    this.velocity.add(this.acceleration, du);
    this.position.add(this.velocity, du);
};

Particle.prototype.update = function (du) {
    var fillStyles = ['fd0d40', 'fff13a', '8ef90f', 'edfffe', 'd457f8', 'f27734'];
    var randColor = util.getRandomInt(0, 5);
    this.fillStyle = fillStyles[randColor];

    if (this.fading) this.lifeSpan -= du;
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    this.move();
    this.cx = this.position.x;
    this.cy = this.position.y;
};

Particle.prototype.render = function (ctx) {
    var fadeThresh = Particle.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh && this.fading) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }
    var oldStyle = ctx.fillStyle;
    var position = this.position;
    util.wrappedcenteredFillBox(ctx, this.cx - mapManager.screenLeft, this.cy, particleSize / 2, particleSize / 2, this.fillStyle);

    ctx.globalAlpha = 1;
    ctx.fillStyle = oldStyle;
};
