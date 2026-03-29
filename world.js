export function buildWorld(files) {
  const root = { name: "/", children: {}, files: [] };

  for (let file of files) {
    const parts = file.path.replace("./", "").split("/");
    let node = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      if (!node.children[dir]) {
        node.children[dir] = { name: dir, children: {}, files: [] };
      }
      node = node.children[dir];
    }

    node.files.push({
      name: parts[parts.length - 1],
      content: file.content
    });
  }

  return root;
}
