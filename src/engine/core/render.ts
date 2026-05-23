// Generic rendering

import { eatKey }         from '../input/keys';
import { clearCanvas, fillBox } from '../utils/util';
import { main }           from './main';
import { update }         from './update';
import { pauseMenu }      from './pauseMenu';

export const render = {

    _doClear:    true,
    _doBox:      false,
    _undoBox:    false,
    _doFlipFlop: false,
    _doRender:   true,
    panelView:   false, // read by mapManager.miniMapRender
    _frameCount: 1,

    TOGGLE_CLEAR:     'C'.charCodeAt(0),
    TOGGLE_BOX:       'B'.charCodeAt(0),
    TOGGLE_UNDO_BOX:  'U'.charCodeAt(0),
    TOGGLE_FLIPFLOP:  'F'.charCodeAt(0),
    TOGGLE_RENDER:    'R'.charCodeAt(0),
    TOGGLE_PANELVIEW: 'M'.charCodeAt(0),

    run(ctx: CanvasRenderingContext2D): void {
        if (eatKey(this.TOGGLE_CLEAR))     this._doClear    = !this._doClear;
        if (eatKey(this.TOGGLE_BOX))       this._doBox      = !this._doBox;
        if (eatKey(this.TOGGLE_UNDO_BOX))  this._undoBox    = !this._undoBox;
        if (eatKey(this.TOGGLE_FLIPFLOP))  this._doFlipFlop = !this._doFlipFlop;
        if (eatKey(this.TOGGLE_RENDER))    this._doRender   = !this._doRender;
        if (eatKey(this.TOGGLE_PANELVIEW)) this.panelView   = !this.panelView;

        if (this._doClear) clearCanvas(ctx);
        if (this._doBox)   fillBox(ctx, 200, 200, 50, 50, "red");

        if (this._doRender && main._game) main._game.renderSimulation(ctx);

        if (this._doFlipFlop) {
            const boxX = 250;
            const boxY = update._isOdd ? 100 : 200;
            fillBox(ctx, boxX, boxY, 50, 50, "green");
            ctx.fillText(String(this._frameCount % 1000), boxX + 10, boxY + 20);
            ctx.fillText(this._frameCount % 2 ? "odd" : "even", boxX + 10, boxY + 40);
        }

        if (this._undoBox) ctx.clearRect(200, 200, 50, 50);

        if (main.paused) pauseMenu.render(ctx);

        ++this._frameCount;
    }

};
