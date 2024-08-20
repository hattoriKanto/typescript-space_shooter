import * as Pixi from "pixi.js";
import { Position } from "../types/types";
import { config } from "../config";

export class Explosion {
  private _app: Pixi.Application<Pixi.Renderer>;
  private _sprite: Pixi.Sprite;

  constructor(app: Pixi.Application<Pixi.Renderer>, texture: Pixi.Texture) {
    this._app = app;
    this._sprite = new Pixi.Sprite(texture);
  }

  get sprite() {
    return this._sprite;
  }

  setup(position: Position) {
    this._sprite.setSize(config.size.explosion);
    this._sprite.x = position.x;
    this._sprite.y = position.y;
    this._sprite.anchor.set(0.5, 0);
    this._app.stage.addChild(this._sprite);
  }

  remove() {
    setTimeout(() => {
      this._app.stage.removeChild(this._sprite);
    }, 500);
  }
}
