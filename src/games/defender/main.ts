// Defender game entry point — wired up with Vite as module bundler.

import { entityManager as engineEntityManager } from '../../engine/managers/entityManager';
import { mapManager }      from '../../engine/managers/mapManager';
import { eatKey, keyCode } from '../../engine/input/keys';
import '../../engine/input/mouse'; // registers mouse event listeners as a side effect
import { main }            from '../../engine/core/main';
import { render as engineRender } from '../../engine/core/render';
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
        mapManager.miniMapRender(ctx, engineRender.panelView);
        gameManager.renderGameInfo(ctx);

        if (g_renderSpatialDebug) spatialManager.render(ctx);
    },

    reset(): void {
        gameManager.resetGame();
        if (g_songIsOn) {
            sound?.stopSound();
            sound?.playSound(12, 1, 0.1, true, 0);
        }
    },

    getControls(): string[] {
        return [
            'Arrow Up / W     Move Up',
            'Arrow Down / S   Move Down',
            'Arrow Left / A   Move Left',
            'Arrow Right / D  Move Right',
            'Space            Fire',
            'Ctrl / Tab       Bomb',
            'Shift / E        Hyperspace (warp)',
            'M                Toggle Music',
            'Escape           Pause Menu',
        ];
    },

    onMusicToggle(enabled: boolean): void {
        if (!sound) return;
        sound.musicEnabled = enabled;
        if (enabled && g_songIsOn) {
            sound.playSound(12, 1, 0.1, true, 0);
        } else if (!enabled) {
            g_songIsOn = false;
        }
    },

    onSfxToggle(enabled: boolean): void {
        if (sound) sound.sfxEnabled = enabled;
    },

};

// ─── PRELOAD IMAGES ───────────────────────────────────────────────────────────

const g_images: Record<string, HTMLImageElement> = {};

function requestPreloads(): void {
    const base = import.meta.env.BASE_URL;
    const requiredImages: Record<string, string> = {
        baiter   : base + "assets/images/baiter_small.png",
        human    : base + "assets/images/human_bob_small.png",
        defender : base + "assets/images/ship.png",
        defender2: base + "assets/images/mothership_small.png",
        defender3: base + "assets/images/swarmer_small.png",
        lander   : base + "assets/images/lander_small.png",
        mutant   : base + "assets/images/mutant_small.png",
        life     : base + "assets/images/ship.png",
        landscape: base + "assets/images/landscape.png",
        creep    : base + "assets/images/creep1.png",
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
        const base    = import.meta.env.BASE_URL;
        const context = new AudioContext();
        initSound(new SoundManager(context, [
            base + 'assets/sounds/bulletFire.ogg',    // 0
            base + 'assets/sounds/bulletZapped.ogg',  // 1
            base + 'assets/sounds/rockEvaporate.ogg', // 2
            base + 'assets/sounds/rockSplit.ogg',     // 3
            base + 'assets/sounds/shipWarp.ogg',      // 4
            base + 'assets/sounds/death1.ogg',        // 5
            base + 'assets/sounds/death2.ogg',        // 6
            base + 'assets/sounds/expl1.ogg',         // 7
            base + 'assets/sounds/expl2.ogg',         // 8
            base + 'assets/sounds/lazer1.ogg',        // 9
            base + 'assets/sounds/lazer2.ogg',        // 10
            base + 'assets/sounds/lazer3.ogg',        // 11
            base + 'assets/sounds/Term2Theme.mp3',    // 12
        ]));
    } catch (e) {
        console.log(e, 'Web Audio API is not supported in this browser');
    }
}

// Kick it off
preloadSound();
requestPreloads();
