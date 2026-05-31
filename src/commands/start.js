import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";

export async function start(name) {
  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State === "running") {
    console.log(`Sandbar container is already running: ${name}`);
    return;
  }

  const container = docker.getContainer(containerInfo.Id);
  await container.start();

  console.log(`Started sandbar container: ${name}`);
}
