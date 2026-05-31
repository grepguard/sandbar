import path from "node:path";
import { createDockerClient } from "../lib/docker.js";

const DEFAULT_IMAGE = "ubuntu:26.04";
const DEFAULT_COMMAND = ["sleep", "infinity"];
const DEFAULT_WORKSPACE = ".";
const DEFAULT_MOUNT_TARGET = "/workspace";

export async function create(options = {}) {
  const cwd = process.cwd();
  const image = DEFAULT_IMAGE;
  const containerName = options.name ?? createContainerName(path.basename(cwd));
  const workspacePath = path.resolve(
    cwd,
    options.workspace ?? DEFAULT_WORKSPACE,
  );
  const mountTarget = options.mountTarget ?? DEFAULT_MOUNT_TARGET;
  const docker = await createDockerClient();

  await ensureImageExists(docker, image);

  console.log(`Creating sandbar sandbox: ${containerName}`);
  console.log(`Mount: ${workspacePath} -> ${mountTarget}`);

  const container = await docker.createContainer({
    Image: image,
    Cmd: DEFAULT_COMMAND,
    name: containerName,
    WorkingDir: mountTarget,
    Labels: {
      "sandbar.managed": "true",
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
  console.log(`Open a shell: sandbar connect ${containerName}`);
}

async function ensureImageExists(docker, image) {
  try {
    const img = docker.getImage(image);
    await img.inspect();
  } catch {
    console.log(`Image ${image} not found locally. Pulling...`);
    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err, output) => {
          if (err) return reject(err);
          resolve(output);
        });
      });
    });
    console.log(`Successfully pulled ${image}`);
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
