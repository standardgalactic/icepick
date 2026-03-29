import { parseIcepick } from "./parser.js";
import { buildWorld } from "./world.js";
import { renderTerminal } from "./render_terminal.js";
import { render2D } from "./render_2d.js";
import { renderFP } from "./render_fp.js";
import { handleVimInput } from "./vim.js";

console.log("MAIN.JS LOADED");

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

resize();
window.addEventListener("resize", resize);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

let state = {
  mode: "fp",
  world: null,
  currentNode: null,
  path: [],
  player: {
    x: 5,
    y: 5,
    angle: 0
  },
  insideFile: null,
  geometry: {
    removedLines: new Set()
  },
  history: [],
  vim: {
    registers: {},
    pending: null
  },
  spawned: []
};

console.log("INITIAL MODE:", state.mode);

fetch("icepick_snapshot.txt")
  .then(r => r.text())
  .then(text => {
    console.log("SNAPSHOT LOADED:", text.length);

    const files = parseIcepick(text);
    state.world = buildWorld(files);
    state.currentNode = state.world;

    console.log("FILES FOUND:", state.currentNode.files);

    if (state.currentNode.files.length > 0) {
      enterFile(state.currentNode.files[0]);
    }

    loop();
  })
  .catch(err => {
    console.error("FAILED TO LOAD SNAPSHOT:", err);
  });

function loop() {
  updateHUD();

  if (state.mode === "terminal") {
    renderTerminal(ctx, state);
  } else if (state.mode === "2d") {
    render2D(ctx, state);
  } else {
    renderFP(ctx, state);
  }

  requestAnimationFrame(loop);
}

function updateHUD() {
  const modeEl = document.getElementById("mode");
  const pathEl = document.getElementById("path");

  if (modeEl) {
    modeEl.textContent = "MODE: " + state.mode.toUpperCase();
  }

  if (pathEl) {
    pathEl.textContent = state.path.join(" / ");
  }
}

window.addEventListener("keydown", e => {
  const p = state.player;

  if (e.key === "Tab") {
    e.preventDefault();

    if (state.mode === "fp") state.mode = "2d";
    else if (state.mode === "2d") state.mode = "terminal";
    else state.mode = "fp";

    return;
  }

  if (state.mode === "fp") {
    if (e.key === "w") tryMove(p, +0.25);
    if (e.key === "s") tryMove(p, -0.25);

    if (e.key === "a") p.angle -= 0.1;
    if (e.key === "d") p.angle += 0.1;

    if (e.key === "Enter") {
      tryEnterObject();
      return;
    }

    if (e.key === "Backspace") {
      exitFile();
      return;
    }

    if (state.insideFile) {
      handleVimInput(e.key, state);
    }
  }
});

function tryMove(player, amount) {
  const nx = player.x + Math.cos(player.angle) * amount;
  const ny = player.y + Math.sin(player.angle) * amount;

  if (!isWall(nx, ny)) {
    player.x = nx;
    player.y = ny;
  }
}

function isWall(x, y) {
  const node = state.currentNode;

  if (x < 0 || y < 0 || x > 10 || y > 10) return true;

  let i = 0;

  for (const dir in node.children) {
    const px = (i % 5) * 2 + 1;
    const py = Math.floor(i / 5) * 2 + 1;

    if (Math.hypot(x - px, y - py) < 0.4) return true;
    i++;
  }

  for (const file of node.files) {
    const px = (i % 5) * 2 + 1;
    const py = Math.floor(i / 5) * 2 + 1;

    if (Math.hypot(x - px, y - py) < 0.25) return true;
    i++;
  }

  return false;
}

function tryEnterObject() {
  const node = state.currentNode;
  const p = state.player;

  let i = 0;

  for (const name in node.children) {
    const px = (i % 5) * 2 + 1;
    const py = Math.floor(i / 5) * 2 + 1;

    if (Math.hypot(p.x - px, p.y - py) < 0.6) {
      state.currentNode = node.children[name];
      state.path.push(name);
      resetPlayer();
      return;
    }

    i++;
  }

  for (const file of node.files) {
    const px = (i % 5) * 2 + 1;
    const py = Math.floor(i / 5) * 2 + 1;

    if (Math.hypot(p.x - px, p.y - py) < 0.6) {
      enterFile(file);
      return;
    }

    i++;
  }
}

function enterFile(file) {
  console.log("ENTER FILE:", file.name);

  state.insideFile = file;
  state.geometry.removedLines.clear();
  state.spawned = [];

  state.currentNode = {
    children: {},
    files: file.content.map((line, i) => ({
      name: "line_" + i,
      content: [line]
    }))
  };

  state.path.push(file.name);
  resetPlayer();
}

function exitFile() {
  if (state.path.length === 0) return;

  state.path.pop();

  let node = state.world;
  for (const p of state.path) {
    node = node.children?.[p] || node;
  }

  state.currentNode = node;
  state.insideFile = null;

  resetPlayer();
}

function resetPlayer() {
  state.player.x = 5;
  state.player.y = 5;
  state.player.angle = 0;
}