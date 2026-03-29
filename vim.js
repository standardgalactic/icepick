export function handleVimInput(key, state) {
  const vim = state.vim;

  // ===== repeat =====
  if (key === ".") {
    if (state.lastCommand) {
      state.lastCommand(state);
    }
    return;
  }

  // ===== operator pending =====
  if (key === "d") {
    if (vim.pending === "d") {
      execute(state, dd);
      vim.pending = null;
    } else {
      vim.pending = "d";
    }
    return;
  }

  if (key === "y") {
    if (vim.pending === "y") {
      execute(state, yw);
      vim.pending = null;
    } else {
      vim.pending = "y";
    }
    return;
  }

  // ===== paste =====
  if (key === "p") {
    execute(state, paste);
    return;
  }

  // ===== undo =====
  if (key === "u") {
    undo(state);
    return;
  }

  // ===== movement inside file =====
  if (key === "h") state.player.x -= 0.3;
  if (key === "l") state.player.x += 0.3;
  if (key === "k") state.player.y -= 0.3;
  if (key === "j") state.player.y += 0.3;
}

//
// ===== COMMAND EXECUTION =====
//

function execute(state, fn) {
  fn(state);
  state.lastCommand = fn;
}

//
// ===== COMMANDS =====
//

function dd(state) {
  if (!state.insideFile) return;

  const line = Math.floor(state.player.y);

  const change = {
    line,
    apply(s) {
      s.geometry.removedLines.add(line);
    },
    revert(s) {
      s.geometry.removedLines.delete(line);
    }
  };

  applyChange(state, change);
}

function yw(state) {
  if (!state.insideFile) return;

  const line = Math.floor(state.player.y);
  const text = state.insideFile.content[line] || "";

  const word = text.trim().split(/\s+/)[0] || "";

  state.vim.registers["0"] = word;
}

function paste(state) {
  const word = state.vim.registers["0"];
  if (!word) return;

  const line = Math.floor(state.player.y);

  const change = {
    line,
    word,
    apply(s) {
      s.spawned ||= [];
      s.spawned.push({
        line,
        word,
        offset: Math.random() * 2
      });
    },
    revert(s) {
      s.spawned = s.spawned.filter(o => o.line !== line);
    }
  };

  applyChange(state, change);
}

//
// ===== HISTORY =====
//

function applyChange(state, change) {
  change.apply(state);
  state.history.push(change);
}

function undo(state) {
  const change = state.history.pop();
  if (!change) return;

  change.revert(state);
}