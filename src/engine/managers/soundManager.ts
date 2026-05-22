import { BufferLoader } from '../utils/BufferLoader';

export class SoundManager {
    buffers: AudioBuffer[] = [];
    private context: AudioContext;
    private source: AudioBufferSourceNode | null = null;

    constructor(ctx: AudioContext) {
        this.context = ctx;
        const loader = new BufferLoader(ctx, [
            'assets/sounds/bulletFire.ogg',    // 0
            'assets/sounds/bulletZapped.ogg',  // 1
            'assets/sounds/rockEvaporate.ogg', // 2
            'assets/sounds/rockSplit.ogg',     // 3
            'assets/sounds/shipWarp.ogg',      // 4
            'assets/sounds/death1.ogg',        // 5
            'assets/sounds/death2.ogg',        // 6
            'assets/sounds/expl1.ogg',         // 7
            'assets/sounds/expl2.ogg',         // 8
            'assets/sounds/lazer1.ogg',        // 9
            'assets/sounds/lazer2.ogg',        // 10
            'assets/sounds/lazer3.ogg',        // 11
            'assets/sounds/Term2Theme.mp3',    // 12
        ], (buffers) => {
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
        try {
            const time = this.context.currentTime;
            for (let i = 0; i < rounds; i++) {
                const source = this.makeSource(this.buffers[type]);
                if (loop) source.loop = true;
                source.playbackRate.value = 1 + Math.random();
                source.start(time + i * interval + Math.random() * random);
                if (type === 12) this.source = source;
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
