import Docker from "dockerode";

export async function start(name) {
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

  if (containerInfo.State === "running") {
    console.log(`Sandbar container is already running: ${name}`);
    return;
  }

  const container = docker.getContainer(containerInfo.Id);
  await container.start();

  console.log(`Started sandbar container: ${name}`);
}
