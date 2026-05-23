import { NOMINAL_UPDATE_INTERVAL } from '../../../engine/utils/config';
import { main }             from '../../../engine/core/main';
import { centeredStrokeBox, wrappedCenteredFillBox, writeText } from '../../../engine/utils/util';
import { entityManager }    from './entityManager';
import { sprites }          from '../sprites';

export const gameManager = {

    motherships:    0,
    score:          0,
    level:          1,
    lives:          3,
    bombVisuals:    0,
    bombs:          3,
    baiterInterval: 20000 / NOMINAL_UPDATE_INTERVAL,
    timetoBaiter:   20000 / NOMINAL_UPDATE_INTERVAL,
    landers:        8,
    newLevel:       2000,
    modulo:         1,

    resetGame(): void {
        entityManager.clearAll();
        entityManager.generateShip({ cx: 2000, cy: 300 });
        main.paused = false;

        this.motherships    = 0;
        this.score          = 0;
        this.level          = 1;
        this.lives          = 3;
        this.bombVisuals    = 0;
        this.bombs          = 3;
        this.baiterInterval = 20000 / NOMINAL_UPDATE_INTERVAL;
        this.timetoBaiter   = 20000 / NOMINAL_UPDATE_INTERVAL;
        this.landers        = 8;
        this.newLevel       = 2000;
        this.modulo         = 1;

        entityManager._ships[0].reset();
        entityManager._generateHumans();
        entityManager._generateLanders();
    },

    nextLevel(): void {
        entityManager.clearAll();
        entityManager.generateShip({ cx: 2000, cy: 300 });
        entityManager._ships[0].reset();
        entityManager._generateHumans();

        this.level++;
        if (this.level % 2 === 0) this.landers++;
        if (this.level % 4 === 0) this.motherships++;

        entityManager._generateLanders();
        entityManager._generateMotherships();
        this.newLevel       = 2000;
        this.baiterInterval -= 200 / NOMINAL_UPDATE_INTERVAL;
    },

    decreaseLives(): void {
        this.lives--;
        if (this.lives <= 0) this.gameOver();
    },

    increaseScore(amount: number): void {
        const old = this.score;
        this.score += amount;
        if (this.score / 10000 >= this.modulo && old / 10000 < this.modulo) {
            this.lives++;
            this.bombs++;
            this.modulo++;
        }
    },

    decreaseTimeToBaiter(du: number): void {
        this.timetoBaiter -= du;
        if (this.timetoBaiter <= 0) {
            entityManager.generateBaiter();
            this.timetoBaiter = this.baiterInterval;
        }
    },

    renderGameInfo(ctx: CanvasRenderingContext2D): void {
        const sprite  = sprites.life;
        const oldFont = ctx.font;
        if (sprite) sprite.scale = 0.1;

        ctx.font      = "30px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText(String(this.score), 130, 90);

        for (let i = 0; i < this.lives - 1 && i < 7; i++)
            sprite?.drawCentredAt(ctx, 20 + i * 30, 30);

        ctx.font = "15px Georgia";
        ctx.fillText("Bombs: " + this.bombs, 15, 60);

        if (this.newLevel > 0 && this.lives > 0) {
            this.newLevel -= 10;
            ctx.globalAlpha = this.newLevel / 500;
            ctx.fillText("LEVEL " + this.level, 450, 300);
            ctx.globalAlpha = 1;
        }

        if (this.lives <= 0) {
            wrappedCenteredFillBox(ctx, 450, 250, 300, 200, "black");
            centeredStrokeBox(ctx, 450, 250, 300, 200, "white");
            writeText(ctx, "30px Georgia", "white", "Game over",   420, 230);
            writeText(ctx, "15px Georgia", "white", "Play again?", 490, 260);
            writeText(ctx, "15px Georgia", "white", "Y",           450, 290);
        }

        ctx.font = oldFont;
    },

    gameOver(): void {
        main.paused = true;
    }

};
