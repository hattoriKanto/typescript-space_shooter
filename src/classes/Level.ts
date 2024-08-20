import * as Pixi from "pixi.js";

import {
  AsteroidStore,
  Asteroid,
  Boss,
  Player,
  BulletStore,
  Game,
  Explosion,
} from ".";
import { config } from "../config";
import { checkCollision } from "../utils";

export class Level {
  protected game: Game;
  protected app: Pixi.Application<Pixi.Renderer>;
  protected player: Player;
  protected playerBullets: BulletStore;
  protected bulletsOnScreen: BulletStore;
  protected _victoryCallback: () => void;
  protected _defeatCallback: () => void;
  protected textElements: Pixi.Text[];
  protected timer: NodeJS.Timeout | null;
  protected timeRemaining: number;

  constructor(game: Game) {
    this.game = game;
    this.app = this.game.app;
    this.player = this.game.player;
    this.playerBullets = new BulletStore();
    this.bulletsOnScreen = new BulletStore();
    this.textElements = [];
    this._victoryCallback = () => {};
    this._defeatCallback = () => {};
    this.timer = null;
    this.timeRemaining = 60;
  }
  protected setupText() {
    const bulletText = new Pixi.Text({
      text: `Bullets left: ${this.player?.bulletsLeft}/${config.amount.playerBullets}`,
      style: {
        fontFamily: "Starjedi",
        fontSize: 28,
        fill: 0xffffff,
        align: "center",
      },
    });
    bulletText.position.set(config.padding.text, config.padding.text);
    this.app.stage.addChild(bulletText);

    const timerText = new Pixi.Text({
      text: `Time left: ${this.timeRemaining}`,
      style: {
        fontFamily: "Starjedi",
        fontSize: 28,
        fill: 0xffffff,
        align: "center",
      },
    });
    timerText.position.set(
      this.app.screen.width - timerText.width - config.padding.text,
      config.padding.text
    );
    this.app.stage.addChild(timerText);

    this.textElements.push(bulletText, timerText);
  }

  set victoryCallback(callback: () => void) {
    this._victoryCallback = callback;
  }

