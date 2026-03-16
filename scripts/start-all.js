const { spawn } = require("node:child_process");

const isWindows = process.platform === "win32";
const children = [];
let isShuttingDown = false;

function startProcess(name, command, cwd) {
  const child = spawn(command, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code, signal) => {
    if (!isShuttingDown) {
      isShuttingDown = true;
      shutdown(signal ? 0 : code ?? 1);
    }
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start:`, error);
    if (!isShuttingDown) {
      isShuttingDown = true;
      shutdown(1);
    }
  });

  children.push(child);
}

function shutdown(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(isWindows ? undefined : "SIGINT");
    }
  }

  setTimeout(() => process.exit(exitCode), 300);
}

process.on("SIGINT", () => {
  if (!isShuttingDown) {
    isShuttingDown = true;
    shutdown(0);
  }
});

process.on("SIGTERM", () => {
  if (!isShuttingDown) {
    isShuttingDown = true;
    shutdown(0);
  }
});

startProcess("backend", "npm --prefix backend start", process.cwd());
startProcess("frontend", "npm --prefix frontend run dev", process.cwd());
