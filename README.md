# Cosmic Hop

A 2D platformer built with Phaser 3, TypeScript, and Vite.

## Play

- **Move**: arrow keys or WASD
- **Jump**: space / up / W (release early for a shorter hop)
- Stomp enemies, collect coins, avoid spikes, reach the flag
- 3 levels, 3 lives

## Development

```sh
npm install
npm run dev
```

## Build & deploy

```sh
npm run build
```

Outputs static files to `dist/`. Deploys to Vercel with zero config (framework preset: Vite).

## Levels

Levels are authored as ASCII maps in `scripts/levels.mjs` and compiled into
Tiled-format JSON (`public/assets/tilemaps/`) by `npm run levels`, which runs
automatically as part of `npm run build`. The generated files are standard
Tiled maps and can be opened in the [Tiled](https://www.mapeditor.org/) editor.

## Project structure

```
scripts/            level authoring (ASCII -> Tiled JSON)
src/
  main.ts           Phaser game bootstrap
  config/           tunable constants + cross-scene game state
  entities/         Player, enemies, moving platforms
  scenes/           Boot -> Menu -> Game (+UI overlay) -> LevelComplete/GameOver/Win
public/assets/      spritesheets, tilemaps, audio
```

## Credits

Art and audio: [Kenney](https://kenney.nl) — Pixel Platformer & Digital Audio packs (CC0).
