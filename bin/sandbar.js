#!/usr/bin/env node

import packageJson from "../package.json" with { type: "json" };
import { create } from "../src/commands/create.js";

const [command, ...args] = process.argv.slice(2);

const commands = {
  create,
};

function printHelp() {
  console.log(`sandbar

Usage:
  sandbar create
  sandbar --version

Commands:
  create    Create a local Docker sandbox from .sandbar/config.json

Options:
  -v, --version    Print the sandbar version
`);
}

if (command === "--version" || command === "-v") {
  console.log(packageJson.version);
  process.exit(0);
}

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

const run = commands[command];

if (!run) {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

try {
  await run(args);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
