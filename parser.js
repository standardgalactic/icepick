export function parseIcepick(text) {
  const files = [];
  const lines = text.split("\n");

  let current = null;

  for (let line of lines) {
    if (line.startsWith("----- FILE:")) {
      current = {
        path: line.replace("----- FILE:", "").replace("-----", "").trim(),
        content: []
      };
    } else if (line.startsWith("----- END FILE:")) {
      files.push(current);
      current = null;
    } else if (current) {
      current.content.push(line);
    }
  }

  return files;
}
