export class BufferLoader {
    private context:    AudioContext;
    private urlList:    string[];
    private onload:     (buffers: AudioBuffer[]) => void;
    private bufferList: AudioBuffer[];
    private loadCount:  number;

    constructor(context: AudioContext, urlList: string[], callback: (buffers: AudioBuffer[]) => void) {
        this.context    = context;
        this.urlList    = urlList;
        this.onload     = callback;
        this.bufferList = [];
        this.loadCount  = 0;
    }

    private async loadBuffer(url: string, index: number): Promise<void> {
        try {
            const response = await fetch(url);
            const arrayBuf = await response.arrayBuffer();
            const buffer   = await this.context.decodeAudioData(arrayBuf);
            this.bufferList[index] = buffer;
        } catch (err) {
            console.error('Failed to load audio:', url, err);
        } finally {
            if (++this.loadCount === this.urlList.length) this.onload(this.bufferList);
        }
    }

    load(): void {
        for (let i = 0; i < this.urlList.length; ++i) this.loadBuffer(this.urlList[i], i);
    }
}
