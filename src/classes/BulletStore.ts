import { Bullet } from ".";

export class BulletStore {
  protected _bullets: Bullet[];

  constructor() {
    this._bullets = [];
  }

  get bullets() {
    return this._bullets;
  }

  get amount() {
    return this._bullets.length;
  }

  addBullet(newBullet: Bullet) {
    this._bullets.push(newBullet);
  }

  removeBulletByID(bulletID: number) {
    this._bullets = this._bullets.filter(
      (bullet) => bullet.graphics.uid !== bulletID
    );
  }

  reset(parentStore: BulletStore, bulletsOnScreen: BulletStore) {
    this._bullets.forEach((bullet) =>
      bullet.remove(parentStore, bulletsOnScreen)
    );
    this._bullets = [];
  }
}
