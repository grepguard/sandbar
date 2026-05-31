import { codex } from "./codex.js";
import { opencode } from "./opencode.js";

export const AGENTS = {
  codex,
  opencode,
};

export function listInstallableAgents() {
  return Object.entries(AGENTS)
    .filter(([, agent]) => agent.installer)
    .map(([name]) => name)
    .sort();
}

export function listRunnableAgents() {
  return Object.entries(AGENTS)
    .filter(([, agent]) => agent.runCommand)
    .map(([name]) => name)
    .sort();
}
