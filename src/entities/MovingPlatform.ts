import Phaser from "phaser";

import { DEPTHS, TILE_SIZE } from "../config/constants";

export interface PlatformPath {
  dx: number;
  dy: number;
  speed: number;
}

export class MovingPlatform extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  private readonly start: Phaser.Math.Vector2;
  private readonly end: Phaser.Math.Vector2;
  private readonly speed: number;
  private target: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number, path: PlatformPath) {
    super(scene, x, y, [
      scene.add.image(-TILE_SIZE, 0, "tiles-sheet", 64),
      scene.add.image(0, 0, "tiles-sheet", 65),
      scene.add.image(TILE_SIZE, 0, "tiles-sheet", 66),
    ]);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.platforms);

    this.body.setSize(TILE_SIZE * 3, 10);
    this.body.setOffset(-TILE_SIZE * 1.5, -5);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    this.start = new Phaser.Math.Vector2(x, y);
    this.end = new Phaser.Math.Vector2(
      x + path.dx * TILE_SIZE,
      y + path.dy * TILE_SIZE,
    );
    this.speed = path.speed;
    this.target = this.end;
    this.moveTowardTarget();
  }

  preUpdate(): void {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y,
    );
    if (distance < 2) {
      this.target = this.target === this.end ? this.start : this.end;
      this.moveTowardTarget();
    }
  }

  private moveTowardTarget(): void {
    this.scene.physics.moveTo(this, this.target.x, this.target.y, this.speed);
  }
}
