"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var gameManager = {
  motherships: 0,
  score: 0,
  level: 1,
  lives: 3,
  bombVisuals: 0,
  bombs: 3,
  baiterInterval: 20000 / NOMINAL_UPDATE_INTERVAL,
  timetoBaiter: 20000 / NOMINAL_UPDATE_INTERVAL,
  landers: 8,
  newLevel: 2000,
  modulo: 1,

  resetGame: function () {
    entityManager.clearAll();
    entityManager.generateShip({
      cx: 2000,
      cy: 300
    });
    g_isUpdatePaused = false;

    //Reset game values
    this.motherships = 0;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.bombVisuals = 0;
    this.bombs = 3;
    this.baiterInterval = 20000 / NOMINAL_UPDATE_INTERVAL;
    this.timetoBaiter = 20000 / NOMINAL_UPDATE_INTERVAL;
    this.landers = 8;
    this.newLevel = 2000;
    this.modulo = 1;

    //Generate humans/landers
    entityManager._ships[0].reset();
    entityManager._generateHumans();
    entityManager._generateLanders();
  },

  nextLevel: function () {
    entityManager.clearAll();
    entityManager.generateShip({
      cx: 2000,
      cy: 300
    });
    entityManager._ships[0].reset();
    entityManager._generateHumans();
    this.level++;
    if (this.level % 2 == 0)
      this.landers++;
    if (this.level % 4 == 0)
      this.motherships++;
    entityManager._generateLanders();
    entityManager._generateMotherships();
    this.newLevel = 2000;
    this.baiterInterval -= 200 / NOMINAL_UPDATE_INTERVAL;
    //this.timetoBaiter = this.baiterInterval;
  },

  decreaseLives: function () {
    this.lives--;
    if (this.lives <= 0) this.gameOver();
  },

  increaseScore: function (scoreIncrease) {
    var oldScore = this.score;
    this.score += scoreIncrease;
    if (this.score / 10000 >= this.modulo && oldScore / 10000 < this.modulo) {
      this.lives++;
      this.bombs++;
      this.modulo++;
    }
  },

  decreaseTimeToBaiter: function (du) {
    this.timetoBaiter -= du;
    if (this.timetoBaiter <= 0) {
      entityManager.generateBaiter();
      this.timetoBaiter = (this.baiterInterval / 2);
      this.timetoBaiter = this.baiterInterval;
      console.log(this.timetoBaiter);
    }
  },

  renderGameInfo: function (ctx) {
    var i, sprite = g_sprites.life;
    var oldFont = ctx.font;
    sprite.scale = 0.1;
    //Score
    ctx.font = "30px Georgia";
    ctx.fillStyle = "white";
    ctx.fillText(this.score, 130, 90);
    //Lives
    for (i = 0; i < this.lives - 1; i++) {
      if (i < 7) sprite.drawCentredAt(ctx, 20 + (i * 30), 30);
    }
    //bombs
    ctx.font = "15px Georgia";
    ctx.fillText("Bombs: " + this.bombs, 15, 60);
    //levels
    if (this.newLevel > 0 && !this.lives <= 0) {
      this.newLevel -= 10;
      ctx.globalAlpha = this.newLevel / 500;
      ctx.fillText("LEVEL " + this.level, 450, 300);
      ctx.globalAlpha = 1;
    }
    if (this.lives <= 0) {
      util.wrappedcenteredFillBox(ctx, 450, 250, 300, 200, "black");
      util.centeredStrokeBox(ctx, 450, 250, 300, 200, "white");
      //Game Over
      util.writeText(ctx, "30px Georgia", "white", "Game over", 420, 230);
      //play again?
      util.writeText(ctx, "15px Georgia", "white", "Play again?", 490, 260);
      //press Y!
      util.writeText(ctx, "15px Georgia", "white", "Y", 450, 290);
    }

    ctx.font = oldFont;
  },

  gameOver: function () {
    g_isUpdatePaused = true;
    //main.gameOver();//this has to be changed...
  }
}