import { spawn } from "node:child_process";
import path from "node:path";

const DEFAULT_WORKSPACE = ".";
const DEFAULT_MOUNT_TARGET = "/workspace";
const DEFAULT_MOUNT_MODE = "isolated";
const EMPTY_MOUNT_MODE = "empty";
const MOUNT_MODES = new Set(["bind", "isolated"]);

export function resolveWorkspace(cwd, options = {}) {
  const target = options.mountTarget ?? DEFAULT_MOUNT_TARGET;

  if (options.emptyWorkspace) {
    return {
      mode: EMPTY_MOUNT_MODE,
      source: null,
      target,
      hostConfig: {},
    };
  }

  const mode = options.mountMode ?? DEFAULT_MOUNT_MODE;

  if (!MOUNT_MODES.has(mode)) {
    throw new Error(
      `Invalid mount mode: ${mode}. Expected one of: ${[...MOUNT_MODES].join(", ")}`,
    );
  }

  const source = path.resolve(cwd, options.workspace ?? DEFAULT_WORKSPACE);

  return {
    mode,
    source,
    target,
    hostConfig: mode === "bind" ? createBindHostConfig(source, target) : {},
  };
}

export function describeWorkspace(workspace) {
  if (workspace.mode === EMPTY_MOUNT_MODE) {
    return [
      `Mount mode: ${workspace.mode}`,
      `Workspace: empty at ${workspace.target}`,
    ];
  }

  const action = workspace.mode === "bind" ? "Mount" : "Copy";

  return [
    `Mount mode: ${workspace.mode}`,
    `${action}: ${workspace.source} -> ${workspace.target}`,
  ];
}

export async function copyWorkspaceToContainer(container, workspace) {
  if (workspace.mode !== "isolated") return;

  console.log("Copying workspace into isolated container...");

  const tar = spawn("tar", [
    "-C",
    workspace.source,
    "--no-xattrs",
    "--no-fflags",
    "--no-acls",
    "-cf",
    "-",
    ".",
  ]);

  await Promise.all([
    container.putArchive(tar.stdout, { path: workspace.target }),
    waitForTar(tar),
  ]);
}

function createBindHostConfig(source, target) {
  return {
    Mounts: [
      {
        Type: "bind",
        Source: source,
        Target: target,
      },
    ],
  };
}

function waitForTar(tar) {
  let stderr = "";

  tar.stderr.setEncoding("utf8");
  tar.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  return new Promise((resolve, reject) => {
    tar.on("error", reject);
    tar.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Failed to archive workspace: ${stderr.trim()}`));
    });
  });
}
