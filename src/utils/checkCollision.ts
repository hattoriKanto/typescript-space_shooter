import * as PIXI from "pixi.js";

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

const getCenterPosition = (object: PIXI.Sprite | PIXI.Graphics) => {
  const bounds = object.getBounds();
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  return { x: centerX, y: centerY };
};

const getRadius = (object: PIXI.Sprite | PIXI.Graphics) => {
  if (object instanceof PIXI.Sprite) {
    const bounds = object.getBounds();
    return Math.min(bounds.width, bounds.height) / 2; 
  }

  const bounds = object.getLocalBounds();
  return Math.min(bounds.width, bounds.height) / 2;
};

export const checkCollision = (
  object1: PIXI.Sprite | PIXI.Graphics,
  object2: PIXI.Sprite | PIXI.Graphics
) => {
  const pos1 = getCenterPosition(object1);
  const pos2 = getCenterPosition(object2);

  const distance = getDistance(pos1.x, pos1.y, pos2.x, pos2.y);
  const radius1 = getRadius(object1);
  const radius2 = getRadius(object2);

  return distance <= radius1 + radius2;
};
