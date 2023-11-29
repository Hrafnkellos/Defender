
"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


/*
spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.
*/

var spatialManager = {

    // "PRIVATE" DATA

    _nextSpatialID: 1, // make all valid IDs non-falsey (i.e. don't start at 0)

    _entities: [],

    // PUBLIC METHODS

    getNewSpatialID: function () {

        // TODO: YOUR STUFF HERE!
        this._nextSpatialID++;
        return this._nextSpatialID - 1;
    },

    register: function (entity) {
        var pos = entity.getPos();
        var spatialID = entity.getSpatialID();

        //viljum ekki register particle
        if (entity.entityType == "particle") return;
        this._entities.push(entity);
    },

    unregister: function (entity) {
        var spatialID = entity.getSpatialID();

        for (var i = 0; i < this._entities.length; ++i) {
            if (spatialID === this._entities[i].getSpatialID())
                this._entities.splice(i, 1);
        }
    },

    findEntityInRange: function (posX, posY, radius) {

        for (var ID in this._entities) {
            var e = this._entities[ID];
            if (Math.pow(e.getPos().posX - posX, 2) + Math.pow(e.getPos().posY - posY, 2) <= Math.pow(e.getRadius() + radius, 2))
                return e;
        }
    },

    findEntityInRangeByType: function (posX, posY, radius, types, spatialMapping) {
        for (var ID in this._entities) {
            var e = this._entities[ID];
            if (types)
                for (var i = 0; i < types.length; i++) {
                    var type = types[i];
                    if (e.entityType === type) {
                        if (spatialMapping && this.checkSpatialMapping(posX, posY, radius, types, spatialMapping, e)) {
                            return e;
                        }
                        else if (e.spatialMapping && this.checkSpatialMapping(posX, posY, radius, types, e.spatialMapping, e)) {
                            return e;
                        }
                        else if (!spatialMapping) {
                            if (Math.pow(e.getPos().posX - posX, 2) + Math.pow(e.getPos().posY - posY, 2) <= Math.pow(e.getRadius() + radius, 2)) {
                                return e;
                            }
                        }
                    }
                }
        }
        return false;
    },

    checkSpatialMapping: function (posX, posY, radius, types, spatialMapping, e) {
        for (var ii = 0; ii < spatialMapping.length; ii++) {
            var xOffset = spatialMapping[ii][0];
            var yOffset = spatialMapping[ii][1];
            var radOffset = spatialMapping[ii][2];
            if (Math.pow(e.getPos().posX - posX + xOffset, 2) + Math.pow(e.getPos().posY - posY + yOffset, 2) <= Math.pow(e.getRadius() + radius - radOffset, 2)) {
                return true;
            }
        }
        return false;
    },

    render: function (ctx) {
        var oldStyle = ctx.strokeStyle;
        ctx.strokeStyle = "#8B0000";

        for (var ID in this._entities) {
            var e = this._entities[ID];
            //if(mapManager.isOnScreen(e.getPos().posX)){
            if (e.spatialMapping) {
                for (var i = 0; i < e.spatialMapping.length; i++) {
                    util.strokeCircle(ctx, e.getPos().posX - mapManager.screenLeft + e.spatialMapping[i][0], e.getPos().posY + e.spatialMapping[i][1], e.getRadius() - e.spatialMapping[i][2]);
                }
            }
            else
                util.strokeCircle(ctx, e.getPos().posX - mapManager.screenLeft, e.getPos().posY, e.getRadius());
        }
        ctx.strokeStyle = oldStyle;
    }

}
