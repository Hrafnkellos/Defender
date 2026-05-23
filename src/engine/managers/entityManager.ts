// Engine.entityManager — generic entity lifecycle management.
// Games register their entity arrays via addCategory().
// The engine handles the update/render loop generically.

import { mapManager } from './mapManager';
import { IEntity }    from '../entities/IEntity';

export const KILL_ME_NOW = -1 as const;

export const entityManager = {

    _categories: [] as IEntity[][],

    addCategory(arr: IEntity[]): void {
        this._categories.push(arr);
    },

    update(du: number): void {
        for (const cat of this._categories) {
            let i = 0;
            while (i < cat.length) {
                if (cat[i].update(du) === KILL_ME_NOW) cat.splice(i, 1);
                else ++i;
            }
        }
    },

    render(ctx: CanvasRenderingContext2D): void {
        for (const cat of this._categories) {
            for (const entity of cat) {
                entity.render(ctx);
                mapManager.renderToMinimap(entity, ctx);
            }
        }
    }

};
