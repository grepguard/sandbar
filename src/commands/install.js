import Docker from "dockerode";

const MANAGED_LABEL = "sandbar.managed";

const INSTALLERS = {
  opencode: {
    description: "Install opencode and expose it on PATH",
    script: [
      "set -euo pipefail",
      "apt-get update",
      "apt-get -y upgrade",
      "apt-get install -y curl ca-certificates",
      "curl -fsSL https://opencode.ai/install | bash",
      "ln -sf /root/.opencode/bin/opencode /usr/local/bin/opencode",
      "opencode --version",
    ].join("\n"),
  },
};

export async function install(agent, name) {
  if (!agent) throw new Error("Missing required argument: <agent>");
  if (!name) throw new Error("Missing required argument: <name>");

  const installer = INSTALLERS[agent];
  if (!installer) {
    const available = Object.keys(INSTALLERS).sort().join(", ");
    throw new Error(`Unknown agent: ${agent}. Available: ${available}`);
  }

  const docker = new Docker();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  console.log(`Installing agent '${agent}' in container: ${name}`);
  console.log(`Installer: ${installer.description}`);

  const exitCode = await runScriptInContainer(docker, containerInfo.Id, {
    script: installer.script,
    workingDir: "/",
  });

  if (exitCode !== 0) {
    throw new Error(`Install failed with exit code ${exitCode}`);
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

async function runScriptInContainer(
  docker,
  containerId,
  { script, workingDir },
) {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: ["bash", "-lc", script],
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    WorkingDir: workingDir,
    User: "root",
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
