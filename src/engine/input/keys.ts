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

function handleKeydown(evt: KeyboardEvent): void {
    keys[evt.keyCode] = true;
    if (keys[38] || keys[40] || keys[32])
        evt.preventDefault();
}

function handleKeyup(evt: KeyboardEvent): void {
    keys[evt.keyCode] = false;
}

window.addEventListener("keydown", handleKeydown, false);
window.addEventListener("keyup",   handleKeyup);
