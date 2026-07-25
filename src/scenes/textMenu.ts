import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/constants";
import { hasTouchScreen } from "../input/VirtualControls";

interface TextMenuOptions {
  title: string;
  titleColor?: string;
  lines?: string[];
  prompt?: string;
  onConfirm: () => void;
}

export function buildTextMenu(
  scene: Phaser.Scene,
  options: TextMenuOptions,
): void {
  const cx = GAME_WIDTH / 2;

  scene.add
    .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1c2c)
    .setOrigin(0);

  scene.add
    .text(cx, GAME_HEIGHT * 0.28, options.title, {
      fontFamily: "monospace",
      fontSize: "36px",
      color: options.titleColor ?? "#ffffff",
      stroke: "#000000",
      strokeThickness: 6,
    })
    .setOrigin(0.5);

  (options.lines ?? []).forEach((line, i) => {
    scene.add
      .text(cx, GAME_HEIGHT * 0.46 + i * 22, line, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#c0cbdc",
      })
      .setOrigin(0.5);
  });

  const defaultPrompt = "PRESS SPACE TO START";
  const promptText = (options.prompt ?? defaultPrompt).replace(
    /PRESS SPACE/,
    hasTouchScreen() ? "TAP" : "PRESS SPACE",
  );
  const prompt = scene.add
    .text(cx, GAME_HEIGHT * 0.75, promptText, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#ffd541",
    })
    .setOrigin(0.5);

  scene.tweens.add({
    targets: prompt,
    alpha: 0.2,
    duration: 600,
    yoyo: true,
    repeat: -1,
  });

  const confirm = () => {
    scene.sound.play("sfx-select", { volume: 0.5 });
    options.onConfirm();
  };
  scene.input.keyboard!.once("keydown-SPACE", confirm);
  scene.input.keyboard!.once("keydown-ENTER", confirm);
  scene.input.once("pointerdown", confirm);
}
