import * as Pixi from "pixi.js";

export class Background {
  private _app: Pixi.Application<Pixi.Renderer>;
  private _sprite: Pixi.Sprite;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    this._app = app;
    this._sprite = new Pixi.Sprite();
  }

  setup(texture: Pixi.Texture) {
    const { width, height } = this._app.canvas;

    this._sprite = new Pixi.Sprite(texture);
    this._sprite.x = width / 2;
    this._sprite.y = height / 2;
    this._sprite.anchor.set(0.5);
    this._app.stage.addChild(this._sprite);
  }
}
