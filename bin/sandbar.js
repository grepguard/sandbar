#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { create } from "../src/commands/create.js";
import { kill } from "../src/commands/kill.js";
import { list } from "../src/commands/list.js";

const program = new Command();

program
  .name("sandbar")
  .description(packageJson.description)
  .version(packageJson.version, "-v, --version", "Print the sandbar version");

program
  .command("create")
  .argument("[name]", "Name for the Docker container")
  .description("Create a local Docker sandbox from .sandbar/config.json")
  .action((name) => create({ name }));

program
  .command("list")
  .description("List running sandbar containers")
  .action(list);

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
