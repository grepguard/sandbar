import Docker from "dockerode";

export async function createDockerClient() {
  const docker = new Docker();

  await assertDockerIsAvailable(docker);

  return docker;
}

export async function assertDockerIsAvailable(docker) {
  try {
    await docker.ping();
  } catch (error) {
    throw new Error(`Docker is not available or not running: ${error.message}`);
  }
}
