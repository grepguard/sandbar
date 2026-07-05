import path from "node:path";
import { createDockerClient } from "../lib/docker.js";
import {
  copyWorkspaceToContainer,
  describeWorkspace,
  resolveWorkspace,
} from "../lib/workspace.js";

const DEFAULT_IMAGE = "ubuntu:26.04";
const DEFAULT_COMMAND = ["sleep", "infinity"];

export async function create(options = {}) {
  const cwd = process.cwd();
  const image = options.image ?? DEFAULT_IMAGE;
  const containerName = options.name ?? createContainerName(path.basename(cwd));
  const workspace = resolveWorkspace(cwd, options);
  const docker = await createDockerClient();

  await ensureImageExists(docker, image);

  console.log(`Creating sandbar sandbox: ${containerName}`);
  describeWorkspace(workspace).forEach((line) => {
    console.log(line);
  });

  const container = await docker.createContainer({
    Image: image,
    Cmd: DEFAULT_COMMAND,
    name: containerName,
    WorkingDir: workspace.target,
    Labels: {
      "sandbar.managed": "true",
      "sandbar.mountMode": workspace.mode,
    },
    HostConfig: workspace.hostConfig,
  });

  await container.start();
  await copyWorkspaceToContainer(container, workspace);

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
