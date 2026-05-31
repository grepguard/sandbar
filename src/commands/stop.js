import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";

export async function stop(name) {
  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    console.log(`Sandbar container is already stopped: ${name}`);
    return;
  }

  const container = docker.getContainer(containerInfo.Id);
  await container.stop();

  console.log(`Stopped sandbar container: ${name}`);
}
