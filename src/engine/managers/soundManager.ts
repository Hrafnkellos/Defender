import { BufferLoader } from '../utils/BufferLoader';

export class SoundManager {
    buffers: AudioBuffer[] = [];
    sfxEnabled   = true;
    private _musicEnabled = true;
    private context: AudioContext;
    private source: AudioBufferSourceNode | null = null;

    get musicEnabled(): boolean { return this._musicEnabled; }
    set musicEnabled(val: boolean) {
        this._musicEnabled = val;
        if (!val) this.stopSound();
    }

    constructor(ctx: AudioContext, urls: string[]) {
        this.context = ctx;
        const loader = new BufferLoader(ctx, urls, (buffers) => {
            this.buffers = buffers;
        });
        loader.load();
    }

    private makeSource(buffer: AudioBuffer): AudioBufferSourceNode {
        const source     = this.context.createBufferSource();
        const compressor = this.context.createDynamicsCompressor();
        const gain       = this.context.createGain();
        gain.gain.value  = 0.2;
        source.buffer    = buffer;
        source.connect(gain);
        gain.connect(compressor);
        compressor.connect(this.context.destination);
        return source;
    }

    playSound(type: number, rounds: number, interval: number, loop = false, random = 0): void {
        if (type === 12 && !this._musicEnabled) return;
        if (type !== 12 && !this.sfxEnabled)    return;
        try {
            const time = this.context.currentTime;
            for (let i = 0; i < rounds; i++) {
                const source = this.makeSource(this.buffers[type]);
                if (loop) source.loop = true;
                source.playbackRate.value = 1 + Math.random();
                source.start(time + i * interval + Math.random() * random);
                if (type === 12) {
                    // Stop any existing looping source before replacing the reference
                    try { this.source?.stop(0); } catch (_) { /* already stopped */ }
                    this.source = source;
                }
            }
        } catch (err) {
            console.dir(err);
        }
    }

    stopSound(): void {
        if (!this.source) return;
        this.source.stop(0);
    }
}
