import Phaser from "phaser";

import { gameState } from "../config/gameState";
import { buildTextMenu } from "./textMenu";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    buildTextMenu(this, {
      title: "COSMIC HOP",
      titleColor: "#38b6ff",
      lines: [
        "ARROWS / WASD to move, SPACE to jump",
        "Stomp enemies, grab coins, reach the flag",
        "Press R if you ever get stuck",
      ],
      onConfirm: () => {
        gameState.reset(this.registry);
        this.scene.start("game");
      },
    });
  }
}
