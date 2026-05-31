import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";

export async function kill(name) {
  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  const container = docker.getContainer(containerInfo.Id);

  if (containerInfo.State === "running") {
    await container.stop();
  }

  await container.remove();

  console.log(`Killed sandbar container: ${name}`);
}
