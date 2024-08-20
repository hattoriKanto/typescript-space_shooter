import * as Pixi from "pixi.js";
import { images } from "../../public/images";
import { fonts } from "../../public/fonts";
import {
  AsteroidLevel,
  BossLevel,
  TextureStore,
  Overlay,
  Player,
  Background,
} from ".";

export class Game {
  private _app: Pixi.Application<Pixi.Renderer>;
  private _textureStore: TextureStore;
  private _level: AsteroidLevel | BossLevel;
  private _player: Player;
  private _background: Background;

  constructor(app: Pixi.Application<Pixi.Renderer>) {
    this._app = app;
    this._textureStore = new TextureStore(this._app);
    this._background = new Background(this._app);
    this._player = new Player(this._app);
    this._level = new AsteroidLevel(this);
  }

  private showStartOverlay() {
    const startOverlay = new Overlay(this._app, "Click to start");
    startOverlay.setup();

    startOverlay.overlay.on("click", () => {
      this._level.setup();

      this._level.victoryCallback = () => {
        this.showVictoryOverlay();
      };

      this._level.defeatCallback = () => {
        this.showDefeatOverlay();
      };

      startOverlay.remove();
    });
  }

  private showVictoryOverlay() {
    this.cleanup();

    const victoryOverlay = new Overlay(
      this._app,
      "You win. Click to move to the next level"
    );
    victoryOverlay.setup();
    victoryOverlay.overlay.on("click", () => {
      if (this._level instanceof AsteroidLevel) {
        this._level = new BossLevel(this);
      } else {
        this._level = new AsteroidLevel(this);
      }

      this._level.setup();

      this._level.victoryCallback = () => {
        this.showVictoryOverlay();
      };

      this._level.defeatCallback = () => {
        this.showDefeatOverlay();
      };

      victoryOverlay.remove();
    });
  }

  showDefeatOverlay() {
    this.cleanup();

    const defeatOverlay = new Overlay(
      this._app,
      "You lose. Click to try again"
    );
    defeatOverlay.setup();
    defeatOverlay.overlay.on("click", () => {
      this.cleanup();

      this._level = new AsteroidLevel(this);
      this._level.setup();

      this._level.victoryCallback = () => {
        this.showVictoryOverlay();
      };

      this._level.defeatCallback = () => {
        this.showDefeatOverlay();
      };

      defeatOverlay.remove();
    });
  }

  private async loadAssets() {
    Pixi.Assets.addBundle("images", images);
    const [textures] = await Promise.all([
      Pixi.Assets.loadBundle("images"),
      Pixi.Assets.load(fonts.starJedi),
    ]);

    this._textureStore.textures = textures;
  }

  private async setup() {
    await this.loadAssets();
    if (this._textureStore) {
      const backgroundTexture = this._textureStore.textures.background;
      this._background.setup(backgroundTexture);
    }
  }

  get app() {
    return this._app;
  }

  get player() {
    return this._player;
  }

  get textureStore() {
    return this._textureStore;
  }

  async start() {
    await this.setup();
    this.showStartOverlay();
  }

  cleanup() {
    this._level.cleanup();
    this._player.reset();
    console.log("Game reset");
  }
}
