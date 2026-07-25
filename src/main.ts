import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "./config/constants";
import { BootScene } from "./scenes/BootScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { GameScene } from "./scenes/GameScene";
import { LevelCompleteScene } from "./scenes/LevelCompleteScene";
import { MenuScene } from "./scenes/MenuScene";
import { UIScene } from "./scenes/UIScene";
import { WinScene } from "./scenes/WinScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  backgroundColor: "#87ceeb",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 800 },
    },
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    UIScene,
    LevelCompleteScene,
    GameOverScene,
    WinScene,
  ],
});
