import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH, LEVELS } from "../config/constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    const bar = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      4,
      12,
      0xffffff,
    );
    this.load.on("progress", (value: number) => {
      bar.width = 4 + (GAME_WIDTH / 2) * value;
    });

    this.load.image("tiles", "assets/tiles.png");
    this.load.spritesheet("tiles-sheet", "assets/tiles.png", {
      frameWidth: 18,
      frameHeight: 18,
    });
    this.load.spritesheet("characters", "assets/characters.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("backgrounds", "assets/backgrounds.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    for (const level of LEVELS) {
      this.load.tilemapTiledJSON(level, `assets/tilemaps/${level}.json`);
    }

    this.load.audio("sfx-jump", "assets/audio/phaseJump1.ogg");
    this.load.audio("sfx-coin", "assets/audio/pepSound3.ogg");
    this.load.audio("sfx-stomp", "assets/audio/powerUp5.ogg");
    this.load.audio("sfx-hurt", "assets/audio/lowDown.ogg");
    this.load.audio("sfx-die", "assets/audio/zapThreeToneDown.ogg");
    this.load.audio("sfx-flag", "assets/audio/threeTone2.ogg");
    this.load.audio("sfx-select", "assets/audio/twoTone1.ogg");
  }

  create(): void {
    this.createAnimations();
    this.scene.start("menu");
  }

  private createAnimations(): void {
    this.anims.create({
      key: "player-idle",
      frames: [{ key: "characters", frame: 0 }],
    });
    this.anims.create({
      key: "player-run",
      frames: this.anims.generateFrameNumbers("characters", {
        frames: [0, 1],
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "player-jump",
      frames: [{ key: "characters", frame: 1 }],
    });
    this.anims.create({
      key: "slime-walk",
      frames: this.anims.generateFrameNumbers("characters", {
        frames: [18, 19],
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "bat-fly",
      frames: this.anims.generateFrameNumbers("characters", {
        frames: [24, 25],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "coin-spin",
      frames: this.anims.generateFrameNumbers("tiles-sheet", {
        frames: [151, 152],
      }),
      frameRate: 4,
      repeat: -1,
    });
  }
}
