// Multi-image preloader.
// Extends Image with asyncLoad, then waits for all images before calling completionCallback.

interface ImageWithName extends HTMLImageElement {
    name: string;
}

function extendImageWithAsyncLoad(img: ImageWithName, src: string, callback: () => void): void {
    img.onload  = callback;
    img.onerror = callback;
    img.src     = src;
}

export function imagesPreload(
    requiredImages: Record<string, string>,
    loadedImages:   Record<string, HTMLImageElement>,
    completionCallback: () => void
): void {
    const keys             = Object.keys(requiredImages);
    const numImagesRequired = keys.length;
    let   numImagesHandled  = 0;

    for (const name of keys) {
        const img = new Image() as ImageWithName;
        img.name  = name;

        const handler = function (this: ImageWithName) {
            loadedImages[this.name] = this;
            if (this.width === 0) console.log("loading failed for", this.name);
            this.onload  = null;
            this.onerror = null;
            numImagesHandled += 1;
            if (numImagesHandled === numImagesRequired) completionCallback();
        };

        extendImageWithAsyncLoad(img, requiredImages[name], handler.bind(img));
    }
}
