import type Phaser from "phaser";

import { PLAYER } from "../config/constants";

const KEYS = {
  score: "score",
  lives: "lives",
  levelIndex: "levelIndex",
} as const;

export const gameState = {
  reset(registry: Phaser.Data.DataManager): void {
    registry.set(KEYS.score, 0);
    registry.set(KEYS.lives, PLAYER.maxLives);
    registry.set(KEYS.levelIndex, 0);
  },

  getScore(registry: Phaser.Data.DataManager): number {
    return registry.get(KEYS.score) ?? 0;
  },

  addScore(registry: Phaser.Data.DataManager, amount: number): void {
    registry.set(KEYS.score, this.getScore(registry) + amount);
  },

  getLives(registry: Phaser.Data.DataManager): number {
    return registry.get(KEYS.lives) ?? PLAYER.maxLives;
  },

  loseLife(registry: Phaser.Data.DataManager): number {
    const lives = Math.max(0, this.getLives(registry) - 1);
    registry.set(KEYS.lives, lives);
    return lives;
  },

  getLevelIndex(registry: Phaser.Data.DataManager): number {
    return registry.get(KEYS.levelIndex) ?? 0;
  },

  setLevelIndex(registry: Phaser.Data.DataManager, index: number): void {
    registry.set(KEYS.levelIndex, index);
  },
};
