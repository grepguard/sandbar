export async function runInContainer(docker, containerId, options) {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: options.command,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    WorkingDir: options.workingDir,
    User: options.user,
    Env: options.env,
  });
  const stream = await exec.start({});

  docker.modem.demuxStream(stream, process.stdout, process.stderr);
  await waitForStream(stream);

  const result = await exec.inspect();
  return result.ExitCode;
}

export async function openShell(docker, containerId, { workingDir }) {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: ["bash"],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    WorkingDir: workingDir,
  });
  const stream = await exec.start({
    hijack: true,
    stdin: true,
  });

  const wasRaw = process.stdin.isRaw;

  try {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();
    process.stdin.pipe(stream);
    stream.pipe(process.stdout);

    await waitForStream(stream);
  } finally {
    process.stdin.unpipe(stream);

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(wasRaw);
    }
  }

  const result = await exec.inspect();

  if (result.ExitCode !== 0) {
    throw new Error(`Shell exited with code ${result.ExitCode}`);
  }
}

function waitForStream(stream) {
  return new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });
}
