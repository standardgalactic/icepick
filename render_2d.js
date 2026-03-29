export function render2D(ctx, state) {
  const { currentNode } = state;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const tileSize = 32;

  let i = 0;

  for (let dir in currentNode.children) {
    const x = (i % 10) * tileSize;
    const y = Math.floor(i / 10) * tileSize;

    ctx.fillStyle = "#ffaa00"; // amber directories
    ctx.fillRect(x, y, tileSize - 2, tileSize - 2);

    i++;
  }

  for (let file of currentNode.files) {
    const x = (i % 10) * tileSize;
    const y = Math.floor(i / 10) * tileSize;

    ctx.fillStyle = "#00ff88"; // green files
    ctx.fillRect(x, y, tileSize - 2, tileSize - 2);

    i++;
  }
}
