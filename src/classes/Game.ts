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

  private async setup() {
    try {
      await this.loadAssets();
      this._background.setup(this._textureStore.textures.background);
    } catch (error) {
      console.error("Failed to setup game:", error);
    }
  }

  private async loadAssets() {
    try {
      Pixi.Assets.addBundle("images", images);
      const [textures] = await Promise.all([
        Pixi.Assets.loadBundle("images"),
        Pixi.Assets.load(fonts.starJedi),
      ]);
      this._textureStore.textures = textures;
    } catch (error) {
      console.error("Failed to load assets:", error);
    }
  }

  private showStartOverlay() {
    const startOverlay = new Overlay(this._app, "Click to start");
    startOverlay.setup();

    startOverlay.overlay.on("click", () => {
      this.initializeLevel(new AsteroidLevel(this));
      startOverlay.remove();
    });
  }

  private initializeLevel(level: AsteroidLevel | BossLevel) {
    this._level = level;
    this._level.setup();

    this._level.victoryCallback = () => this.showVictoryOverlay();
    this._level.defeatCallback = () => this.showDefeatOverlay();
  }

  private showVictoryOverlay() {
    this.cleanup();

    const victoryOverlay = new Overlay(
      this._app,
      "You win. Click to move to the next level"
    );
    victoryOverlay.setup();

    victoryOverlay.overlay.on("click", () => {
      const newLevel =
        this._level instanceof AsteroidLevel
          ? new BossLevel(this)
          : new AsteroidLevel(this);
      this.initializeLevel(newLevel);
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
      this.initializeLevel(new AsteroidLevel(this));
      defeatOverlay.remove();
    });
  }

  public async start() {
    await this.setup();
    this.showStartOverlay();
  }

  private cleanup() {
    if (this._level) {
      this._level.cleanup();
    }
    this._player.reset();
  }

  public get player() {
    return this._player;
  }

  public get textureStore() {
    return this._textureStore;
  }

  public get app() {
    return this._app;
  }
}
