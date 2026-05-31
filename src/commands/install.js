import { AGENTS, listInstallableAgents } from "../agents/index.js";
import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";
import { runInContainer } from "../lib/exec.js";

export async function install(name, options) {
  const agent = options?.agent;
  if (!agent) throw new Error("Missing required option: --agent");
  if (!name) throw new Error("Missing required argument: <name>");

  const installer = AGENTS[agent]?.installer;
  if (!installer) {
    const available = listInstallableAgents().join(", ");
    throw new Error(`Unknown agent: ${agent}. Available: ${available}`);
  }

  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  console.log(`Installing agent '${agent}' in container: ${name}`);
  console.log(`Installer: ${installer.description}`);

  const exitCode = await runInContainer(docker, containerInfo.Id, {
    command: ["bash", "-lc", installer.script],
    workingDir: "/",
    user: "root",
  });

  if (exitCode !== 0) {
    throw new Error(`Install failed with exit code ${exitCode}`);
  }
}
