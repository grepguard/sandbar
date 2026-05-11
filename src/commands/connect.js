import { readFile } from "node:fs/promises";
import Docker from "dockerode";
import { readConfig } from "../lib/config.js";

const MANAGED_LABEL = "sandbar.managed";
const DEFAULT_WORKING_DIR = "/workspace";
const DEFAULT_AGENTS = {
  opencode: ["opencode", "run"],
};

export async function connect(name, options = {}) {
  const docker = new Docker();
  const config = await readConfig();
  const workingDir = config.mountTarget ?? DEFAULT_WORKING_DIR;

  if (options.file) {
    const content = await readFile(options.file, "utf-8");
    options.prompt = [content.trim()];
  }

  const command = resolveCommand(config, options);
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

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

async function findManagedContainer(docker, name) {
  const containers = await docker.listContainers({
    all: true,
    filters: {
      label: [`${MANAGED_LABEL}=true`],
      name: [`^/${name}$`],
    },
  });

  const containerInfo = containers[0];

  if (!containerInfo) {
    throw new Error(`No sandbar container found: ${name}`);
  }

  return containerInfo;
}

function resolveCommand(config, options) {
  if (!options.agent) {
    throw new Error("Missing required option: --agent <agent>");
  }

  const prompt = normalizePrompt(options.prompt);

  if (!prompt) {
    throw new Error("Missing required option: --prompt <prompt>");
  }

  const agents = {
    ...DEFAULT_AGENTS,
    ...(config.agents ?? {}),
  };
  const agentCommand = agents[options.agent];

  if (!agentCommand) {
    const availableAgents = Object.keys(agents).sort().join(", ");

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

async function runInContainer(docker, containerId, { command, workingDir }) {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: command,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    WorkingDir: workingDir,
  });
  const stream = await exec.start({});

  docker.modem.demuxStream(stream, process.stdout, process.stderr);

  await new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  const result = await exec.inspect();

  return result.ExitCode;
}
