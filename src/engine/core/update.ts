// Generic update logic

import { NOMINAL_UPDATE_INTERVAL } from '../utils/config';
import { main }                    from './main';

export const update = {

    _prevDt: null as number | null,
    _prevDu: null as number | null,
    _isOdd:  false,

    run(dt: number): void {
        if (main.paused) return;

        const original_dt = dt;
        if (dt > 200) {
            console.log("Big dt =", dt, ": CLAMPING TO NOMINAL");
            dt = NOMINAL_UPDATE_INTERVAL;
        }

        const du = dt / NOMINAL_UPDATE_INTERVAL;
        if (main._game) main._game.updateSimulation(du);

        this._prevDt = original_dt;
        this._prevDu = du;
        this._isOdd  = !this._isOdd;
    },

};
