import * as Pixi from "pixi.js";
import { config } from "../config";
import { BulletStore, PlayerBullet } from ".";

export class Player {
  private _app: Pixi.Application<Pixi.Renderer>;
  private _sprite: Pixi.Sprite;
  private _playerBullets: BulletStore;
  private _bulletsOnScreen: BulletStore;
  private _bulletsLeft: number;
  private _updateTextCallback: () => void;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    this._app = app;
    this._sprite = new Pixi.Sprite();
    this._playerBullets = new BulletStore();
    this._bulletsOnScreen = new BulletStore();
    this._bulletsLeft = config.amount.playerBullets;
    this._updateTextCallback = () => {};
  }

  private handleMovement(event: KeyboardEvent) {
    if (event.key === config.keyBindings.left) {
      if (this.sprite.x - config.step.player - this.sprite.width / 2 >= 0) {
        this.sprite.x -= config.step.player;
      }
    }

    if (event.key === config.keyBindings.right) {
      if (
        this.sprite.x + config.step.player + this.sprite.width / 2 <=
        this._app.canvas.width
      ) {
        this.sprite.x += config.step.player;
      }
    }
  }

  private handleShooting(event: KeyboardEvent) {
    if (event.key === config.keyBindings.fire && this.bulletsLeft > 0) {
      this.shootBullet();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    this.handleMovement(event);
    this.handleShooting(event);
  };

  private shootBullet() {
    const bullet = new PlayerBullet(this._app);
    bullet.setup(this, this._playerBullets, this._bulletsOnScreen);
    this._bulletsLeft -= 1;
    this._updateTextCallback();
  }

  private addEventListeners() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  set updatetTextCallback(callback: () => void) {
    this._updateTextCallback = callback;
  }

  get sprite() {
    return this._sprite;
  }

  get bulletsLeft() {
    return this._bulletsLeft;
  }

  setup(
    texture: Pixi.Texture,
    playerBullets: BulletStore,
    bulletsOnScreen: BulletStore
  ) {
    this._sprite = new Pixi.Sprite(texture);
    this._sprite.setSize(config.size.player);
    this._sprite.x = this._app.canvas.width / 2;
    this._sprite.y = this._app.canvas.height - this._sprite.height - 20;
    this._sprite.anchor.set(0.5, 0);
    this._app.stage.addChild(this._sprite);

    this._playerBullets = playerBullets;
    this._bulletsOnScreen = bulletsOnScreen;

    this.addEventListeners();
  }

  reset() {
    this._bulletsLeft = config.amount.playerBullets;
    this._app.stage.removeChild(this._sprite);
    this.removeEventListeners();
  }
}
