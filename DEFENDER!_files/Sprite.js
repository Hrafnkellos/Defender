// ============
// SPRITE STUFF
// ============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// Construct a "sprite" from the given `image`,
//
function aSprite(sx, sy, width, height) {
    this.sx = sx;
    this.sy = sy;
    this.width = width;
    this.height = height;
}

function Sprite(image) {
    if(typeof image.Cels !== 'undefined')
    {
        this.image = image.image;
        this.celWidth = image.celWidth;
        this.celHeight = image.celHeight;
        this.numCols = image.Cols;
        this.numRows = image.Rows;
        this.numCels = image.Cels;
        this.width = image.celWidth;
        this.height = image.celHeight;
        this.scale = image.scale || 1;
        this.spriteArray = [];
        var sprite;
        for (var row = 0; row < this.numRows; ++row) {
            for (var col = 0; col < this.numCols; ++col) {
                sprite = new aSprite(col * this.celWidth, row * this.celHeight, this.celWidth, this.celHeight) 
                this.spriteArray.push(sprite);
            }
        }
        this.aCounter = 0;
        this.slowdownticker = 0;
        this.slowdown = 1;
    }
    else
    {
        this.image = image;
        this.width = image.width;
        this.height = image.height;
        this.scale = 1;
    }
    
}

Sprite.prototype.drawAt = function (ctx, x, y) {
    ctx.drawImage(this.image, 
                  x, y);
};

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, rotation,flipp) {
    if (rotation === undefined) rotation = 0;
    
    var w = this.width,
        h = this.height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.scale(this.scale, this.scale);
    
    if(flipp){
		ctx.scale(1, -1);
		h *= -1;
    }
    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    if( this.spriteArray != null)
    {
        var aS = this.spriteArray[this.aCounter];
        var wi = aS.width;
        var he = aS.height;
        if(flipp)w *= -1;

        ctx.drawImage(this.image, aS.sx, aS.sy, wi, he, -wi/2, -he/2, wi, he);
    }
    else ctx.drawImage(this.image, -w/2, -h/2);
    
    ctx.restore();
};

Sprite.prototype.animate = function () 
{
    if( this.spriteArray != null)
    {
        if(this.aCounter === this.numCels-1) 
        	this.aCounter = 0;
        if(this.slowdownticker === this.slowdown )
        {
            this.aCounter++;
            this.slowdownticker = 0;
        }
        else 
        	this.slowdownticker++;
    }

};
Sprite.prototype.animateReset = function () 
{
    if( this.spriteArray != null)
    {
        this.aCounter = 0;
        this.slowdownticker = 0;
    }
};

Sprite.prototype.drawWrappedCentredAt = function (ctx, cx, cy, rotation, flipp) {
    
    // Get "screen width"
    var sw = g_canvas.width;
    // Draw primary instance
    this.drawWrappedVerticalCentredAt(ctx, cx, cy, rotation,flipp);
    
    // Left and Right wraps
    this.drawWrappedVerticalCentredAt(ctx, cx - mapManager.rightX, cy, rotation,flipp);
    this.drawWrappedVerticalCentredAt(ctx, cx + mapManager.rightX, cy, rotation,flipp);
};

Sprite.prototype.drawWrappedVerticalCentredAt = function (ctx, cx, cy, rotation,flipp) {

    // Get "screen height"
    var sh = g_canvas.height;
    
    // Draw primary instance
    this.drawCentredAt(ctx, cx, cy, rotation,flipp);
    
    // Top and Bottom wraps
    //this.drawCentredAt(ctx, cx, cy - sh, rotation,flipp);
    //this.drawCentredAt(ctx, cx, cy + sh, rotation,flipp);
};
