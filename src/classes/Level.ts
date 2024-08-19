import * as Pixi from "pixi.js";
import {
  AsteroidStore,
  Asteroid,
  Boss,
  Player,
  BulletStore,
  TextureStore,
} from ".";
import { config } from "../config";
import { checkCollision } from "../utils";
import { Explosion } from "./Explosion";
import { Position } from "../types/types";

export class Level {
  protected _app: Pixi.Application<Pixi.Renderer>;
  protected _player: Player | null;
  protected _playerBullets: BulletStore;
  protected _bulletsOnScreen: BulletStore;
  protected _victoryCallback: () => void;
  protected _defeatCallback: () => void;
  protected _textElement: Pixi.Text;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    this._app = app;
    this._player = null;
    this._playerBullets = new BulletStore();
    this._bulletsOnScreen = new BulletStore();
    this._textElement = new Pixi.Text();
    this._victoryCallback = () => {};
    this._defeatCallback = () => {};
  }

  protected setupText() {
    this._textElement = new Pixi.Text({
      text: `Bullets left: ${this._player?.bulletsLeft}/${config.amount.playerBullets}`,
      style: {
        fontFamily: "Starjedi",
        fontSize: 28,
        fill: 0xffffff,
        align: "center",
      },
      x: 10,
      y: 10,
    });
    this._app.stage.addChild(this._textElement);
  }

  set setVictoryCallback(callback: () => void) {
    this._victoryCallback = callback;
  }

  set setDefeatCallback(callback: () => void) {
    this._defeatCallback = callback;
  }

  get playerBullets() {
    return this._playerBullets;
  }

  updateText() {
    if (this._textElement) {
      this._textElement.text = `Bullets left: ${this._player?.bulletsLeft}/${config.amount.playerBullets}`;
      console.log("Text updated");
      console.log(
        `Current text: Bullets left: ${this._player?.bulletsLeft}/${config.amount.playerBullets}`
      );
    }
  }
}
export class AsteroidLevel extends Level {
  private _asteroidStore: AsteroidStore;
  private _textureStore: TextureStore;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    super(app);
    this._asteroidStore = new AsteroidStore(app);
    this._textureStore = new TextureStore(app);
  }

  watchForCollision() {
    const bullets = this._playerBullets.bullets;
    const asteroids = this._asteroidStore.asteroids;

    bullets.forEach((bullet) => {
      if (bullet.isOffscreen()) {
        bullet.remove(this._playerBullets, this._bulletsOnScreen);
        this.checkGameStatus();
      }

      asteroids.forEach((asteroid) => {
        if (checkCollision(bullet.graphics, asteroid.sprite)) {
          const position: Position = {
            x: asteroid.sprite.x,
            y: asteroid.sprite.y,
          };
          bullet.remove(this._playerBullets, this._bulletsOnScreen);
          asteroid.remove(this._asteroidStore);
          const explosionTexture = this._textureStore.textures.explosion;
          const explosion = new Explosion(this._app, explosionTexture);
          explosion.setup(position);
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
    }

    if (this.checkDefeatCondition()) {
      console.log("Defeat");
      this._defeatCallback();
    }
  }

  checkDefeatCondition() {
    return (
      this._player?.bulletsLeft === 0 && this._bulletsOnScreen.amount === 0
    );
  }

  checkVictoryCondition() {
    const asteroids = this._asteroidStore.asteroids;

    return asteroids.length === 0;
  }

  setup(player: Player, texturesStore: TextureStore) {
    this._textureStore = texturesStore;

    const asteroidTexture = this._textureStore.textures.asteroid;
    const playerTexture = this._textureStore.textures.player;

    this._player = player;
    this._player.setup(
      playerTexture,
      this._playerBullets,
      this._bulletsOnScreen
    );
    this._player.updatetTextCallback = () => this.updateText();

    for (let i = 0; i < config.amount.asteroids; i++) {
      const asteroid = new Asteroid(this._app);
      asteroid.setup(asteroidTexture);
      this._asteroidStore.addAsteroid(asteroid);
    }

    this.setupText();

    this._app.ticker.add(this.watchForCollision.bind(this));
  }

  cleanup() {
    this._app.stage.removeChild(this._textElement);
    this._app.ticker.remove(this.watchForCollision.bind(this));
    this._asteroidStore.reset();
    this._playerBullets.reset(this._playerBullets, this._bulletsOnScreen);
  }
}
export class BossLevel extends Level {
  private _boss: Boss;
  private _bossBullets: BulletStore;
  private _textureStore: TextureStore;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    super(app);
    this._boss = new Boss(app);
    this._bossBullets = new BulletStore();
    this._textureStore = new TextureStore(app);
  }

  get boss() {
    return this._boss;
  }

  watchForCollision() {
    const playerBullets = this._playerBullets.bullets;
    const bossBullets = this._bossBullets.bullets;

    for (let i = 0; i < playerBullets.length; i++) {
      if (playerBullets[i].isOffscreen()) {
        playerBullets[i].remove(this._playerBullets, this._bulletsOnScreen);
        this.checkGameStatus();
      }

      if (
        this.boss &&
        checkCollision(playerBullets[i].graphics, this.boss.sprite)
      ) {
        const position: Position = {
          x: this.boss.sprite.x,
          y: this.boss.sprite.y,
        };
        const explosionTexture = this._textureStore.textures.explosion;
        const explosion = new Explosion(this._app, explosionTexture);
        playerBullets[i].remove(this._playerBullets, this._bulletsOnScreen);
        this.boss.bossHealth -= 1;
        explosion.setup(position);
        explosion.remove();
        console.log("Boss is hit");
        this.checkGameStatus();
      }

      for (let i = 0; i < bossBullets.length; i++) {
        if (
          checkCollision(playerBullets[i].graphics, bossBullets[i].graphics)
        ) {
          const position: Position = {
            x: bossBullets[i].graphics.x,
            y: bossBullets[i].graphics.y,
          };
          const explosionTexture = this._textureStore.textures.explosion;
          const explosion = new Explosion(this._app, explosionTexture);
          playerBullets[i].remove(this._playerBullets, this._bulletsOnScreen);
          bossBullets[i].remove(this._bossBullets, this._bulletsOnScreen);
          explosion.setup(position);
          explosion.remove();
        }
      }
    }

    for (let i = 0; i < bossBullets.length; i++) {
      if (bossBullets[i].isOffscreen()) {
        bossBullets[i].remove(this._bossBullets, this._bulletsOnScreen);
        this.checkGameStatus();
      }

      if (
        this._player &&
        checkCollision(bossBullets[i].graphics, this._player.sprite)
      ) {
        const position: Position = {
          x: this._player.sprite.x,
          y: this._player.sprite.y,
        };
        const explosionTexture = this._textureStore.textures.explosion;
        const explosion = new Explosion(this._app, explosionTexture);
        bossBullets[i].remove(this._bossBullets, this._bulletsOnScreen);
        explosion.setup(position);
        explosion.remove();
        console.log("Player is hit");
        this._player?.removeEventListeners();

        this._defeatCallback();
      }
    }
  }

  checkGameStatus() {
    if (this.checkVictoryCondition()) {
      console.log("Victory");
      this._victoryCallback();
    }

    if (this.checkDefeatCondition()) {
      console.log("Defeat");
      this._defeatCallback();
    }
  }

  checkVictoryCondition() {
    return this.boss?.bossHealth === 0;
  }

  checkDefeatCondition() {
    return this._player?.bulletsLeft === 0 && this._bossBullets.amount === 0;
  }

  setup(player: Player, texturesStore: TextureStore) {
    this._textureStore = texturesStore;

    const bossTexture = this._textureStore.textures.boss;
    const playerTexture = this._textureStore.textures.player;

    this._boss.setup(bossTexture, this._bossBullets, this._bulletsOnScreen);
    this._player = player;
    this._player.setup(
      playerTexture,
      this._playerBullets,
      this._bulletsOnScreen
    );
    this._player.updatetTextCallback = () => this.updateText();

    this.setupText();

    this._app.ticker.add(this.watchForCollision.bind(this));
  }

  cleanup() {
    this._app.stage.removeChild(this._textElement);
    this._app.ticker.remove(this.watchForCollision.bind(this));
    this._boss.reset();
    this._bossBullets.reset(this._bossBullets, this._bulletsOnScreen);
    this._playerBullets.reset(this.playerBullets, this._bulletsOnScreen);
  }
}
