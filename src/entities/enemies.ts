import Phaser from "phaser";

import { DEPTHS, ENEMIES } from "../config/constants";

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame: number,
  ) {
    super(scene, x, y, "characters", frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.enemies);
  }

  abstract kill(): void;
}

export class Slime extends Enemy {
  private direction = -1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 18);
    this.body.setSize(16, 12).setOffset(4, 12);
    this.play("slime-walk");
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.body.enable) return;

    if (this.body.blocked.left) this.direction = 1;
    else if (this.body.blocked.right) this.direction = -1;
    else if (this.body.blocked.down && this.isAtLedge()) {
      this.direction *= -1;
    }

    this.setVelocityX(ENEMIES.slimeSpeed * this.direction);
    this.setFlipX(this.direction > 0);
  }

  private isAtLedge(): boolean {
    const probeX =
      this.direction < 0 ? this.body.left - 2 : this.body.right + 2;
    const scene = this.scene as Phaser.Scene & {
      isSolidAt?: (x: number, y: number) => boolean;
    };
    return scene.isSolidAt ? !scene.isSolidAt(probeX, this.body.bottom + 4) : false;
  }

  kill(): void {
    this.body.enable = false;
    this.anims.stop();
    this.setFlipY(true);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0.4,
      duration: 250,
      onComplete: () => this.destroy(),
    });
  }
}

export class Bat extends Enemy {
  private readonly baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 24);
    this.baseY = y;
    this.body.setAllowGravity(false);
    this.body.setSize(18, 12).setOffset(3, 6);
    this.play("bat-fly");
    this.setVelocityX(-ENEMIES.batSpeed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.body.enable) return;

    if (this.body.blocked.left) this.setVelocityX(ENEMIES.batSpeed);
    else if (this.body.blocked.right) this.setVelocityX(-ENEMIES.batSpeed);

    this.setFlipX(this.body.velocity.x > 0);
    this.y = this.baseY + Math.sin(time / 300) * (ENEMIES.batRange / 4);
  }

  kill(): void {
    this.body.enable = false;
    this.anims.stop();
    this.setFlipY(true);
    this.scene.tweens.add({
      targets: this,
      y: this.y + 60,
      alpha: 0,
      duration: 350,
      onComplete: () => this.destroy(),
    });
  }
}
