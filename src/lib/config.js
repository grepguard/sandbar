import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const CONFIG_PATH = ".sandbar/config.json";
const DEFAULT_CONFIG_JSON = `{
  "workspace": ".",
  "mountTarget": "/workspace",
  "agents": ["opencode"]
}
`;

export async function readConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, CONFIG_PATH);

  try {
    await access(configPath);
  } catch {
    await createDefaultConfig(configPath);
    console.log(`Created default config: ${CONFIG_PATH}`);
  }

  try {
    return JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${CONFIG_PATH}: ${error.message}`);
  }
}

async function createDefaultConfig(configPath) {
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, DEFAULT_CONFIG_JSON);
}
