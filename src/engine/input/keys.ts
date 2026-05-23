// Keyboard handling

export const keys: boolean[] = [];

export function eatKey(keyCode: number): boolean {
    const isDown = keys[keyCode];
    if (keyCode !== ' '.charCodeAt(0)) keys[keyCode] = false;
    return !!isDown;
}

export function keyCode(keyChar: string): number {
    return keyChar.charCodeAt(0);
}

// Map evt.key to the numeric codes the rest of the engine uses,
// keeping the public API stable while avoiding the deprecated evt.keyCode.
const specialKeys: Record<string, number> = {
    ' ':          32,
    'ArrowLeft':  37,
    'ArrowUp':    38,
    'ArrowRight': 39,
    'ArrowDown':  40,
    'Shift':      16,
    'Control':    17,
    'Tab':         9,
    'Escape':     27,
    'Enter':      13,
};

function evtToCode(evt: KeyboardEvent): number {
    if (evt.key in specialKeys) return specialKeys[evt.key];
    if (evt.key.length === 1)   return evt.key.toUpperCase().charCodeAt(0);
    return 0;
}

function handleKeydown(evt: KeyboardEvent): void {
    const code = evtToCode(evt);
    if (code === 0) return;
    keys[code] = true;
    // Prevent browser scroll on arrow keys and space
    if (code === 38 || code === 40 || code === 32) evt.preventDefault();
}

function handleKeyup(evt: KeyboardEvent): void {
    const code = evtToCode(evt);
    if (code !== 0) keys[code] = false;
}

window.addEventListener("keydown", handleKeydown, false);
window.addEventListener("keyup",   handleKeyup);
