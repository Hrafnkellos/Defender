export class Vector {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v: Vector): void {
        this.x += v.x;
        this.y += v.y;
    }

    subtract(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    scale(s: number): Vector {
        return new Vector(this.x * s, this.y * s);
    }

    normalize(): Vector {
        const m = this.getMagnitude();
        return m > 0 ? new Vector(this.x / m, this.y / m) : new Vector(0, 0);
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }

    distanceTo(v: Vector): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
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
