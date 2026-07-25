import Phaser from "phaser";

import { DEPTHS, PLAYER } from "../config/constants";
import type { InputController } from "../input/InputController";

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private controls: InputController;
  private lastGroundedAt = 0;
  private jumpRequestedAt = -Infinity;
  private invulnerableUntil = 0;
  private controlEnabled = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    input: InputController,
  ) {
    super(scene, x, y, "characters", 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTHS.player);
    this.body.setSize(14, 18).setOffset(5, 6);
    this.body.setMaxVelocityY(500);
    this.setDragX(PLAYER.drag);
    this.setCollideWorldBounds(true);

    this.controls = input;
  }

  get isInvulnerable(): boolean {
    return this.scene.time.now < this.invulnerableUntil;
  }

  update(time: number): void {
    if (!this.controlEnabled) return;

    const { left, right, jumpHeld, jumpJustPressed } = this.controls.read();

    if (left && !right) {
      this.setAccelerationX(-PLAYER.acceleration);
      this.setFlipX(true);
    } else if (right && !left) {
      this.setAccelerationX(PLAYER.acceleration);
      this.setFlipX(false);
    } else {
      this.setAccelerationX(0);
    }

    this.body.setMaxVelocityX(PLAYER.runSpeed);

    const grounded = this.body.blocked.down;
    if (grounded) this.lastGroundedAt = time;
    if (jumpJustPressed) this.jumpRequestedAt = time;

    const canCoyoteJump = time - this.lastGroundedAt < PLAYER.coyoteTimeMs;
    const jumpBuffered = time - this.jumpRequestedAt < PLAYER.jumpBufferMs;

    if (jumpBuffered && canCoyoteJump && this.body.velocity.y >= 0) {
      this.jump();
    }

    if (!jumpHeld && this.body.velocity.y < -120) {
      this.setVelocityY(-120);
    }

    if (!grounded) {
      this.play("player-jump", true);
    } else if (Math.abs(this.body.velocity.x) > 10) {
      this.play("player-run", true);
    } else {
      this.play("player-idle", true);
    }

    if (this.isInvulnerable) {
      this.setAlpha(Math.sin(time / 40) > 0 ? 1 : 0.3);
    } else {
      this.setAlpha(1);
    }
  }

  jump(): void {
    this.setVelocityY(PLAYER.jumpVelocity);
    this.lastGroundedAt = -Infinity;
    this.jumpRequestedAt = -Infinity;
    this.scene.sound.play("sfx-jump", { volume: 0.4 });
  }

  bounce(): void {
    this.setVelocityY(PLAYER.bounceVelocity);
  }

  startInvulnerability(): void {
    this.invulnerableUntil = this.scene.time.now + PLAYER.invulnerableMs;
  }

  disableControl(): void {
    this.controlEnabled = false;
    this.setAccelerationX(0);
    this.setVelocityX(0);
  }
}
