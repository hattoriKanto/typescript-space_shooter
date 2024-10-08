export const config = {
  resolution: {
    width: 1280,
    height: 720,
  },
  size: {
    player: 100,
    asteroid: 120,
    boss: 150,
    explosion: 100,
    health: 25,
  },
  step: {
    player: 36,
    asteroid: 2,
    boss: 2,
    bullet: 6,
    asteroidRotation: 0.01,
  },
  amount: {
    playerBullets: 10,
    asteroids: 10,
    bossHealth: 4,
  },
  keyBindings: {
    left: "ArrowLeft",
    right: "ArrowRight",
    fire: " ",
  },
  padding: {
    screenTop: 90,
    text: 10,
  },
};
