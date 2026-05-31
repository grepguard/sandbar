#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { connect } from "../src/commands/connect.js";
import { create } from "../src/commands/create.js";
import { install } from "../src/commands/install.js";
import { kill } from "../src/commands/kill.js";
import { list } from "../src/commands/list.js";
import { start } from "../src/commands/start.js";
import { stop } from "../src/commands/stop.js";

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
  .description("Create a local Docker sandbox")
  .action((name, options) => create({ name, ...options }));

program
  .command("connect")
  .argument("<name>", "Name of the sandbar container to connect to")
  .option("-a, --agent <agent>", "Agent command to run inside the container")
  .option("-p, --prompt <prompt...>", "Prompt to pass to the agent")
  .option("-f, --file <path>", "Path to a file containing the prompt")
  .option("-k, --key <key>", "API key to pass to the agent")
  .description(
    "Connect to a sandbar container manually or run an agent task inside it",
  )
  .action((name, options) => connect(name, options));

program
  .command("install")
  .argument("<name>", "Name of the sandbar container to install into")
  .option("-a, --agent <agent>", "Agent to install in the container")
  .description("Install an agent inside a running sandbar container")
  .action((name, options) => install(name, options));

program
  .command("list")
  .description("List running sandbar containers")
  .action(list);

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

try {
  await program.parseAsync(process.argv);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
