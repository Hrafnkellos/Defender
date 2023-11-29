// import { SoundManager } from "/DEFENDER!_files/SoundManager.js"

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ====================
// CREATE INITIAL SHIPS
// ====================

function createInitialShips() {

    entityManager.generateShip({
        cx : 2000,
        cy : 300
    });
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {

    processDiagnostics();

    entityManager.update(du);
    gameManager.decreaseTimeToBaiter(du);
    // Prevent perpetual firing!
    eatKey(Ship.prototype.KEY_FIRE);
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useAveVel = true;
var g_renderSpatialDebug = false;
var g_songIsOn = false;

var KEY_MIXED     = keyCode('M');
var KEY_AVE_VEL   = keyCode('V');
var KEY_SPATIAL   = keyCode('X');
var KEY_THEME     = keyCode('M');
var KEY_RESTART   = keyCode('Y');
var KEY_HALT      = keyCode('H');

function processDiagnostics() {

	if (eatKey(KEY_THEME)){
        if(!g_songIsOn){
            sManager.playSound(12,1,0.1,true,0);
            g_songIsOn = true;
        }
        else{
            sManager.stopSound();
            g_songIsOn = false;
        }
    }

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_HALT)) entityManager.haltShips();

    if (eatKey(KEY_RESTART) && !gameManager.lives) entityManager.resetShips();
}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {

	mapManager.landscapeRender(ctx);
    entityManager.render(ctx);
    mapManager.miniMapRender(ctx);
    gameManager.renderGameInfo(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);
}


// ==============
// PRELOAD IMAGES
// ==============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        baiter   : "assets/images/baiter_small.png",
        human    : "assets/images/human_bob_small.png",
        defender : "assets/images/ship.png",
        defender2: "assets/images/mothership_small.png",
        defender3: "assets/images/swarmer_small.png",
        lander   : "assets/images/lander_small.png",
        mutant   : "assets/images/mutant_small.png",
        life     : "assets/images/ship.png",
		landscape: "assets/images/landscape.png",
        creep    : "assets/images/creep1.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

let g_sprites = {};

function preloadDone() {

    g_sprites.lander    = new Sprite({'image': g_images.lander, "celWidth": 128, "celHeight": 128, "Cols": 8, "Rows": 2, "Cels": 16 });
    g_sprites.mutant    = new Sprite({'image': g_images.mutant, "celWidth": 128, "celHeight": 128, "Cols": 8, "Rows": 1, "Cels": 8 });
    g_sprites.human     = new Sprite({'image': g_images.human, "celWidth": 128, "celHeight": 128, "Cols": 8, "Rows": 4, "Cels": 32 });
 	g_sprites.defender  = new Sprite({'image': g_images.defender, "celWidth": 512, "celHeight": 512, "Cols": 4, "Rows": 2, "Cels": 7 });
    g_sprites.defender2 = new Sprite({'image': g_images.defender2, "celWidth": 256, "celHeight": 256, "Cols": 8, "Rows": 3, "Cels": 24 });
    g_sprites.defender3 = new Sprite({'image': g_images.defender3, "celWidth": 256, "celHeight": 256, "Cols": 8, "Rows": 3, "Cels": 24 });
    g_sprites.creep1    = new Sprite({'image': g_images.baiter, "celWidth": 256, "celHeight": 256, "Cols": 8, "Rows": 2, "Cels": 12 });
    g_sprites.landscape = new Sprite(g_images.landscape);
	g_sprites.life      = new Sprite({'image': g_images.defender, "celWidth": 512, "celHeight": 512, "Cols": 4, "Rows": 2, "Cels": 7 });

    entityManager.init();
    createInitialShips();

    main.init();
}

// =============
// PRELOAD AUDIO
// =============

// var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var context;
var sManager;

function preloadSound() {
  try {
    // Fix up for prefixing
    context = new AudioContext();
    sManager = new SoundManager(context);
  }
  catch(e) {
      console.log(e, 'Web Audio API is not supported in this browser')
    alert('Web Audio API is not supported in this browser');
  }
}

// Kick it off
preloadSound();
requestPreloads();