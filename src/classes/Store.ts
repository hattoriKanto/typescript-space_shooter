import * as Pixi from "pixi.js";
import { Asteroid } from ".";
import { Texture } from "../types/types";

export class Store {
  protected _app: Pixi.Application<Pixi.Renderer>;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    this._app = app;
  }
}

export class TextureStore extends Store {
  private _textures: Texture;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    super(app);
    this._textures = {};
  }

  set textures(textures: Texture) {
    this._textures = textures;
  }

  get textures() {
    return this._textures;
  }
}

export class AsteroidStore extends Store {
  private _asteroids: Asteroid[];

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    super(app);
    this._asteroids = [];
  }

  set asteroids(asteroids: Asteroid[]) {
    this._asteroids = asteroids;
  }

  get asteroids() {
    return this._asteroids;
  }

  addAsteroid(newAsteroid: Asteroid) {
    this._asteroids.push(newAsteroid);
  }

  removeAsteroidByID(asteroidID: number) {
    this._asteroids = this._asteroids.filter(
      (asteroid) => asteroid.sprite.uid !== asteroidID
    );
  }

  reset() {
    this._asteroids.forEach((asteroid) => {
      asteroid.remove(this);
    });

    this._asteroids = [];
  }
}
