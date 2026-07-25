import Phaser from "phaser";

import { DEPTHS, GAME_HEIGHT, GAME_WIDTH } from "../config/constants";
import type { InputController } from "./InputController";

export function hasTouchScreen(): boolean {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

interface ButtonOptions {
  x: number;
  y: number;
  label: string;
  radius?: number;
  onDown: () => void;
  onUp: () => void;
}

export class VirtualControls {
  constructor(
    private scene: Phaser.Scene,
    input: InputController,
  ) {
    this.scene.input.addPointer(2);

    const y = GAME_HEIGHT - 48;
    this.createButton({
      x: 44,
      y,
      label: "◀",
      onDown: () => (input.touchLeft = true),
      onUp: () => (input.touchLeft = false),
    });
    this.createButton({
      x: 118,
      y,
      label: "▶",
      onDown: () => (input.touchRight = true),
      onUp: () => (input.touchRight = false),
    });
    this.createButton({
      x: GAME_WIDTH - 52,
      y,
      label: "▲",
      radius: 34,
      onDown: () => (input.touchJump = true),
      onUp: () => (input.touchJump = false),
    });
  }

  private createButton(options: ButtonOptions): void {
    const radius = options.radius ?? 28;
    const zone = this.scene.add
      .circle(options.x, options.y, radius + 10, 0xffffff, 0.001)
      .setScrollFactor(0)
      .setDepth(DEPTHS.hud + 1)
      .setInteractive();

    const face = this.scene.add
      .circle(options.x, options.y, radius, 0x1a1c2c, 0.35)
      .setStrokeStyle(2, 0xffffff, 0.5)
      .setScrollFactor(0)
      .setDepth(DEPTHS.hud + 1);

    this.scene.add
      .text(options.x, options.y, options.label, {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0.8)
      .setScrollFactor(0)
      .setDepth(DEPTHS.hud + 2);

    const press = () => {
      face.setFillStyle(0xffffff, 0.25);
      options.onDown();
    };
    const release = () => {
      face.setFillStyle(0x1a1c2c, 0.35);
      options.onUp();
    };

    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, press);
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, release);
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, release);
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, (
      pointer: Phaser.Input.Pointer,
    ) => {
      if (pointer.isDown) press();
    });
  }
}
