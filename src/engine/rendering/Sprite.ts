import { camera } from '../managers/camera';

interface SpriteDescr {
    image:     HTMLImageElement;
    celWidth:  number;
    celHeight: number;
    Cols:      number;
    Rows:      number;
    Cels:      number;
    scale?:    number;
}

class SpriteCell {
    sx:     number;
    sy:     number;
    width:  number;
    height: number;
    constructor(sx: number, sy: number, width: number, height: number) {
        this.sx     = sx;
        this.sy     = sy;
        this.width  = width;
        this.height = height;
    }
}

export class Sprite {
    image:        HTMLImageElement;
    width:        number;
    height:       number;
    scale:        number;
    spriteArray:  SpriteCell[] | null = null;
    numCels:      number = 0;
    aCounter:     number = 0;
    slowdownticker: number = 0;
    slowdown:     number = 1;

    constructor(image: HTMLImageElement | SpriteDescr) {
        if ('Cels' in image) {
            this.image   = image.image;
            this.width   = image.celWidth;
            this.height  = image.celHeight;
            this.scale   = image.scale ?? 1;
            this.numCels = image.Cels;
            this.spriteArray = [];
            for (let row = 0; row < image.Rows; ++row) {
                for (let col = 0; col < image.Cols; ++col) {
                    this.spriteArray.push(new SpriteCell(
                        col * image.celWidth, row * image.celHeight,
                        image.celWidth, image.celHeight
                    ));
                }
            }
        } else {
            this.image  = image;
            this.width  = image.width;
            this.height = image.height;
            this.scale  = 1;
        }
    }

    drawAt(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.drawImage(this.image, x, y);
    }

    drawCentredAt(ctx: CanvasRenderingContext2D, cx: number, cy: number, rotation = 0, flipp = 0): void {
        let w = this.width, h = this.height;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.scale(this.scale, this.scale);
        if (flipp) { ctx.scale(1, -1); h *= -1; }
        if (this.spriteArray) {
            const aS = this.spriteArray[this.aCounter];
            const wi = aS.width, he = aS.height;
            if (flipp) w *= -1;
            ctx.drawImage(this.image, aS.sx, aS.sy, wi, he, -wi / 2, -he / 2, wi, he);
        } else {
            ctx.drawImage(this.image, -w / 2, -h / 2);
        }
        ctx.restore();
    }

    animate(): void {
        if (this.spriteArray) {
            if (this.aCounter === this.numCels - 1) this.aCounter = 0;
            if (this.slowdownticker === this.slowdown) {
                this.aCounter++;
                this.slowdownticker = 0;
            } else {
                this.slowdownticker++;
            }
        }
    }

    animateReset(): void {
        if (this.spriteArray) {
            this.aCounter       = 0;
            this.slowdownticker = 0;
        }
    }

    drawWrappedCentredAt(ctx: CanvasRenderingContext2D, cx: number, cy: number, rotation?: number, flipp?: number): void {
        this.drawCentredAt(ctx, cx,                           cy, rotation, flipp);
        this.drawCentredAt(ctx, cx - camera.rightX, cy, rotation, flipp);
        this.drawCentredAt(ctx, cx + camera.rightX, cy, rotation, flipp);
    }
}
