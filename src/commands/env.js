import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";
import { captureInContainer } from "../lib/exec.js";

export async function env(name, kv) {
  const eqIdx = kv.indexOf("=");
  if (eqIdx === -1) {
    throw new Error(`Invalid format: "${kv}". Use KEY=VALUE`);
  }

  const key = kv.slice(0, eqIdx);
  const value = kv.slice(eqIdx + 1);
  const line = `export ${key}=${JSON.stringify(value)}`;
  const delimiter = `SANDBAR_EOF_${Date.now().toString(36)}`;

  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  await captureInContainer(docker, containerInfo.Id, {
    command: [
      "bash",
      "-c",
      `cat >> ~/.bashrc << '${delimiter}'\n${line}\n${delimiter}`,
    ],
  });

  console.log(`Set ${key} in container: ${name}`);
}
