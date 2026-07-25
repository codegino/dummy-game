import Phaser from "phaser";

import { LEVELS } from "../config/constants";
import { gameState } from "../config/gameState";
import { buildTextMenu } from "./textMenu";

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super("level-complete");
  }

  create(): void {
    const next = gameState.getLevelIndex(this.registry) + 1;
    buildTextMenu(this, {
      title: "LEVEL CLEAR!",
      titleColor: "#59c135",
      lines: [
        `SCORE ${gameState.getScore(this.registry)}`,
        `Next: level ${next} of ${LEVELS.length}`,
      ],
      prompt: "PRESS SPACE TO CONTINUE",
      onConfirm: () => this.scene.start("game"),
    });
  }
}
