import { spawn } from "node:child_process";
import { Writable } from "node:stream";

export async function runInContainer(docker, containerId, options) {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: options.command,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    WorkingDir: options.workingDir,
    User: options.user,
    Env: options.env,
  });
  const stream = await exec.start({ Tty: true });

  docker.modem.demuxStream(stream, process.stdout, process.stderr);
  await waitForStream(stream);

  const result = await exec.inspect();
  return result.ExitCode;
}

export async function captureInContainer(docker, containerId, options) {
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
  const stream = await exec.start({ Tty: false });
  const stdout = [];
  const stderr = [];

  docker.modem.demuxStream(
    stream,
    collectChunks(stdout),
    collectChunks(stderr),
  );
  await waitForStream(stream);

  const result = await exec.inspect();

  return {
    exitCode: result.ExitCode,
    stdout: Buffer.concat(stdout),
    stderr: Buffer.concat(stderr).toString("utf-8"),
  };
}

export async function openShell(_docker, containerId, { workingDir }) {
  const exitCode = await runInteractiveProcess("docker", [
    "exec",
    "-it",
    "-w",
    workingDir,
    containerId,
    "bash",
  ]);

  if (exitCode !== 0) throw new Error(`Shell exited with code ${exitCode}`);
}

function runInteractiveProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited from signal ${signal}`));
        return;
      }

      resolve(code ?? 0);
    });
  });
}

function collectChunks(chunks) {
  return new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    },
  });
}

function waitForStream(stream) {
  return new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });
}
