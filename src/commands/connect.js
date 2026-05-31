import { readFile } from "node:fs/promises";
import { AGENTS, listRunnableAgents } from "../agents/index.js";
import {
  findContainerWorkingDir,
  findManagedContainer,
} from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";
import { openShell, runInContainer } from "../lib/exec.js";

export async function connect(name, options = {}) {
  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  const workingDir = await findContainerWorkingDir(docker, containerInfo.Id);

  if (!options.agent) {
    return openShell(docker, containerInfo.Id, { workingDir });
  }

  if (options.file) {
    const content = await readFile(options.file, "utf-8");
    options.prompt = [content.trim()];
  }

  const command = resolveCommand(options);

  console.log(`Connecting to sandbar container: ${name}`);
  console.log(`Working directory: ${workingDir}`);
  console.log(`Command: ${command.join(" ")}`);

  const exitCode = await runInContainer(docker, containerInfo.Id, {
    command,
    workingDir,
  });

  if (exitCode !== 0) {
    throw new Error(`Command failed with exit code ${exitCode}`);
  }
}

function resolveCommand(options) {
  if (!options.agent) {
    throw new Error("Missing required option: --agent <agent>");
  }

  const prompt = normalizePrompt(options.prompt);

  if (!prompt) {
    throw new Error("Missing required option: --prompt <prompt>");
  }

  const agentCommand = AGENTS[options.agent]?.runCommand;

  if (!agentCommand) {
    const availableAgents = listRunnableAgents().join(", ");

    throw new Error(
      `Unknown agent: ${options.agent}. Available agents: ${availableAgents}`,
    );
  }

  if (!Array.isArray(agentCommand) || agentCommand.length === 0) {
    throw new Error(`Invalid agent command for: ${options.agent}`);
  }

  return [...agentCommand, prompt];
}

function normalizePrompt(prompt) {
  if (Array.isArray(prompt)) {
    return prompt.join(" ").trim();
  }

  return (prompt ?? "").trim();
}
