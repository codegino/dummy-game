// Level composer. Grids are 16 rows tall; helpers guarantee exact column
// placement so layouts stay within player movement limits:
//   max jump rise: 2 tiles   max jump gap: 4 tiles
// All pits are open to the bottom of the map (falling is lethal, never a trap).
//
// Legend:
//   #  solid terrain        .  empty
//   P  player spawn         F  goal flag
//   c  coin                 s  spike
//   S  slime (patrols)      B  bat (flies)
//   M  moving platform (horizontal)
//   V  moving platform (vertical)

const HEIGHT = 16;

function makeGrid(width) {
  return Array.from({ length: HEIGHT }, () => ".".repeat(width));
}

function put(grid, col, row, text) {
  grid[row] = grid[row].slice(0, col) + text + grid[row].slice(col + text.length);
}

function fill(grid, col0, col1, row0, row1) {
  for (let row = row0; row <= row1; row++) {
    put(grid, col0, row, "#".repeat(col1 - col0 + 1));
  }
}

// --- Level 1: basics. Flat ground, two pits, one moving platform, gentle step.
function level1() {
  const g = makeGrid(64);

  fill(g, 0, 21, 12, 15); // ground A
  fill(g, 25, 38, 12, 15); // ground B   (pit: 22-24)
  fill(g, 46, 63, 12, 15); // ground C   (pit: 39-45, crossed via platform)
  fill(g, 56, 63, 10, 11); // step up to flag (rise 2)
  fill(g, 12, 16, 10, 10); // floating platform (rise 2)

  put(g, 1, 11, "P");
  put(g, 12, 8, "c.c.c"); // above floating platform
  put(g, 5, 11, "c");
  put(g, 19, 11, "c");
  put(g, 27, 11, "c");
  put(g, 37, 11, "c");
  put(g, 48, 11, "c");
  put(g, 52, 11, "c");
  put(g, 57, 9, "c.c");

  put(g, 33, 11, "s.s"); // spikes on ground B
  put(g, 30, 11, "S"); // slime on ground B
  put(g, 20, 6, "B");
  put(g, 42, 11, "M"); // carries across pit 39-45
  put(g, 61, 9, "F");

  const hints = [
    { x: 3, y: 9, text: "ARROWS / WASD\nTO MOVE" },
    { x: 9, y: 8, text: "SPACE TO JUMP\nHOLD = HIGHER" },
    { x: 19, y: 9, text: "R RESTARTS\nTHE LEVEL" },
    { x: 30, y: 8, text: "STOMP ENEMIES\nAVOID SPIKES" },
    { x: 42, y: 8, text: "RIDE THE\nPLATFORM" },
  ];

  return { rows: g, hints };
}

// --- Level 2: vertical platform, tower climb, tighter pits.
function level2() {
  const g = makeGrid(80);

  fill(g, 0, 15, 12, 15); // ground A
  fill(g, 19, 30, 12, 15); // ground B   (pit: 16-18)
  fill(g, 37, 52, 12, 15); // ground C   (pit: 31-36, moving platform)
  fill(g, 56, 63, 12, 15); // ground D   (pit: 53-55)
  fill(g, 64, 79, 8, 15); // tower (reached via vertical platform)
  fill(g, 24, 30, 10, 11); // step on ground B (rise 2)

  put(g, 1, 11, "P");
  put(g, 5, 11, "c");
  put(g, 12, 11, "c");
  put(g, 21, 11, "c");
  put(g, 25, 9, "c.c.c");
  put(g, 40, 11, "c");
  put(g, 45, 11, "c");
  put(g, 58, 11, "c");
  put(g, 69, 7, "c.c.c");

  put(g, 8, 11, "s.s");
  put(g, 48, 11, "s.s");
  put(g, 68, 7, "s"); // jump it on the tower top
  put(g, 22, 11, "S");
  put(g, 43, 11, "S");
  put(g, 74, 7, "S");
  put(g, 33, 6, "B");
  put(g, 59, 5, "B");

  put(g, 33, 11, "M"); // crosses pit 31-36
  put(g, 60, 7, "V"); // rides down to ground D, up to tower top
  put(g, 77, 7, "F");

  return { rows: g, hints: [] };
}

// --- Level 3: the gauntlet. Long pits, two moving platforms, staircase finale.
function level3() {
  const g = makeGrid(96);

  fill(g, 0, 11, 12, 15); // ground A
  fill(g, 15, 23, 12, 15); // ground B   (pit: 12-14)
  fill(g, 30, 43, 12, 15); // ground C   (pit: 24-29, moving platform)
  fill(g, 47, 59, 12, 15); // ground D   (pit: 44-46)
  fill(g, 68, 95, 12, 15); // ground E   (pit: 60-67, long moving platform)
  fill(g, 36, 40, 9, 9); // floating platform over ground C
  fill(g, 50, 54, 9, 9); // floating platform over ground D
  fill(g, 74, 77, 10, 11); // stair 1 (rise 2)
  fill(g, 78, 83, 8, 11); // stair 2 (rise 2, adjacent — no canyon)
  fill(g, 84, 95, 6, 15); // plateau (rise 2, adjacent)

  put(g, 1, 11, "P");
  put(g, 5, 11, "c");
  put(g, 9, 11, "c");
  put(g, 17, 11, "c");
  put(g, 37, 8, "c.c"); // above float 1
  put(g, 51, 8, "c.c"); // above float 2
  put(g, 33, 11, "c");
  put(g, 57, 11, "c");
  put(g, 70, 11, "c");
  put(g, 75, 9, "c");
  put(g, 80, 7, "c.c");
  put(g, 90, 5, "c");

  put(g, 19, 11, "s.s");
  put(g, 41, 11, "s.s");
  put(g, 55, 11, "s");
  put(g, 69, 11, "s");
  put(g, 87, 5, "s"); // guard before the flag: jump it
  put(g, 34, 11, "S");
  put(g, 50, 11, "S");
  put(g, 71, 11, "S");
  put(g, 27, 6, "B");
  put(g, 56, 5, "B");
  put(g, 84, 4, "B");

  put(g, 26, 11, "M"); // crosses pit 24-29
  put(g, 63, 11, "M"); // crosses pit 60-67
  put(g, 93, 5, "F");

  return { rows: g, hints: [] };
}

export const levels = [level1(), level2(), level3()];
