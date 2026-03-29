// renderer_fp.js

export function renderFP(ctx, state) {
  const { currentNode, player, insideFile } = state;

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // clear
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, W, H);

  const fov = Math.PI / 3;
  const rays = W;

  for (let x = 0; x < rays; x++) {
    const rayAngle =
      player.angle - fov / 2 + (x / rays) * fov;

    let dist;

    if (insideFile) {
      dist = castRayFile(player, rayAngle, insideFile, state);
    } else {
      dist = castRayWorld(player, rayAngle, currentNode);
    }

    // fisheye correction
    dist *= Math.cos(rayAngle - player.angle);

    const wallHeight = Math.min(H, H / (dist + 0.0001));

    // ===== COLOR SYSTEM =====
    let shade = Math.max(0, 255 - dist * 40);

    let r = Math.max(0, (dist - 5) * 40);
    let g = shade;
    let b = shade * 0.25;

    if (dist > 8 && dist < 12) {
      b += 40;
    }

    ctx.fillStyle = `rgb(${r},${g},${b})`;

    ctx.fillRect(
      x,
      (H - wallHeight) / 2,
      1,
      wallHeight
    );
  }

  // overlay text geometry if inside file
  if (insideFile) {
    drawFileText(ctx, state);
  }
}

//
// =====================
// WORLD RAYCASTING
// =====================
//

function castRayWorld(player, angle, node) {
  const maxDist = 20;
  const step = 0.02;

  let x = player.x;
  let y = player.y;

  for (let d = 0; d < maxDist; d += step) {
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;

    if (isWallWorld(x, y, node)) {
      return d;
    }
  }

  return maxDist;
}

function isWallWorld(x, y, node) {
  if (x < 0 || y < 0 || x > 10 || y > 10) return true;

  let i = 0;

  for (let dir in node.children) {
    const px = (i % 5) * 2 + 1;
    const py = Math.floor(i / 5) * 2 + 1;

    if (Math.hypot(x - px, y - py) < 0.4) return true;
    i++;
  }

  for (let file of node.files) {
    const px = (i % 5) * 2 + 1;
    const py = Math.floor(i / 5) * 2 + 1;

    if (Math.hypot(x - px, y - py) < 0.25) return true;
    i++;
  }

  return false;
}

//
// =====================
// FILE RAYCASTING
// =====================
//

function castRayFile(player, angle, file, state) {
  const maxDist = 30;
  const step = 0.03;

  let x = player.x;
  let y = player.y;

  for (let d = 0; d < maxDist; d += step) {
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;

    if (isWallFile(x, y, file, state)) {
      return d;
    }
  }

  return maxDist;
}

function isWallFile(x, y, file, state) {
  // corridor bounds
  if (x < 0 || x > 20) return true;

  const lineIndex = Math.floor(y);

  // ===== NEW: DELETION EFFECT =====
  if (state.geometry.removedLines.has(lineIndex)) {
    return false; // deleted = open space
  }

  if (lineIndex < 0 || lineIndex >= file.content.length) {
    return true;
  }

  const line = file.content[lineIndex] || "";

  const indent = (line.match(/^\s*/) || [""])[0].length * 0.1;

  if (x < indent) return true;

  const maxWidth = 5 + line.length * 0.05;

  if (x > maxWidth) return true;

  return false;
}

//
// =====================
// TEXT RENDERING
// =====================
//

function drawFileText(ctx, state) {
  const { player, insideFile } = state;

  ctx.font = "14px monospace";

  for (let i = 0; i < insideFile.content.length; i++) {

    // ===== NEW: skip deleted lines =====
    if (state.geometry.removedLines.has(i)) continue;

    const line = insideFile.content[i];

    const dx = 2 - player.x;
    const dy = i - player.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.5 || dist > 20) continue;

    const scale = 200 / dist;

    const screenX =
      ctx.canvas.width / 2 +
      (dx / dist) * scale * 2;

    const screenY =
      ctx.canvas.height / 2 -
      (dy / dist) * scale * 0.5;

    const alpha = Math.max(0, 1 - dist / 20);

    let r = 0;
    let g = 255;
    let b = 120;

    if (dist > 5 && dist < 10) {
      r = 180;
      g = 200;
      b = 60;
    }

    if (dist > 12) {
      r = 200;
      g = 50;
      b = 50;
    }

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.globalAlpha = alpha;

    ctx.fillText(line.slice(0, 120), screenX, screenY);
  }

  ctx.globalAlpha = 1;
}