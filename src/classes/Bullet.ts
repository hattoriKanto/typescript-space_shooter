import * as Pixi from "pixi.js";
import { Boss, BulletStore, Player } from ".";
import { config } from "../config";

export class Bullet {
  protected _app: Pixi.Application<Pixi.Renderer>;
  protected _graphics: Pixi.Graphics;
  protected _tickerCallback: () => void;
  protected _direction: number;

  constructor(app: Pixi.Application<Pixi.Renderer>, direction: number) {
    this._app = app;
    this._graphics = new Pixi.Graphics();
    this._tickerCallback = () => {};
    this._direction = direction;
  }

  protected setTickerCallback() {
    this._tickerCallback = () => this.movementTicker();
  }

  protected movementTicker() {
    this._graphics.y += this._direction * config.step.bullet;
  }

  get graphics() {
    return this._graphics;
  }
  isOffscreen() {
    const result =
      this._graphics.y <= 0 || this._graphics.y >= this._app.canvas.height;
    return result;
  }

  setup(
    parent: Player | Boss,
    parentStore: BulletStore,
    bulletsOnScreen: BulletStore
  ) {
    this._graphics.circle(0, 0, 5).fill(0xff0000);
    this._graphics.x = parent.sprite.x;
    this._graphics.y = parent.sprite.y;
    this._app.stage.addChild(this._graphics);

    parentStore.addBullet(this);
    bulletsOnScreen.addBullet(this);

    this.setTickerCallback();
    this._app.ticker.add(this._tickerCallback);
  }

  remove(parentStore: BulletStore, bulletsOnScreen: BulletStore) {
    parentStore.removeBulletByID(this._graphics.uid);
    bulletsOnScreen.removeBulletByID(this._graphics.uid);
    this._app.stage.removeChild(this._graphics);
    this._app.ticker.remove(this._tickerCallback);
  }
}

export class PlayerBullet extends Bullet {
  constructor(app: Pixi.Application<Pixi.Renderer>) {
    super(app, -1);
  }
}

export class BossBullet extends Bullet {
  constructor(app: Pixi.Application<Pixi.Renderer>) {
    super(app, 1);
  }
}
