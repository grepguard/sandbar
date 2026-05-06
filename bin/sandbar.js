#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { create } from "../src/commands/create.js";

const program = new Command();

program
  .name("sandbar")
  .description(packageJson.description)
  .version(packageJson.version, "-v, --version", "Print the sandbar version");

program
  .command("create")
  .description("Create a local Docker sandbox from .sandbar/config.json")
  .action(create);

try {
  await program.parseAsync(process.argv);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
