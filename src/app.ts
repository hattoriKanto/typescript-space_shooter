import * as Pixi from "pixi.js";
import { config } from "./config";

import { Game } from "./classes";

(async () => {
  const app = new Pixi.Application();
  await app.init({
    width: config.resolution.width,
    height: config.resolution.height,
  });
  document.querySelector("#app")?.appendChild(app.canvas);

  const game = new Game(app);
  await game.start();
})();
