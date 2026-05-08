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

  const names = containers.map((container) => container.Names[0].slice(1));
  const nameWidth = Math.max(
    "NAME".length,
    ...names.map((name) => name.length),
  );

  console.log(`${"NAME".padEnd(nameWidth)}  PROJECT`);

  for (const [index, container] of containers.entries()) {
    const name = names[index].padEnd(nameWidth);
    const project = container.Labels?.[PROJECT_LABEL] ?? "-";

    console.log(`${name}  ${project}`);
  }
}
