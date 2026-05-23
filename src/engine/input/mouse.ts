// Mouse handling

import { g_canvas } from '../utils/config';

export let mouseX = 0;
export let mouseY = 0;

// Optional callback set by the game to handle mouse clicks
let _clickHandler: ((x: number, y: number) => void) | null = null;

export function setMouseClickHandler(fn: (x: number, y: number) => void): void {
    _clickHandler = fn;
}

function handleMouse(evt: MouseEvent): void {
    const scaleX = g_canvas.width  / g_canvas.offsetWidth;
    const scaleY = g_canvas.height / g_canvas.offsetHeight;
    mouseX = (evt.clientX - g_canvas.offsetLeft) * scaleX;
    mouseY = (evt.clientY - g_canvas.offsetTop)  * scaleY;

    const button = evt.buttons !== undefined ? evt.buttons : (evt as MouseEvent & { which: number }).which;
    if (!button) return;

    if (_clickHandler) _clickHandler(mouseX, mouseY);
}

window.addEventListener("mousedown", handleMouse);
window.addEventListener("mousemove", handleMouse);