  set defeatCallback(callback: () => void) {
    this._defeatCallback = callback;
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.timeRemaining -= 1;
      this.updateTimeText();
      if (this.timeRemaining <= 0) {
        this.game.showDefeatOverlay();
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetTimer() {
    this.timeRemaining = 60;
  }

  updateBulletsText() {
    this.textElements[0].text = `Bullets left: ${this.player.bulletsLeft}/${config.amount.playerBullets}`;
  }

  updateTimeText() {
    this.textElements[1].text = `Time left: ${this.timeRemaining}`;
  }

  cleanup() {
    this.textElements.forEach((text) => this.app.stage.removeChild(text));
    this.playerBullets.reset(this.playerBullets, this.bulletsOnScreen);
    this.stopTimer();
  }
}
export class AsteroidLevel extends Level {
  private asteroidStore: AsteroidStore;

  constructor(game: Game) {
    super(game);
    this.asteroidStore = new AsteroidStore(this.app);
  }

  watchForCollision() {
    const bullets = this.playerBullets.bullets;
    const asteroids = this.asteroidStore.asteroids;

    bullets.forEach((bullet) => {
      if (bullet.isOffscreen()) {
        bullet.remove(this.playerBullets, this.bulletsOnScreen);
        this.checkGameStatus();
      }

      asteroids.forEach((asteroid) => {
        if (checkCollision(bullet.graphics, asteroid.sprite)) {
          bullet.remove(this.playerBullets, this.bulletsOnScreen);
          asteroid.remove(this.asteroidStore);

          const explosionTexture = this.game.textureStore.textures.explosion;
          const explosion = new Explosion(this.app, explosionTexture);
          explosion.setup({ x: asteroid.sprite.x, y: asteroid.sprite.y });
          explosion.remove();

          this.checkGameStatus();
          return;
        }
      });
    });
  }

  checkGameStatus() {
    if (this.checkVictoryCondition()) {
      console.log("Victory");
      this._victoryCallback();
    } else if (this.checkDefeatCondition()) {
      console.log("Defeat");
      this._defeatCallback();
    }
  }

  checkDefeatCondition() {
    return this.player.bulletsLeft === 0 && this.bulletsOnScreen.amount === 0;
  }

  checkVictoryCondition() {
    return this.asteroidStore.asteroids.length === 0;
  }

  setup() {
    this.player.setup(
      this.game.textureStore.textures.player,
      this.playerBullets,
      this.bulletsOnScreen
    );
    this.player.updatetTextCallback = () => this.updateBulletsText();

    for (let i = 0; i < config.amount.asteroids; i++) {
      const asteroid = new Asteroid(this.app);
      const texture = this.game.textureStore.textures.asteroid;

      asteroid.setup(texture);
      this.asteroidStore.addAsteroid(asteroid);
    }

    this.setupText();
    this.startTimer();
    this.app.ticker.add(this.watchForCollision.bind(this));
  }

  cleanup() {
    super.cleanup();
    this.app.ticker.remove(this.watchForCollision.bind(this));
    this.asteroidStore.reset();
  }
}

export class BossLevel extends Level {
  private boss: Boss;
  private bossBullets: BulletStore;

  constructor(game: Game) {
    super(game);
    this.boss = new Boss(this.app);
    this.bossBullets = new BulletStore();
  }

  watchForCollision() {
    const playerBullets = this.playerBullets.bullets;
    const bossBullets = this.bossBullets.bullets;

    playerBullets.forEach((bullet) => {
      if (bullet.isOffscreen()) {
        bullet.remove(this.playerBullets, this.bulletsOnScreen);
        this.checkGameStatus();
      }

      if (checkCollision(bullet.graphics, this.boss.sprite)) {
        bullet.remove(this.playerBullets, this.bulletsOnScreen);
        this.boss.bossHealth -= 1;

        const explosionTexture = this.game.textureStore.textures.explosion;
        const explosion = new Explosion(this.app, explosionTexture);
        explosion.setup({ x: this.boss.sprite.x, y: this.boss.sprite.y });
        explosion.remove();

        this.checkGameStatus();
      }

      bossBullets.forEach((bossBullet) => {
        if (checkCollision(bullet.graphics, bossBullet.graphics)) {
          bullet.remove(this.playerBullets, this.bulletsOnScreen);
          bossBullet.remove(this.bossBullets, this.bulletsOnScreen);

          const explosionTexture = this.game.textureStore.textures.explosion;
          const explosion = new Explosion(this.app, explosionTexture);
          explosion.setup({
            x: bossBullet.graphics.x,
            y: bossBullet.graphics.y,
          });
          explosion.remove();
        }
      });
    });

    bossBullets.forEach((bossBullet) => {
      if (bossBullet.isOffscreen()) {
        bossBullet.remove(this.bossBullets, this.bulletsOnScreen);
        this.checkGameStatus();
      }

      if (checkCollision(bossBullet.graphics, this.player.sprite)) {
        bossBullet.remove(this.bossBullets, this.bulletsOnScreen);

        const explosionTexture = this.game.textureStore.textures.explosion;
        const explosion = new Explosion(this.app, explosionTexture);
        explosion.setup({ x: this.player.sprite.x, y: this.player.sprite.y });
        explosion.remove();

        this.player.removeEventListeners();
        this._defeatCallback();
      }
    });
  }

  checkGameStatus() {
    if (this.checkVictoryCondition()) {
      console.log("Victory");
      this._victoryCallback();
      return;
    }
    if (this.checkDefeatCondition()) {
      console.log("Defeat");
      this._defeatCallback();
      return;
    }
  }

  checkVictoryCondition() {
    return this.boss.bossHealth === 0;
  }

  checkDefeatCondition() {
    return this.player.bulletsLeft === 0 && this.bulletsOnScreen.amount === 0;
  }

  setup() {
    this.boss.setup(
      this.game.textureStore,
      this.bossBullets,
      this.bulletsOnScreen
    );
    this.player.setup(
      this.game.textureStore.textures.player,
      this.playerBullets,
      this.bulletsOnScreen
    );
    this.player.updatetTextCallback = () => this.updateBulletsText();

    this.setupText();
    this.startTimer();
    this.app.ticker.add(this.watchForCollision.bind(this));
  }

  cleanup() {
    super.cleanup();
    this.boss.reset();
    this.app.ticker.remove(this.watchForCollision.bind(this));
    this.bossBullets.reset(this.bossBullets, this.bulletsOnScreen);
  }
}
