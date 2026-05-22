export class Vector {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector: Vector): void {
        this.x += vector.x;
        this.y += vector.y;
    }

    getMagnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    getAngle(): number {
        return Math.atan2(this.y, this.x);
    }

    static fromAngle(angle: number, magnitude: number): Vector {
        return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
}
