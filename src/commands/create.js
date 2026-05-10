import path from "node:path";
import Docker from "dockerode";
import { readConfig } from "../lib/config.js";

const DEFAULT_IMAGE = "ubuntu:24.04";
const DEFAULT_COMMAND = ["sleep", "infinity"];

export async function create(options = {}) {
  const cwd = process.cwd();
  const config = await readConfig(cwd);
  const image = config.image ?? DEFAULT_IMAGE;
  const containerName = options.name ?? createContainerName(path.basename(cwd));
  const workspacePath = path.resolve(cwd, config.workspace ?? ".");
  const mountTarget = config.mountTarget ?? "/workspace";
  const command = config.command ?? DEFAULT_COMMAND;
  const docker = new Docker();

  await assertDockerIsAvailable(docker);

  console.log(`Creating sandbar sandbox: ${containerName}`);
  console.log(`Image: ${image}`);
  console.log(`Mount: ${workspacePath} -> ${mountTarget}`);

  const container = await docker.createContainer({
    Image: image,
    Cmd: command,
    name: containerName,
    WorkingDir: mountTarget,
    Labels: {
      "sandbar.managed": "true",
      "sandbar.project": path.basename(cwd),
    },
    HostConfig: {
      Mounts: [
        {
          Type: "bind",
          Source: workspacePath,
          Target: mountTarget,
        },
      ],
    },
  });

  await container.start();

  console.log(`Created: ${container.id}`);
  console.log(`Open a shell: docker exec -it ${containerName} bash`);
}

async function assertDockerIsAvailable(docker) {
  try {
    await docker.ping();
  } catch (error) {
    throw new Error(`Docker is not available or not running: ${error.message}`);
  }
}

function createContainerName(projectName) {
  const safeProjectName = projectName
    .toLowerCase()
    .replaceAll(/[^a-z0-9_.-]/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  const timestamp = new Date().toISOString().replaceAll(/[-:.TZ]/g, "");

  return `sandbar-${safeProjectName || "project"}-${timestamp}`;
}
