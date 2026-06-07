import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";
import { captureInContainer } from "../lib/exec.js";

const CODEX_HOME = "/root/.codex";
const OPENCODE_DB = "/root/.local/share/opencode/opencode.db";

export async function logs(name, options = {}) {
  const agent = options?.agent;
  if (!agent) throw new Error("Missing required option: --agent");
  if (!name) throw new Error("Missing required argument: <name>");

  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  const command =
    agent === "opencode" ? getOpenCodeCommand() : getCodexCommand();

  const result = await captureInContainer(docker, containerInfo.Id, {
    command,
    user: "root",
  });

  if (result.exitCode !== 0) {
    const msg =
      result.stderr.toString("utf-8").trim() || `exit code ${result.exitCode}`;
    throw new Error(msg);
  }

  const text = result.stdout.toString("utf-8");
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (line.trim() === "---") {
      console.log("---");
      continue;
    }

    let record;
    try {
      record = JSON.parse(line);
    } catch {
      const entry = formatLine(line);
      if (entry) {
        console.log(`[${entry.timestamp} ${entry.label}]`);
        console.log(entry.text);
        console.log("");
      }
      continue;
    }

    if (record.type === "session_start") {
      const ts = formatTimestamp(record.timestamp);
      console.log(`=== ${record.title || record.id} (${ts}) ===`);
      continue;
    }

    const entry = formatLine(line);
    if (entry) {
      console.log(`[${entry.timestamp} ${entry.label}]`);
      console.log(entry.text);
      console.log("");
    }
  }
}

function getCodexCommand() {
  return [
    "bash",
    "-c",
    "shopt -s nullglob; " +
      "files=(" +
      CODEX_HOME +
      "/state_*.sqlite); " +
      `(( \${#files[@]} )) || { echo "No Codex state database found" >&2; exit 1; }; ` +
      `db="\${files[-1]}"; ` +
      "command -v sqlite3 &>/dev/null || apt-get install -y sqlite3 &>/dev/null || true; " +
      'sqlite3 "$db" "SELECT rollout_path FROM threads WHERE rollout_path != \'\' ORDER BY id DESC" | ' +
      "while IFS= read -r path; do " +
      `  [ "\${path:0:1}" = / ] || path="` +
      CODEX_HOME +
      '/$path"; ' +
      '  [ -f "$path" ] || continue; ' +
      '  echo "---"; ' +
      '  cat "$path"; ' +
      "done",
  ];
}

function getOpenCodeCommand() {
  return [
    "bash",
    "-c",
    [
      "shopt -s nullglob",
      `db="${OPENCODE_DB}"`,
      '[ -f "$db" ] || { echo "No OpenCode database found" >&2; exit 1; }',
      "command -v sqlite3 &>/dev/null || apt-get install -y sqlite3 &>/dev/null || true",
      'for sid in $(sqlite3 "$db" "SELECT id FROM session WHERE parent_id IS NULL ORDER BY time_created DESC"); do',
      '  echo "---"',
      "  sqlite3 \"$db\" \"SELECT json_object('type','session_start','id',id,'title',title,'timestamp',time_created) FROM session WHERE id='$sid'\"",
      "  sqlite3 \"$db\" \"SELECT json_object('type','event_msg','timestamp',m.time_created,'payload',json_object('type',CASE json_extract(m.data,'$.role') WHEN 'user' THEN 'user_message' WHEN 'assistant' THEN 'agent_message' END,'message',(SELECT group_concat(json_extract(p.data,'$.text'),char(10)) FROM part p WHERE p.message_id=m.id AND json_extract(p.data,'$.type')='text' AND COALESCE(json_extract(p.data,'$.synthetic'),0)=0 AND COALESCE(json_extract(p.data,'$.ignored'),0)=0))) FROM message m WHERE m.session_id='$sid' AND (json_extract(m.data,'$.role')='user' OR (json_extract(m.data,'$.role')='assistant' AND json_extract(m.data,'$.finish')='stop')) AND json_extract(m.data,'$.role') IS NOT NULL ORDER BY m.time_created ASC\"",
      "done",
    ].join("\n"),
  ];
}

function formatLine(line) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    return { timestamp: "unknown", label: "raw", text: line };
  }

  const timestamp = record.timestamp ?? "unknown";

  if (record.type === "event_msg") {
    if (
      record.payload?.type === "user_message" &&
      record.payload.message?.trim()
    ) {
      return { timestamp, label: "user", text: record.payload.message.trim() };
    }
    if (
      record.payload?.type === "agent_message" &&
      record.payload.message?.trim()
    ) {
      return {
        timestamp,
        label: "assistant",
        text: record.payload.message.trim(),
      };
    }
  }

  if (
    record.type === "response_item" &&
    record.payload?.type === "function_call"
  ) {
    const raw = record.payload.arguments ?? "";
    let summary;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.cmd) {
        summary = `$ ${parsed.cmd}`;
        if (parsed.workdir) summary += ` (workdir: ${parsed.workdir})`;
      } else {
        summary = truncate(raw);
      }
    } catch {
      summary = truncate(raw);
    }
    return { timestamp, label: `tool:${record.payload.name}`, text: summary };
  }

  if (
    record.type === "response_item" &&
    record.payload?.type === "function_call_output"
  ) {
    const text = truncate(record.payload.output ?? "");
    return text.trim()
      ? { timestamp, label: "output", text: text.trim() }
      : null;
  }

  return null;
}

function formatTimestamp(ms) {
  const d = new Date(Number(ms));
  return d.toISOString().replace("T", " ").replace(/\..+/, "");
}

function truncate(value, limit = 2000) {
  const text = String(value);
  return text.length <= limit ? text : `${text.slice(0, limit)}...`;
}
