import { listManagedContainers } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";

export async function list() {
  const docker = await createDockerClient();
  const containers = await listManagedContainers(docker, { status: "running" });

  if (containers.length === 0) {
    console.log("No running sandbar containers found.");
    return;
  }

  const names = containers.map((container) => container.Names[0].slice(1));
  const nameWidth = Math.max(
    "NAME".length,
    ...names.map((name) => name.length),
  );

  const modes = containers.map(
    (container) => container.Labels["sandbar.mountMode"],
  );
  const modeWidth = Math.max(
    "MODE".length,
    ...modes.map((mode) => mode.length),
  );

  console.log(
    `NUMBER  ${"NAME".padEnd(nameWidth)}  ${"MODE".padEnd(modeWidth)}`,
  );

  for (const index of containers.keys()) {
    const name = names[index].padEnd(nameWidth);
    const mode = modes[index].padEnd(modeWidth);

    console.log(`${index}       ${name}  ${mode}`);
  }
}
