// camera — generic world/screen viewport. World wraps horizontally between
// leftX..rightX; screenLeft/screenRight are the current visible window into it.
// Game code owns world dimensions and ship-follow behaviour beyond this.

import { g_canvas } from '../utils/config';

export const camera = {

    leftX:       0,
    rightX:      4000,
    screenLeft:  1550,
    screenRight: 2450,

    scrollToFollow(x: number): void {
        const hw    = g_canvas.width / 2;
        const range = this.rightX - this.leftX;
        if (range > 0) x = ((x - this.leftX) % range + range) % range + this.leftX;
        this.screenLeft  = x - hw;
        this.screenRight = x + hw;
    },

    isOnScreen(cx: number): boolean {
        return cx > this.screenLeft && cx < this.screenRight;
    },

};
