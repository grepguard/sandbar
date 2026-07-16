import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";

const PROVIDERS = {
  openai: {
    hostPath: path.join(os.homedir(), ".codex", "auth.json"),
    containerDir: "/root/.codex",
    containerFile: "/root/.codex/auth.json",
  },
};

export async function auth(name, options = {}) {
  const provider = options.provider ?? "openai";
  const config = PROVIDERS[provider];

  if (!config) {
    const available = Object.keys(PROVIDERS).join(", ");
    throw new Error(
      `Unknown provider: ${provider}. Available providers: ${available}`,
    );
  }

  try {
    await access(config.hostPath);
  } catch {
    throw new Error(
      `Auth file not found: ${config.hostPath}\n` +
        `Please log in with the provider CLI first (e.g. codex auth)`,
    );
  }

  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  const container = docker.getContainer(containerInfo.Id);

  console.log(`Copying ${provider} auth into container: ${name}`);

  const tar = spawn("tar", [
    "-C",
    path.dirname(config.hostPath),
    "--no-xattrs",
    "--no-acls",
    "-cf",
    "-",
    path.basename(config.hostPath),
  ]);

  await Promise.all([
    container.putArchive(tar.stdout, { path: config.containerDir }),
    waitForTar(tar),
  ]);

  console.log(`  Host:      ${config.hostPath}`);
  console.log(`  Container: ${config.containerFile}`);
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

      reject(new Error(`Failed to archive auth file: ${stderr.trim()}`));
    });
  });
}
