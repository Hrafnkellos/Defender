// camera — generic world/screen viewport. World is bounded by leftX..rightX;
// screenLeft/screenRight are the current visible window into it.
//
// `wrap` controls scrollToFollow behaviour:
//   true  — world wraps modulo (rightX - leftX); use for endless horizontal
//           scrollers like Defender.
//   false — camera clamps so it never shows past the world edges; use for
//           bounded levels like a platformer.

import { g_canvas } from '../utils/config';

export const camera = {

    leftX:       0,
    rightX:      4000,
    screenLeft:  1550,
    screenRight: 2450,
    wrap:        true,

    scrollToFollow(x: number): void {
        const hw    = g_canvas.width / 2;
        const range = this.rightX - this.leftX;

        if (this.wrap) {
            if (range > 0) x = ((x - this.leftX) % range + range) % range + this.leftX;
        } else if (range > 2 * hw) {
            if (x < this.leftX  + hw) x = this.leftX  + hw;
            if (x > this.rightX - hw) x = this.rightX - hw;
        }

        this.screenLeft  = x - hw;
        this.screenRight = x + hw;
    },

    isOnScreen(cx: number): boolean {
        return cx > this.screenLeft && cx < this.screenRight;
    },

};
