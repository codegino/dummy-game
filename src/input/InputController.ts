import Phaser from "phaser";

export interface InputState {
  left: boolean;
  right: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
}

export class InputController {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<"up" | "left" | "right", Phaser.Input.Keyboard.Key>;

  touchLeft = false;
  touchRight = false;
  touchJump = false;
  private touchJumpWasHeld = false;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  read(): InputState {
    const keyboardJumpJustPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up);
    const touchJumpJustPressed = this.touchJump && !this.touchJumpWasHeld;
    this.touchJumpWasHeld = this.touchJump;

    return {
      left: this.cursors.left.isDown || this.wasd.left.isDown || this.touchLeft,
      right:
        this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight,
      jumpHeld:
        this.cursors.up.isDown ||
        this.cursors.space.isDown ||
        this.wasd.up.isDown ||
        this.touchJump,
      jumpJustPressed: keyboardJumpJustPressed || touchJumpJustPressed,
    };
  }
}
