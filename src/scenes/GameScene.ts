import Phaser from "phaser";

import {
  DEPTHS,
  GAME_HEIGHT,
  GAME_WIDTH,
  LEVELS,
  SCORE,
  TILE_SIZE,
} from "../config/constants";
import { gameState } from "../config/gameState";
import { Bat, Enemy, Slime } from "../entities/enemies";
import { MovingPlatform } from "../entities/MovingPlatform";
import { Player } from "../entities/Player";

const SPIKE_FRAME = 68;
const FLAG_FRAMES = [111, 112];

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private terrainLayer!: Phaser.Tilemaps.TilemapLayer;
  private enemies!: Phaser.Physics.Arcade.Group;
  private transitioning = false;

  constructor() {
    super("game");
  }

  create(): void {
    this.transitioning = false;

    const levelKey = LEVELS[gameState.getLevelIndex(this.registry)];
    const map = this.make.tilemap({ key: levelKey });
    const tileset = map.addTilesetImage("tiles", "tiles")!;

    this.createBackground(map);

    this.terrainLayer = map.createLayer("terrain", tileset)!;
    this.terrainLayer.setCollisionByExclusion([-1]);
    map.createLayer("decor", tileset)!.setDepth(DEPTHS.decor);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.enemies = this.physics.add.group({ runChildUpdate: false });

    const coins = this.physics.add.group({ allowGravity: false });
    const spikes = this.physics.add.staticGroup();
    const flags = this.physics.add.staticGroup();
    const platforms: MovingPlatform[] = [];

    let spawn = { x: TILE_SIZE * 2, y: TILE_SIZE * 2 };
    for (const obj of map.getObjectLayer("objects")!.objects) {
      const { x = 0, y = 0 } = obj;
      switch (obj.type) {
        case "spawn":
          spawn = { x, y };
          break;
        case "coin":
          coins.create(x, y, "tiles-sheet", 151).anims.play("coin-spin");
          break;
        case "spike": {
          const spike = spikes.create(
            x,
            y,
            "tiles-sheet",
            SPIKE_FRAME,
          ) as Phaser.Physics.Arcade.Sprite;
          (spike.body as Phaser.Physics.Arcade.StaticBody)
            .setSize(14, 8)
            .setOffset(2, 10);
          break;
        }
        case "slime":
          this.enemies.add(new Slime(this, x, y));
          break;
        case "bat":
          this.enemies.add(new Bat(this, x, y));
          break;
        case "flag":
          flags
            .create(x - TILE_SIZE / 2, y - TILE_SIZE / 2, "tiles-sheet", FLAG_FRAMES[0])
            .setDepth(DEPTHS.decor);
          flags
            .create(x + TILE_SIZE / 2, y - TILE_SIZE / 2, "tiles-sheet", FLAG_FRAMES[1])
            .setDepth(DEPTHS.decor);
          break;
        case "hint": {
          const props = Object.fromEntries(
            (obj.properties ?? []).map(
              (p: { name: string; value: unknown }) => [p.name, p.value],
            ),
          );
          this.add
            .image(x, y + TILE_SIZE, "tiles-sheet", 84)
            .setDepth(DEPTHS.decor);
          this.add
            .text(x, y - 6, String(props.text ?? ""), {
              fontFamily: "monospace",
              fontSize: "9px",
              color: "#ffffff",
              stroke: "#1a1c2c",
              strokeThickness: 3,
              align: "center",
            })
            .setOrigin(0.5, 1)
            .setDepth(DEPTHS.decor);
          break;
        }
        case "platform": {
          const props = Object.fromEntries(
            (obj.properties ?? []).map(
              (p: { name: string; value: unknown }) => [p.name, p.value],
            ),
          );
          platforms.push(
            new MovingPlatform(this, x, y, {
              dx: Number(props.dx ?? 3),
              dy: Number(props.dy ?? 0),
              speed: Number(props.speed ?? 40),
            }),
          );
          break;
        }
      }
    }

    this.player = new Player(this, spawn.x, spawn.y);

    this.physics.add.collider(this.player, this.terrainLayer);
    this.physics.add.collider(this.enemies, this.terrainLayer);
    this.physics.add.collider(this.player, platforms);

    this.physics.add.overlap(this.player, coins, (_p, coin) => {
      (coin as Phaser.GameObjects.GameObject).destroy();
      this.sound.play("sfx-coin", { volume: 0.5 });
      gameState.addScore(this.registry, SCORE.coin);
    });

    this.physics.add.overlap(this.player, spikes, () => this.hurtPlayer());

    this.physics.add.overlap(this.player, this.enemies, (_p, enemyObj) => {
      const enemy = enemyObj as Enemy;
      if (!enemy.body.enable) return;
      const stomping =
        this.player.body.velocity.y > 0 &&
        this.player.body.bottom < enemy.body.top + 8;
      if (stomping) {
        enemy.kill();
        this.player.bounce();
        this.sound.play("sfx-stomp", { volume: 0.5 });
        gameState.addScore(this.registry, SCORE.enemy);
      } else {
        this.hurtPlayer();
      }
    });

    this.physics.add.overlap(this.player, flags, () => this.completeLevel());

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(60, 40);

    this.scene.launch("ui");

    this.input.keyboard!.on("keydown-R", () => this.killPlayer());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-R");
    });
  }

  update(time: number): void {
    if (this.transitioning) return;
    this.player.update(time);
    if (this.player.body.top > this.physics.world.bounds.height) {
      this.killPlayer();
    }
  }

  isSolidAt(x: number, y: number): boolean {
    const tile = this.terrainLayer.getTileAtWorldXY(x, y);
    return tile !== null && tile.collides;
  }

  private createBackground(map: Phaser.Tilemaps.Tilemap): void {
    const sky = this.add.rectangle(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x87ceeb,
    );
    sky.setOrigin(0).setScrollFactor(0).setDepth(DEPTHS.background - 1);

    const cols = Math.ceil(map.widthInPixels / 24) + 1;
    for (let i = 0; i < cols; i++) {
      const frame = i % 3 === 0 ? 8 : i % 3 === 1 ? 9 : 10;
      this.add
        .image(i * 24, map.heightInPixels - 60, "backgrounds", frame)
        .setOrigin(0, 1)
        .setScrollFactor(0.3, 0.9)
        .setDepth(DEPTHS.background)
        .setScale(3);
    }
  }

  private hurtPlayer(): void {
    if (this.player.isInvulnerable || this.transitioning) return;
    this.sound.play("sfx-hurt", { volume: 0.5 });
    const lives = gameState.loseLife(this.registry);
    if (lives <= 0) {
      this.killPlayer(false);
      return;
    }
    this.player.startInvulnerability();
    this.player.bounce();
    this.cameras.main.shake(150, 0.008);
  }

  private killPlayer(costsLife = true): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.sound.play("sfx-die", { volume: 0.5 });
    if (costsLife) gameState.loseLife(this.registry);
    this.player.disableControl();
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.stop("ui");
        if (gameState.getLives(this.registry) <= 0) {
          this.scene.start("game-over");
        } else {
          this.scene.restart();
        }
      },
    );
  }

  private completeLevel(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.sound.play("sfx-flag", { volume: 0.6 });
    gameState.addScore(this.registry, SCORE.levelClear);
    this.player.disableControl();
    this.cameras.main.fadeOut(600, 255, 255, 255);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.stop("ui");
        const next = gameState.getLevelIndex(this.registry) + 1;
        if (next >= LEVELS.length) {
          this.scene.start("win");
        } else {
          gameState.setLevelIndex(this.registry, next);
          this.scene.start("level-complete");
        }
      },
    );
  }
}
