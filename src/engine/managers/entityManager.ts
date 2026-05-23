// Engine.entityManager — generic entity lifecycle management.
// Games register their entity arrays via addCategory().
// The engine handles the update/render loop generically.
//
// Games can register an afterEntityRender hook to attach per-entity render
// side-effects (e.g. minimap, HUD overlays) without the engine knowing
// anything game-specific.

import { spatialManager } from './spatialManager';
import { IEntity }        from '../entities/IEntity';

type AfterEntityRender = (entity: IEntity, ctx: CanvasRenderingContext2D) => void;

export const entityManager = {

    _categories: [] as IEntity[][],
    _afterEntityRender: null as AfterEntityRender | null,

    addCategory(arr: IEntity[]): void {
        this._categories.push(arr);
    },

    setAfterEntityRender(fn: AfterEntityRender | null): void {
        this._afterEntityRender = fn;
    },

    update(du: number): void {
        for (const cat of this._categories) {
            let i = 0;
            while (i < cat.length) {
                const entity = cat[i];
                entity.update(du);
                if (entity._isDeadNow) {
                    spatialManager.unregister(entity);
                    cat.splice(i, 1);
                } else {
                    ++i;
                }
            }
        }
    },

    render(ctx: CanvasRenderingContext2D): void {
        const hook = this._afterEntityRender;
        for (const cat of this._categories) {
            for (const entity of cat) {
                entity.render(ctx);
                if (hook) hook(entity, ctx);
            }
        }
    }

};
