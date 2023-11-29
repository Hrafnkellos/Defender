"use strict";

// Map - level design
// the whole map is given x co-ords
// the screen is given left-x and right-x cords within the map panel

var mapManager = {
	//prototype for an idea of having the background as an array, so if the x of the background element is
	//within screenLeft - screenRight it gets rendered

	leftX: 0,
	rightX: 4000,
	screenLeft: 1550,
	screenRight: 2450,

	//this is a function to translate the coords for the entire map into the minimap
	transposeToMinimap: function(mapX, mapY)
	{
		var posX = (this.minimap.cx - this.minimap.half_width) + mapX * (this.minimap.half_width * 2) / this.rightX;
		var posY = mapY * (this.minimap.half_height * 2) / g_canvas.height;
		return {posX: posX, posY: posY};
	},

	transposeXToMinimap : function(mapX, mapY)
	{
		return (this.minimap.cx - this.minimap.half_width ) + mapX * (this.minimap.half_width * 2) / this.rightX;
	},

	transposeYToMinimap: function(mapY)
	{
		return mapY * (this.minimap.half_height * 2) / g_canvas.height;
	},

	//a function for rendering the minimap each iteration
	miniMapRender : function(ctx)
	{
		if(g_panelView) this.debugMapRender(ctx);
		else
		{
			//Draw minimap borders
			var oldStroke = ctx.strokeStyle;
			ctx.strokeStyle = "#76EEC6";
			ctx.strokeRect(this.minimap.cx - this.minimap.half_width, 0, this.minimap.half_width*2 , this.minimap.half_height * 2);
			util.drawLine(ctx, 0, 100, g_canvas.width, 100,  "#76EEC6");

			var frameLeft = mapManager.transposeToMinimap(1550, 0).posX,
					frameRight = mapManager.transposeToMinimap(2450, 0).posX,
					lineColor = "white"

			util.drawLine(ctx, frameLeft, 0, frameLeft, 20, lineColor);
			util.drawLine(ctx, frameLeft, 0, frameLeft, 20, lineColor);
			util.drawLine(ctx, frameLeft, 80, frameLeft, 100, lineColor);
			util.drawLine(ctx, frameLeft, 0, frameRight, 0, lineColor);
			util.drawLine(ctx, frameRight, 0, frameRight, 20, lineColor);
			util.drawLine(ctx, frameRight, 0, frameRight, 20, lineColor);
			util.drawLine(ctx, frameRight, 80, frameRight, 100, lineColor);
			util.drawLine(ctx, frameLeft, 100, frameRight, 100, lineColor);

			ctx.strokeStyle = oldStroke;
		}
	},

	minimapFloor: function()
	{
		return (2 * this.minimap.half_height);
	},

	renderToMinimap: function(entity, ctx)
	{		
			var oldFillStyle = ctx.fillStyle;
			var miniX, miniY;
			if( entity.entityType !== "particle" && entity.entityType !== "lazer"
				&& entity.entityType !== "alienbullet" )
			{
				var ship = entityManager._ships[0];
				miniX = util.wrapRange(mapManager.transposeXToMinimap(entity.cx - (ship.cx - 2000)), 450 - this.minimap.half_width, 450 + this.minimap.half_width);
				miniY = mapManager.transposeYToMinimap(entity.cy);
				switch (entity.entityType)
				{
					case "ship":
					ctx.fillStyle = "white";
					break;
					case "lander":
					ctx.fillStyle = "green";
					break;
					case "human":
					ctx.fillStyle = "gray";
					break;
					case "baiter":
					ctx.fillStyle = "blue";
					break;	
					case "mothership":
					ctx.fillStyle = "purple";
					break;
					case "swarmer":
					ctx.fillStyle = "yellow";
					break;
				}
				if(entity.entityType === "ship") util.fillCircle(ctx, 450, miniY, 2);
				else util.fillCircle(ctx, miniX, miniY, 2);
			}
			ctx.fillStyle = oldFillStyle;
	},

	//for rendering
	isOnScreen : function(cx)
	{
		return (cx > this.screenLeft && cx < this.screenRight);
	},

	landscapeRender: function(ctx) {
		var landscape = g_sprites.landscape,
				spritePos = landscape.width - mapManager.screenRight;

    landscape.drawWrappedCentredAt(ctx, spritePos, 400);
	},

	minimap: {
		cx: g_canvas.width/2,
		half_width: g_canvas.width/4,
		half_height: 50
	}
}

