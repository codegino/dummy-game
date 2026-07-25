import Phaser from "phaser";

import { DEPTHS, LEVELS } from "../config/constants";
import { gameState } from "../config/gameState";

const HEART_FULL = 44;

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];

  constructor() {
    super("ui");
  }

  create(): void {
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      this.hearts.push(
        this.add
          .image(16 + i * 22, 16, "tiles-sheet", HEART_FULL)
          .setScale(1.2)
          .setDepth(DEPTHS.hud),
      );
    }

    this.scoreText = this.add
      .text(624, 8, "", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ffffff",
        stroke: "#1a1c2c",
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setDepth(DEPTHS.hud);

    const level = gameState.getLevelIndex(this.registry) + 1;
    this.add
      .text(320, 8, `LEVEL ${level}/${LEVELS.length}`, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#ffffff",
        stroke: "#1a1c2c",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTHS.hud);
  }

  update(): void {
    this.scoreText.setText(
      `SCORE ${gameState.getScore(this.registry).toString().padStart(5, "0")}`,
    );
    const lives = gameState.getLives(this.registry);
    this.hearts.forEach((heart, i) => heart.setVisible(i < lives));
  }
}
