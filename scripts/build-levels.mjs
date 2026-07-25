import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { levels } from "./levels.mjs";

const TILE = 18;
const T = {
  topLeft: 21,
  top: 22,
  topRight: 23,
  fillA: 122,
  fillB: 104,
  plants: [124, 125, 126, 127, 96, 97],
};

const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "assets",
  "tilemaps",
);

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function validateLevel(name, grid, width, height) {
  const solid = (x, y) =>
    x >= 0 && x < width && y >= 0 && y < height && grid[y][x] === "#";
  const problems = [];

  // Column ground heights: walking left/right must never require a climb of
  // more than 2 tiles (max jump rise), unless the column is a pit (no ground).
  const groundRow = (x) => {
    for (let y = 0; y < height; y++) if (solid(x, y)) return y;
    return null;
  };
  for (let x = 1; x < width; x++) {
    const a = groundRow(x - 1);
    const b = groundRow(x);
    if (a !== null && b !== null && Math.abs(a - b) > 2 && a - b > 2) {
      // climbing right into a wall taller than 2 — allowed only if it is a
      // deliberate wall (player approaches from elsewhere); flag walls > 4.
      if (a - b > 4) problems.push(`unclimbable wall at column ${x} (rise ${a - b})`);
    }
  }

  // Pits/pockets must be escapable: an empty cell below the terrain surface is
  // sealed if solid on both sides and above.
  for (let x = 0; x < width; x++) {
    let seenSolid = false;
    for (let y = height - 1; y >= 0; y--) {
      if (solid(x, y)) seenSolid = true;
      else if (seenSolid) {
        if (solid(x - 1, y) && solid(x + 1, y) && solid(x, y - 1)) {
          problems.push(`sealed pocket at (${x},${y})`);
        }
      }
    }
  }

  if (problems.length) {
    throw new Error(`${name} failed validation:\n  ${problems.join("\n  ")}`);
  }
}

function buildLevel(name, level, seed) {
  const { rows, hints } = level;
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  const grid = rows.map((r) => r.padEnd(width, ".").split(""));
  const solid = (x, y) =>
    x >= 0 && x < width && y >= 0 && y < height && grid[y][x] === "#";

  validateLevel(name, grid, width, height);

  const rand = mulberry32(seed);
  const terrain = [];
  const decor = new Array(width * height).fill(0);
  const objects = [];
  let objectId = 1;

  const addObject = (type, x, y, properties = {}) => {
    objects.push({
      id: objectId++,
      name: type,
      type,
      point: true,
      rotation: 0,
      visible: true,
      x: x * TILE + TILE / 2,
      y: y * TILE + TILE / 2,
      width: 0,
      height: 0,
      properties: Object.entries(properties).map(([key, value]) => ({
        name: key,
        type: typeof value === "number" ? "float" : "string",
        value,
      })),
    });
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = grid[y][x];
      if (ch === "#") {
        let index;
        if (!solid(x, y - 1)) {
          if (!solid(x - 1, y)) index = T.topLeft;
          else if (!solid(x + 1, y)) index = T.topRight;
          else index = T.top;
        } else {
          index = rand() < 0.75 ? T.fillA : T.fillB;
        }
        terrain.push(index + 1);
        if (!solid(x, y - 1) && y > 0 && grid[y - 1][x] === "." && rand() < 0.18) {
          decor[(y - 1) * width + x] =
            T.plants[Math.floor(rand() * T.plants.length)] + 1;
        }
      } else {
        terrain.push(0);
        switch (ch) {
          case "P":
            addObject("spawn", x, y);
            break;
          case "c":
            addObject("coin", x, y);
            break;
          case "s":
            addObject("spike", x, y);
            break;
          case "S":
            addObject("slime", x, y);
            break;
          case "B":
            addObject("bat", x, y);
            break;
          case "F":
            addObject("flag", x, y);
            break;
          case "M":
            addObject("platform", x, y, { dx: 3, dy: 0, speed: 40 });
            break;
          case "V":
            addObject("platform", x, y, { dx: 0, dy: 3, speed: 35 });
            break;
        }
      }
    }
  }

  for (const hint of hints) {
    addObject("hint", hint.x, hint.y, { text: hint.text });
  }

  const tileLayer = (layerName, data, id) => ({
    id,
    name: layerName,
    type: "tilelayer",
    data,
    width,
    height,
    x: 0,
    y: 0,
    opacity: 1,
    visible: true,
  });

  const map = {
    type: "map",
    version: "1.10",
    orientation: "orthogonal",
    renderorder: "right-down",
    infinite: false,
    width,
    height,
    tilewidth: TILE,
    tileheight: TILE,
    nextlayerid: 4,
    nextobjectid: objectId,
    layers: [
      tileLayer("terrain", terrain, 1),
      tileLayer("decor", decor, 2),
      {
        id: 3,
        name: "objects",
        type: "objectgroup",
        objects,
        x: 0,
        y: 0,
        opacity: 1,
        visible: true,
      },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: "tiles",
        image: "../tiles.png",
        imagewidth: 360,
        imageheight: 162,
        tilewidth: TILE,
        tileheight: TILE,
        tilecount: 180,
        columns: 20,
        margin: 0,
        spacing: 0,
      },
    ],
  };

  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(map));
  console.log(`built ${name}.json (${width}x${height}, ${objects.length} objects)`);
}

mkdirSync(outDir, { recursive: true });
levels.forEach((level, i) => buildLevel(`level-${i + 1}`, level, 1000 + i));
