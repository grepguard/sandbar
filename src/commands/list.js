import Docker from "dockerode";

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

  console.log(`NUMBER  ${"NAME".padEnd(nameWidth)}`);

  for (const index of containers.keys()) {
    const name = names[index].padEnd(nameWidth);

    console.log(`${index}       ${name}`);
  }
}
