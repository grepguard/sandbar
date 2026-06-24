import {
  findContainerWorkingDir,
  findManagedContainer,
} from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";
import { openShell } from "../lib/exec.js";

export async function connect(name) {
  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  const workingDir = await findContainerWorkingDir(docker, containerInfo.Id);

  return openShell(docker, containerInfo.Id, { workingDir });
}
