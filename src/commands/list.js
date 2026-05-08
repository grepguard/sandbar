import Docker from "dockerode";

const PROJECT_LABEL = "sandbar.project";

export async function list() {
  const docker = new Docker();

  const containers = await docker.listContainers({
    filters: {
      label: ["sandbar.managed=true"],
      status: ["running"],
    },
  });

  if (containers.length === 0) {
    console.log("No running sandbar containers found.");
    return;
  }

  console.log(`${"NAME".padEnd(32)}  PROJECT`);

  for (const container of containers) {
    const name = truncate(container.Names[0].slice(1), 32).padEnd(32);
    const project = container.Labels?.[PROJECT_LABEL] ?? "-";

    console.log(`${name}  ${project}`);
  }
}

function truncate(value, length) {
  return value.length > length ? `${value.slice(0, length - 3)}...` : value;
}
