import * as Pixi from "pixi.js";

export class Overlay {
  private _app: Pixi.Application<Pixi.Renderer>;
  private _overlay: Pixi.Container;
  private _text: string;

  constructor(app: Pixi.Application<Pixi.Renderer>, text: string) {
    this._app = app;
    this._overlay = new Pixi.Container();
    this._text = text;
  }

  private setupText(text: string) {
    const textElement = new Pixi.Text({
      text: text,
      style: {
        fontFamily: "Starjedi",
        fontSize: 36,
        fill: "white",
      },
    });
    textElement.anchor.set(0.5);
    textElement.position.set(
      this._app.screen.width / 2,
      this._app.screen.height / 2 - 50
    );
    this.overlay.addChild(textElement);
  }

  get overlay() {
    return this._overlay;
  }

  setup() {
    const background = new Pixi.Graphics();
    background.fill({ r: 0, g: 0, b: 0, a: 0.5 });
    background.rect(0, 0, this._app.screen.width, this._app.screen.height);
    background.endFill();

    this.overlay.addChild(background);

    this.overlay.interactive = true;
    this.setupText(this._text);
    this._app.stage.addChild(this.overlay);
  }

  remove() {
    this.overlay.destroy();
  }
}
