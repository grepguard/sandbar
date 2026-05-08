import Docker from "dockerode";

export async function kill(name) {
  const docker = new Docker();
  const containers = await docker.listContainers({
    all: true,
    filters: {
      label: ["sandbar.managed=true"],
      name: [`^/${name}$`],
    },
  });

  const containerInfo = containers[0];

  if (!containerInfo) {
    throw new Error(`No sandbar container found: ${name}`);
  }

  const container = docker.getContainer(containerInfo.Id);

  if (containerInfo.State === "running") {
    await container.stop();
  }

  await container.remove();

  console.log(`Killed sandbar container: ${name}`);
}
