# icepick

A tool for rendering codebases as navigable spatial environments, and a vim-keybinding game engine built on the same substrate.

---

## What it is

Icepick has two related faces.

The first is a snapshot tool. Running `icepick.sh` against any repository produces a single flat text file — a structured concatenation of the directory tree and all readable file contents, delimited by `FILE:` markers. This snapshot can be loaded into the browser engine, which parses it into a navigable world: directories become rooms, files become objects you can enter, and the lines inside a file become spatial geometry derived from their indentation depth and length.

The second is a 2D puzzle game (`icepick-2d.html`) that teaches vim motions by making them operators over a discrete text manifold. Commands are collectible. Terrain encodes constraint. Movement is evaluation.

The two faces share the same underlying idea: a codebase or text is a space, and vim's motion algebra is a language for traversing it.

---

## Repository structure

```
icepick.sh              snapshot generator (bash)
icepick_snapshot.txt    example snapshot of this repo
index.html              3D first-person browser engine entry point
main.js                 engine loop, state, input dispatch
parser.js               icepick snapshot format parser
world.js                builds navigable tree from parsed file list
render_fp.js            first-person raycaster (three render modes: FP, 2D, terminal)
render_2d.js            top-down tile renderer
render_terminal.js      text-mode directory listing renderer
vim.js                  vim operator handling (dd, yy, p, u, .)
style.css               CRT green-on-black aesthetic
icepick-2d.html         self-contained 2D puzzle game (no dependencies)
stochastic-growth.html  RSVP field growth simulation (standalone)
```

---

## The snapshot format

`icepick.sh` produces a file with this structure:

```
===== ICEPICK SNAPSHOT =====
Generated: ...
Root: /path/to/repo

===== DIRECTORY TREE =====
...tree output...

===== FILE CONTENTS =====

----- FILE: ./path/to/file.js -----
...file contents...
----- END FILE: ./path/to/file.js -----

===== END SNAPSHOT =====
```

Binary files are skipped. The snapshot is human-readable and can be fed directly to a language model for analysis, or loaded into the browser engine for spatial navigation.

To generate a snapshot:

```bash
./icepick.sh output.txt /path/to/repo
```

---

## The 3D engine

The browser engine (`index.html`) loads a snapshot, builds a world tree, and renders it in one of three switchable modes:

- **FP** — first-person raycaster. File contents are rendered as architecture: indentation depth becomes left-wall distance, line length becomes corridor width. Deleted lines become open holes you can walk through.
- **2D** — top-down map showing directories and files as colored tiles.
- **Terminal** — text-mode directory listing.

Tab cycles between modes. 1/2/3 jumps directly.

Inside a file, vim operators act on the geometry: `dd` demolishes the current line (turns it into open space), `yy` yanks the first word into a register, `p` spawns the yanked word as a floating object in the world. `u` undoes.

The engine is self-hosting: the deployed version at `standardgalactic.github.io/icepick/` navigates its own source as the default world.

---

## The 2D game

`icepick-2d.html` is a self-contained single-file game with no external dependencies. It teaches vim motions as collectible operators over a spatial puzzle environment.

### Mechanics

Commands are picked up as glowing letters on the floor. You cannot use a command until you find it.

**Movement**

| Key | Motion |
|-----|--------|
| `h j k l` | left, down, up, right |
| `w` | jump to next word start (horizontal) |
| `e` | jump to word end |
| `b` | jump back one word |
| `W E B` | vertical analogues of w, e, b |
| `0` | jump to line start |
| `$` | jump to line end |
| `f{char}` | leap to next occurrence of char (line of sight) |
| `t{char}` | land just before char |
| `;` | repeat last f or t |
| `2w`, `3j`, `4W` | count prefix repeats any motion |

**Terrain**

| Symbol | Behavior |
|--------|----------|
| `#` | wall — impassable |
| `o` | boulder — blocks walking; jumps pass over |
| `*` | fragile — disappears on contact or when a jump crosses it |
| `=` | toggle — alternates passable/blocked on each visit |
| `R` | register tile — saves position on contact |
| `>` | exit |

**Operators**

| Key | Effect |
|-----|--------|
| `.` | repeat last action |
| `v` | visual mode — mark anchor, next motion clears the region |
| `m{a}` | save position to named register a |
| `'{a}` | warp to named register a |
| `g` | warp to legacy register (from R tile) |

**Jump path destruction** — jumps (`w`, `e`, `f`, etc.) destroy any fragile tiles they pass through, not just where they land. A careless long jump can make a level unsolvable.

### Level progression

Levels 1–6 introduce individual commands. Levels 7–12 introduce composition: counted motion, register + fragile interaction, visual mode, path-destructive jumps, named registers, toggle terrain. From level 11 onward, levels are designed so that removing any one mechanic makes them unsolvable — not harder, unsatisfiable.

---

## Design notes

The system is grounded in a specific idea: vim's motion algebra is a small formal language, and its semantics can be embedded in spatial geometry. A word boundary is a physical barrier. A jump is an operator over a discrete manifold. Deletion is demolition.

This means levels are not puzzles in the conventional sense. They are constraint systems. The player is not finding a path — they are discovering which sequence of operators produces a valid state trajectory from start to exit.

The intended continuation is levels that encode their own solution as spatial text — maps where the floor literally reads the required command sequence, and executing it is the only way through.

---

## Status

Active development. The 2D game is [playable](https://standardgalactic.github.io/icepick/icepick-2d-v5.html). The 3D engine navigates but is [early](https://standardgalactic.github.io/icepick/) — FP rendering, mode switching, and vim operators work; mobile input and live round-trip editing are not yet implemented.

