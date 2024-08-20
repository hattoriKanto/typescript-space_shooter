import * as Pixi from "pixi.js";
import { config } from "../config";
import { HorizontalMovementDirection } from "../types/types";
import { AsteroidStore, BossBullet, BulletStore } from ".";

class Enemy {
  protected _app: Pixi.Application<Pixi.Renderer>;
  protected _sprite: Pixi.Sprite;
  protected _movementDirection: HorizontalMovementDirection;
  protected _tickerCallback: () => void;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    this._app = app;
    this._sprite = new Pixi.Sprite();
    this._movementDirection = HorizontalMovementDirection.none;
    this._tickerCallback = () => {};
  }

  protected setTickerCallback(
    callback: (app: Pixi.Application<Pixi.Renderer>) => void
  ) {
    this._tickerCallback = () => callback(this._app);
  }

  protected getInitialMovementDirection() {
    return Math.random() < 0.5
      ? HorizontalMovementDirection.left
      : HorizontalMovementDirection.right;
  }

  protected update(updateMovement: () => void) {
    updateMovement();
  }

  get sprite() {
    return this._sprite;
  }
}

export class Asteroid extends Enemy {
  private getRandomPosition() {
    const initialX = Math.floor(
      Math.random() * (this._app.canvas.width - this._sprite.width) +
        this._sprite.width / 2
    );
    const initialY = Math.floor(
      config.padding.text +
        config.padding.screenTop +
        (Math.random() * this._app.canvas.height) / 4
    );

    return { initialX, initialY };
  }

  private updateMovement() {
    const step =
      this._movementDirection === HorizontalMovementDirection.left
        ? config.step.asteroid
        : -config.step.asteroid;

    this._sprite.x += step;

    if (this._sprite.x + this._sprite.width / 2 >= this._app.canvas.width) {
      this._movementDirection = HorizontalMovementDirection.right;
    } else if (this._sprite.x - this._sprite.width / 2 <= 0) {
      this._movementDirection = HorizontalMovementDirection.left;
    }
  }

  private updateRotation() {
    this._sprite.rotation += config.step.asteroidRotation;
  }

  protected update() {
    super.update(this.updateMovement.bind(this));
    this.updateRotation();
  }

  setup(texture: Pixi.Texture) {
    this._sprite = new Pixi.Sprite(texture);

    this._sprite.anchor.set(0.5);
    this._movementDirection = this.getInitialMovementDirection();
    this._app.stage.addChild(this._sprite);

    const { initialX, initialY } = this.getRandomPosition();
    this._sprite.x = initialX;
    this._sprite.y = initialY;
    this._sprite.setSize(config.size.asteroid);

    this.setTickerCallback(this.update.bind(this));
    this._app.ticker.add(this._tickerCallback);
  }

  remove(asteroidStore: AsteroidStore) {
    asteroidStore.removeAsteroidByID(this._sprite.uid);
    this._app.stage.removeChild(this._sprite);
    this._app.ticker.remove(this._tickerCallback);
  }
}

export class Boss extends Enemy {
  private _intervalBulletID: number = 0;
  private _intervalMovementID: number = 0;
  private _bossHealth: number = config.amount.bossHealth;
  private _bossBullets: BulletStore;
  private _bulletsOnScreen: BulletStore;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    super(app);

    this._bossBullets = new BulletStore();
    this._bulletsOnScreen = new BulletStore();
  }

  private updateMovement() {
    const step =
      this._movementDirection === HorizontalMovementDirection.left
        ? config.step.boss
        : -config.step.boss;

    this._sprite.x += step;

    if (this._sprite.x + this._sprite.width / 2 >= this._app.canvas.width) {
      this._movementDirection = HorizontalMovementDirection.right;
    } else if (this._sprite.x - this._sprite.width / 2 <= 0) {
      this._movementDirection = HorizontalMovementDirection.left;
    }
  }

  private handleShooting() {
    const bullet = new BossBullet(this._app);
    bullet.setup(this, this._bossBullets, this._bulletsOnScreen);
  }

  private handleStop() {
    this._movementDirection === HorizontalMovementDirection.none;
    this._app.ticker.remove(this._tickerCallback);
    setTimeout(() => {
      this._movementDirection = this.getInitialMovementDirection();
      this.setTickerCallback(this.update.bind(this));
      this._app.ticker.add(this._tickerCallback);
    }, 1000);
  }

  private bulletSetup() {
    this._intervalBulletID = window.setInterval(() => {
      this.handleShooting();
    }, 2000);
  }

  private stopSetup() {
    this._intervalMovementID = window.setInterval(() => {
      this.handleStop();
    }, 3000);
  }

  protected update() {
    super.update(this.updateMovement.bind(this));
  }

  set bossHealth(health: number) {
    this._bossHealth = health;
  }

  get bossHealth() {
    return this._bossHealth;
  }

  setup(
    texture: Pixi.Texture,
    bossBullets: BulletStore,
    bulletsOnScreen: BulletStore
  ) {
    this._sprite = new Pixi.Sprite(texture);

    this._sprite.anchor.set(0.5);
    this._movementDirection = this.getInitialMovementDirection();
    this._app.stage.addChild(this._sprite);

    this._sprite.x = this._app.canvas.width / 2;
    this._sprite.y =
      this._sprite.height + config.padding.screenTop + config.padding.text;
    this._sprite.setSize(config.size.boss);
    this._sprite.anchor.set(0.5, 0);
    this._sprite.rotation = Math.PI;

    this.setTickerCallback(this.update.bind(this));
    this._app.ticker.add(this._tickerCallback);

    this._bossBullets = bossBullets;
    this._bulletsOnScreen = bulletsOnScreen;

    this.bulletSetup();
    this.stopSetup();
  }

  reset() {
    this._app.stage.removeChild(this._sprite);
    this._app.ticker.remove(this._tickerCallback);
    this.bossHealth = config.amount.bossHealth;
    clearInterval(this._intervalBulletID);
    clearInterval(this._intervalMovementID);
    console.log("Boss is reset");
  }
}
