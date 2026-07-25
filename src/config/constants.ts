export const TILE_SIZE = 18;

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

export const PLAYER = {
  runSpeed: 130,
  acceleration: 900,
  drag: 1100,
  jumpVelocity: -285,
  coyoteTimeMs: 100,
  jumpBufferMs: 120,
  bounceVelocity: -220,
  invulnerableMs: 1500,
  maxLives: 3,
} as const;

export const ENEMIES = {
  slimeSpeed: 35,
  batSpeed: 55,
  batRange: 70,
} as const;

export const SCORE = {
  coin: 10,
  enemy: 25,
  levelClear: 100,
} as const;

export const LEVELS = ["level-1", "level-2", "level-3"] as const;

export const DEPTHS = {
  background: -10,
  decor: 5,
  platforms: 8,
  enemies: 9,
  player: 10,
  effects: 20,
  hud: 100,
} as const;
