// IEntity — core interface implemented by all game entities.
// Lives here so nothing has to import from a manager to implement it.

export interface IEntity {
    cx:            number;
    cy:            number;
    entityType?:   string;
    spatialMapping?: [number, number, number][];
    _isDeadNow:    boolean;
    getPos():      { posX: number; posY: number };
    getRadius():   number;
    getSpatialID(): number;
    kill():        void;
    update(du: number): number | void;
    render(ctx: CanvasRenderingContext2D): void;
    takeBulletHit?():      void;
    takeAlienbulletHit?(): void;
}
