export class BufferLoader {
    private context: AudioContext;
    private urlList: string[];
    private onload: (buffers: AudioBuffer[]) => void;
    private bufferList: AudioBuffer[];
    private loadCount: number;

    constructor(context: AudioContext, urlList: string[], callback: (buffers: AudioBuffer[]) => void) {
        this.context    = context;
        this.urlList    = urlList;
        this.onload     = callback;
        this.bufferList = [];
        this.loadCount  = 0;
    }

    loadBuffer(url: string, index: number): void {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        const loader = this;

        request.onload = function () {
            loader.context.decodeAudioData(
                request.response as ArrayBuffer,
                function (buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = buffer;
                    if (++loader.loadCount === loader.urlList.length)
                        loader.onload(loader.bufferList);
                },
                function (error) {
                    console.error('decodeAudioData error', error);
                }
            );
        };

        request.onerror = function () {
            alert('BufferLoader: XHR error');
        };

        request.send();
    }

    load(): void {
        for (let i = 0; i < this.urlList.length; ++i)
            this.loadBuffer(this.urlList[i], i);
    }
}
