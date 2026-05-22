// Defender sound singleton — populated during preloadSound() in main.ts
import { SoundManager } from '../../engine/managers/soundManager';

export let sound: SoundManager | null = null;

export function initSound(mgr: SoundManager): void {
    sound = mgr;
}
