// Defender game entry point — wired up with Vite as module bundler.

import { entityManager as engineEntityManager } from '../../engine/managers/entityManager';
import { mapManager }      from '../../engine/managers/mapManager';
import { eatKey, keyCode } from '../../engine/input/keys';
import { main }            from '../../engine/core/main';
import { spatialManager }  from '../../engine/managers/spatialManager';
import { imagesPreload }   from '../../engine/utils/imagesPreload';
import { SoundManager }    from '../../engine/managers/soundManager';
import { Sprite }          from '../../engine/rendering/Sprite';

import { sound, initSound } from './sound';
import { sprites }          from './sprites';
import { entityManager }    from './managers/entityManager';
import { gameManager }      from './managers/gameManager';

// ─── DIAGNOSTICS FLAGS ────────────────────────────────────────────────────────

let g_renderSpatialDebug = false;
let g_songIsOn           = false;

const KEY_RESTART   = keyCode('Y');
const KEY_QUIT_GAME = keyCode('N');
const KEY_MIXED     = keyCode('Z');
const KEY_SPATIAL   = keyCode('X');
const KEY_THEME     = keyCode('M');
const KEY_HALT      = keyCode('H');

function processDiagnostics(): void {
    if (eatKey(KEY_THEME)) {
        if (!g_songIsOn) { sound?.playSound(12, 1, 0.1, true, 0); g_songIsOn = true; }
        else             { sound?.stopSound(); g_songIsOn = false; }
    }
    if (eatKey(KEY_MIXED))   { /* toggle mixed actions — future use */ }
    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;
    if (eatKey(KEY_HALT))    entityManager.haltShips();
}

// ─── GAME HOOKS ───────────────────────────────────────────────────────────────

const game = {

    updateSimulation(du: number): void {
        if (eatKey(KEY_RESTART)   && !gameManager.lives) gameManager.resetGame();
        if (eatKey(KEY_QUIT_GAME) && !gameManager.lives) main.gameOver();

        processDiagnostics();

        engineEntityManager.update(du);
        gameManager.decreaseTimeToBaiter(du);

        if (entityManager._humans.length  === 0) entityManager.mutateAll();
        if (entityManager._landers.length === 0) gameManager.nextLevel();

        eatKey(32); // consume spacebar (KEY_FIRE)
    },

    renderSimulation(ctx: CanvasRenderingContext2D): void {
        // Bomb visual flash effect
        if (gameManager.bombVisuals > 0) {
            const colors = ["white", "black", "red", "green", "yellow", "blue", "purple"];
            const old    = ctx.fillStyle;
            ctx.fillStyle = colors[Math.floor(Math.random() * 7)];
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = old;
            gameManager.bombVisuals -= 20;
        }

        mapManager.landscapeRender(ctx);
        engineEntityManager.render(ctx);
        mapManager.miniMapRender(ctx);
        gameManager.renderGameInfo(ctx);

        if (g_renderSpatialDebug) spatialManager.render(ctx);
    }

};

// ─── PRELOAD IMAGES ───────────────────────────────────────────────────────────

const g_images: Record<string, HTMLImageElement> = {};

function requestPreloads(): void {
    const requiredImages: Record<string, string> = {
        baiter   : "assets/images/baiter_small.png",
        human    : "assets/images/human_bob_small.png",
        defender : "assets/images/ship.png",
        defender2: "assets/images/mothership_small.png",
        defender3: "assets/images/swarmer_small.png",
        lander   : "assets/images/lander_small.png",
        mutant   : "assets/images/mutant_small.png",
        life     : "assets/images/ship.png",
        landscape: "assets/images/landscape.png",
        creep    : "assets/images/creep1.png",
    };
    imagesPreload(requiredImages, g_images, preloadDone);
}

function preloadDone(): void {
    sprites.lander    = new Sprite({ image: g_images.lander,    celWidth: 128, celHeight: 128, Cols: 8, Rows: 2, Cels: 16 });
    sprites.mutant    = new Sprite({ image: g_images.mutant,    celWidth: 128, celHeight: 128, Cols: 8, Rows: 1, Cels: 8  });
    sprites.human     = new Sprite({ image: g_images.human,     celWidth: 128, celHeight: 128, Cols: 8, Rows: 4, Cels: 32 });
    sprites.defender  = new Sprite({ image: g_images.defender,  celWidth: 512, celHeight: 512, Cols: 4, Rows: 2, Cels: 7  });
    sprites.defender2 = new Sprite({ image: g_images.defender2, celWidth: 256, celHeight: 256, Cols: 8, Rows: 3, Cels: 24 });
    sprites.defender3 = new Sprite({ image: g_images.defender3, celWidth: 256, celHeight: 256, Cols: 8, Rows: 3, Cels: 24 });
    sprites.creep1    = new Sprite({ image: g_images.baiter,    celWidth: 256, celHeight: 256, Cols: 8, Rows: 2, Cels: 12 });
    sprites.landscape = new Sprite(g_images.landscape);
    sprites.life      = new Sprite({ image: g_images.defender,  celWidth: 512, celHeight: 512, Cols: 4, Rows: 2, Cels: 7  });

    // Wire up game-specific callbacks for the engine's mapManager
    mapManager.setShipPosFn(() => entityManager.getShipPos());
    mapManager.setLandscapeRenderFn((ctx) => {
        const landscape = sprites.landscape!;
        const spritePos = landscape.width - mapManager.screenRight;
        landscape.drawWrappedCentredAt(ctx, spritePos, 400);
    });

    entityManager.registerWithEngine();
    entityManager.init();
    entityManager.generateShip({ cx: 2000, cy: 300 });

    main.registerGame(game);
    main.init();
}

// ─── PRELOAD AUDIO ────────────────────────────────────────────────────────────

function preloadSound(): void {
    try {
        const context = new AudioContext();
        initSound(new SoundManager(context));
    } catch (e) {
        console.log(e, 'Web Audio API is not supported in this browser');
    }
}

// Kick it off
preloadSound();
requestPreloads();
