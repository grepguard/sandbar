import { access, readFile } from "node:fs/promises";
import path from "node:path";

export const CONFIG_PATH = ".sandbar/config.json";

export async function readConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, CONFIG_PATH);

  try {
    await access(configPath);
  } catch {
    throw new Error(`Missing required config: ${CONFIG_PATH}`);
  }

  try {
    return JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${CONFIG_PATH}: ${error.message}`);
  }
}
