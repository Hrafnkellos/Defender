// Main game loop

import { g_canvas, g_ctx } from '../utils/config';
import { eatKey }           from '../input/keys';
import { camera }           from '../managers/camera';
import { update }           from './update';
import { render }           from './render';
import { pauseMenu }        from './pauseMenu';

export interface IGame {
    gatherInputs?(): void;
    updateSimulation(du: number): void;
    renderSimulation(ctx: CanvasRenderingContext2D): void;
    reset?(): void;
    getControls?(): string[];
    onMusicToggle?(enabled: boolean): void;
    onSfxToggle?(enabled: boolean): void;
}

const KEY_QUIT   = 'Q'.charCodeAt(0);
const KEY_ESCAPE = 27;

export const main = {

    _frameTime_ms:      null as number | null,
    _frameTimeDelta_ms: null as number | null,
    _isGameOver:        false,
    _doTimerShow:       false,
    _game:              null as IGame | null,
    paused:             false,
    musicEnabled:       true,
    sfxEnabled:         true,

    registerGame(game: IGame): void {
        this._game = game;
    },

    iter(frameTime: number): void {
        this._updateClocks(frameTime);
        this._iterCore(this._frameTimeDelta_ms ?? 0);
        this._debugRender(g_ctx);
        if (!this._isGameOver) this._requestNextIteration();
    },

    _updateClocks(frameTime: number): void {
        if (this._frameTime_ms === null) this._frameTime_ms = frameTime;
        this._frameTimeDelta_ms = frameTime - this._frameTime_ms;
        this._frameTime_ms      = frameTime;
    },

    _iterCore(dt: number): void {
        if (eatKey(KEY_QUIT)) { this.gameOver(); return; }

        if (this.paused) {
            const stepFrame = pauseMenu.handleInput();
            if (stepFrame && this._game) this._game.updateSimulation(1);
            render.run(g_ctx);
            return;
        }

        if (eatKey(KEY_ESCAPE)) {
            this.paused = true;
            pauseMenu.selectedIndex   = 0;
            pauseMenu.showingControls = false;
            return;
        }

        if (this._game?.gatherInputs) this._game.gatherInputs();
        update.run(dt);
        render.run(g_ctx);
    },

    gameOver(): void {
        this._isGameOver = true;
        console.log("gameOver: quitting...");
    },

    _requestNextIteration(): void {
        window.requestAnimationFrame((t) => this.iter(t));
    },

    _debugRender(ctx: CanvasRenderingContext2D): void {
        const TOGGLE_TIMER_SHOW = 'T'.charCodeAt(0);
        if (eatKey(TOGGLE_TIMER_SHOW)) this._doTimerShow = !this._doTimerShow;
        if (!this._doTimerShow) return;

        const y = 350;
        ctx.fillText('FT ' + this._frameTime_ms,        50, y + 10);
        ctx.fillText('FD ' + this._frameTimeDelta_ms,   50, y + 20);
        ctx.fillText('UU ' + update._prevDu,            50, y + 30);
        ctx.fillText('CAM left  ' + Math.floor(camera.screenLeft),  50, y + 50);
        ctx.fillText('CAM right ' + Math.floor(camera.screenRight), 50, y + 60);
    },

    init(): void {
        g_ctx.fillStyle = "white";
        _resizeCanvas();
        window.addEventListener('resize', _resizeCanvas);
        this._requestNextIteration();
    }

};

function _resizeCanvas(): void {
    const aspect = g_canvas.width / g_canvas.height;
    const wW = window.innerWidth;
    const wH = window.innerHeight;
    if (wW / wH > aspect) {
        g_canvas.style.width  = (wH * aspect) + 'px';
        g_canvas.style.height = wH + 'px';
    } else {
        g_canvas.style.width  = wW + 'px';
        g_canvas.style.height = (wW / aspect) + 'px';
    }
}
