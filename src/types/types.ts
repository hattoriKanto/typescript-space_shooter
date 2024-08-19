import * as Pixi from "pixi.js";

export enum HorizontalMovementDirection {
  "left" = "left",
  "right" = "right",
  "none" = "none",
}

export interface Texture {
  [key: string]: Pixi.Texture;
}

export interface Position {
  x: number;
  y: number;
}
