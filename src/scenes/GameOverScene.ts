import Phaser from "phaser";

import { gameState } from "../config/gameState";
import { buildTextMenu } from "./textMenu";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  create(): void {
    buildTextMenu(this, {
      title: "GAME OVER",
      titleColor: "#e64539",
      lines: [`FINAL SCORE ${gameState.getScore(this.registry)}`],
      prompt: "PRESS SPACE TO RETRY",
      onConfirm: () => {
        gameState.reset(this.registry);
        this.scene.start("game");
      },
    });
  }
}
