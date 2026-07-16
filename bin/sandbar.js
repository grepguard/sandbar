#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { auth } from "../src/commands/auth.js";
import { connect } from "../src/commands/connect.js";
import { create } from "../src/commands/create.js";
import { env } from "../src/commands/env.js";
import { install } from "../src/commands/install.js";
import { kill } from "../src/commands/kill.js";
import { list } from "../src/commands/list.js";
import { logs } from "../src/commands/logs.js";
import { run } from "../src/commands/run.js";
import { start } from "../src/commands/start.js";
import { stop } from "../src/commands/stop.js";
import { usage } from "../src/commands/usage.js";

const program = new Command();

program
  .name("sandbar")
  .description(packageJson.description)
  .version(packageJson.version, "-v, --version", "Print the sandbar version");

program
  .command("create")
  .argument("[name]", "Name for the Docker container")
  .option("-w, --workspace <path>", "Host workspace path to copy or mount", ".")
  .option(
    "-m, --mount-mode <mode>",
    "Workspace mode: bind or isolated",
    "isolated",
  )
  .option(
    "-t, --mount-target <path>",
    "Container path for the workspace",
    "/workspace",
  )
  .option(
    "-i, --image <image>",
    "Compatible Ubuntu-based Docker image to use",
    "ubuntu:26.04",
  )
  .option("-e, --empty-workspace", "Do not copy or mount a host workspace")
  .description("Create a local Docker sandbox")
  .action((name, options) => create({ name, ...options }));

program
  .command("auth")
  .argument("<name>", "Name of the sandbar container")
  .requiredOption(
    "-p, --provider <provider>",
    "Auth provider to copy",
    "openai",
  )
  .description("Copy host provider auth into a running sandbar container")
  .action((name, options) => auth(name, options));

program
  .command("env")
  .argument("<name>", "Name of the sandbar container")
  .argument("<var>", "Environment variable in KEY=VALUE format")
  .description(
    "Set a persistent environment variable in a running sandbar container",
  )
  .action((name, kv) => env(name, kv));

program
  .command("connect")
  .argument("<name>", "Name of the sandbar container to connect to")
  .description("Connect to a sandbar container manually")
  .action(connect);

program
  .command("run")
  .argument("<name>", "Name of the sandbar container to run the agent in")
  .requiredOption(
    "-a, --agent <agent>",
    "Agent command to run inside the container",
  )
  .option("-p, --prompt <prompt...>", "Prompt to pass to the agent")
  .option("-f, --file <path>", "Path to a file containing the prompt")
  .option("-k, --key <key>", "API key to pass to the agent")
  .description("Run an agent task inside a running sandbar container")
  .action((name, options) => run(name, options));

program
  .command("install")
  .argument("<name>", "Name of the sandbar container to install into")
  .option("-a, --agent <agent>", "Agent to install in the container")
  .description("Install an agent inside a running sandbar container")
  .action((name, options) => install(name, options));

program.command("list").description("List sandbar containers").action(list);

program
  .command("start")
  .argument("<name>", "Name of the sandbar container to start")
  .description("Start a stopped sandbar container")
  .action(start);

program
  .command("stop")
  .argument("<name>", "Name of the sandbar container to stop")
  .description("Stop a sandbar container")
  .action(stop);

program
  .command("kill")
  .argument("<name>", "Name of the sandbar container to stop and remove")
  .description("Stop and remove a sandbar container")
  .action(kill);

program
  .command("logs")
  .argument("<name>", "Name of the sandbar container to read logs from")
  .option("-a, --agent <agent>", "Agent to read logs for")
  .description("Read agent conversation logs from a running sandbar container")
  .action((name, options) => logs(name, options));

program
  .command("usage")
  .argument("<name>", "Name of the sandbar container to read usage from")
  .option("-a, --agent <agent>", "Agent to read usage for")
  .description("Read agent token usage from a running sandbar container")
  .action((name, options) => usage(name, options));

try {
  await program.parseAsync(process.argv);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
