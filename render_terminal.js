export function renderTerminal(ctx, state) {
  const { currentNode } = state;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = "#00ff88";
  ctx.font = "14px monospace";

  let y = 20;

  ctx.fillText("DIR: " + state.path.join("/"), 20, y);
  y += 20;

  for (let dir in currentNode.children) {
    ctx.fillText("[D] " + dir, 20, y);
    y += 18;
  }

  for (let file of currentNode.files) {
    ctx.fillText("[F] " + file.name, 20, y);
    y += 18;
  }
}
