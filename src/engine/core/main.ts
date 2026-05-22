// Main game loop

import { g_ctx }    from '../utils/config';
import { eatKey }   from '../input/keys';
import { mapManager } from '../managers/mapManager';
import { update }   from './update';
import { render }   from './render';

export interface IGame {
    gatherInputs?(): void;
    updateSimulation(du: number): void;
    renderSimulation(ctx: CanvasRenderingContext2D): void;
}

export const main = {

    _frameTime_ms:      null as number | null,
    _frameTimeDelta_ms: null as number | null,
    _isGameOver:        false,
    _doTimerShow:       false,
    _game:              null as IGame | null,
    paused:             false,

    KEY_QUIT: 'Q'.charCodeAt(0),

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
        if (eatKey(this.KEY_QUIT)) { this.gameOver(); return; }
        if (this._game && this._game.gatherInputs) this._game.gatherInputs();
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
        ctx.fillText('MMGR left  ' + Math.floor(mapManager.screenLeft),  50, y + 50);
        ctx.fillText('MMGR right ' + Math.floor(mapManager.screenRight), 50, y + 60);
    },

    init(): void {
        g_ctx.fillStyle = "white";
        this._requestNextIteration();
    }

};
