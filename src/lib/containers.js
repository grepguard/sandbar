const MANAGED_LABEL = "sandbar.managed";
const DEFAULT_WORKING_DIR = "/workspace";

export async function findManagedContainer(docker, name) {
  const containers = await listManagedContainers(docker, {
    all: true,
    name,
  });

  const containerInfo = containers[0];

  if (!containerInfo) {
    throw new Error(`No sandbar container found: ${name}`);
  }

  return containerInfo;
}

export function listManagedContainers(docker, options = {}) {
  const filters = {
    label: [`${MANAGED_LABEL}=true`],
  };

  if (options.name) {
    filters.name = [`^/${escapeRegExp(options.name)}$`];
  }

  if (options.status) {
    filters.status = [options.status];
  }

  return docker.listContainers({
    all: options.all ?? false,
    filters,
  });
}

export async function findContainerWorkingDir(docker, containerId) {
  const container = docker.getContainer(containerId);
  const details = await container.inspect();

  return details.Config?.WorkingDir || DEFAULT_WORKING_DIR;
}

function escapeRegExp(value) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
