import Phaser from "phaser";

import { gameState } from "../config/gameState";
import { buildTextMenu } from "./textMenu";

export class WinScene extends Phaser.Scene {
  constructor() {
    super("win");
  }

  create(): void {
    buildTextMenu(this, {
      title: "YOU WIN!",
      titleColor: "#ffd541",
      lines: [`FINAL SCORE ${gameState.getScore(this.registry)}`],
      prompt: "PRESS SPACE FOR MENU",
      onConfirm: () => this.scene.start("menu"),
    });
  }
}
