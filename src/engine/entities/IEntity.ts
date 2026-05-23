// IEntity — core interface implemented by all game entities.

export interface IEntity {
    cx:             number;
    cy:             number;
    entityType?:    string;
    spatialMapping?: [number, number, number][];
    _isDeadNow:     boolean;
    getPos():       { posX: number; posY: number };
    getRadius():    number;
    getSpatialID(): number;
    kill():         void;
    update(du: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
