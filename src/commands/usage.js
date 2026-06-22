import { AGENTS, listRunnableAgents } from "../agents/index.js";
import { findManagedContainer } from "../lib/containers.js";
import { createDockerClient } from "../lib/docker.js";
import { captureInContainer } from "../lib/exec.js";

const OPENCODE_DB = "/root/.local/share/opencode/opencode.db";
const CODEX_HOME = "/root/.codex";

export async function usage(name, options = {}) {
  const agent = options?.agent;
  if (!agent) throw new Error("Missing required option: --agent");
  if (!name) throw new Error("Missing required argument: <name>");

  const docker = await createDockerClient();
  const containerInfo = await findManagedContainer(docker, name);

  if (containerInfo.State !== "running") {
    throw new Error(`Sandbar container is not running: ${name}`);
  }

  if (!AGENTS[agent]) {
    const available = listRunnableAgents().join(", ");
    throw new Error(`Unknown agent: ${agent}. Available: ${available}`);
  }

  const result = await captureInContainer(docker, containerInfo.Id, {
    command:
      agent === "opencode" ? getOpenCodeUsageCommand() : getCodexUsageCommand(),
    user: "root",
  });

  if (result.exitCode !== 0) {
    const msg =
      result.stderr.toString("utf-8").trim() || `exit code ${result.exitCode}`;
    throw new Error(msg);
  }

  const records = JSON.parse(result.stdout.toString("utf-8"));
  const totals = records[0] ?? {};

  printUsage([
    ["AGENT", agent],
    ["SESSIONS", totals.sessions ?? 0],
    ["MESSAGES", totals.messages ?? 0],
    ["INPUT", totals.input ?? 0],
    ["CACHED", totals.cached ?? 0],
    ["OUTPUT", totals.output ?? 0],
    ["REASONING", totals.reasoning ?? 0],
    ["TOTAL", totals.total ?? 0],
  ]);
}

function getOpenCodeUsageCommand() {
  return [
    "bash",
    "-c",
    [
      `db="${OPENCODE_DB}"`,
      '[ -f "$db" ] || { echo "No OpenCode database found" >&2; exit 1; }',
      "command -v sqlite3 &>/dev/null || apt-get install -y sqlite3 &>/dev/null || true",
      "sqlite3 -json \"$db\" <<'SQL'",
      "WITH docs AS (",
      "  SELECT data FROM message WHERE json_valid(data)",
      "  UNION ALL",
      "  SELECT data FROM part WHERE json_valid(data)",
      "), leaves AS (",
      "  SELECT lower(j.key) AS key, lower(j.fullkey) AS fullkey, j.atom AS value",
      "  FROM docs, json_tree(docs.data) AS j",
      "  WHERE j.type IN ('integer', 'real')",
      "), totals AS (",
      "  SELECT",
      "    COALESCE(SUM(CASE WHEN (key IN ('input', 'input_tokens', 'prompt_tokens') OR fullkey LIKE '%input_tokens%' OR fullkey LIKE '%prompt_tokens%') AND (fullkey LIKE '%token%' OR fullkey LIKE '%usage%') THEN value ELSE 0 END), 0) AS input,",
      "    COALESCE(SUM(CASE WHEN (key IN ('cached', 'cache', 'cache_read', 'cached_tokens') OR fullkey LIKE '%cache%') AND (fullkey LIKE '%token%' OR fullkey LIKE '%usage%') THEN value ELSE 0 END), 0) AS cached,",
      "    COALESCE(SUM(CASE WHEN (key IN ('output', 'output_tokens', 'completion_tokens') OR fullkey LIKE '%output_tokens%' OR fullkey LIKE '%completion_tokens%') AND (fullkey LIKE '%token%' OR fullkey LIKE '%usage%') THEN value ELSE 0 END), 0) AS output,",
      "    COALESCE(SUM(CASE WHEN (key IN ('reasoning', 'reasoning_tokens') OR fullkey LIKE '%reasoning%') AND (fullkey LIKE '%token%' OR fullkey LIKE '%usage%') THEN value ELSE 0 END), 0) AS reasoning",
      "  FROM leaves",
      ")",
      "SELECT",
      "  (SELECT COUNT(*) FROM session WHERE parent_id IS NULL) AS sessions,",
      "  (SELECT COUNT(*) FROM message) AS messages,",
      "  CAST(input AS INTEGER) AS input,",
      "  CAST(cached AS INTEGER) AS cached,",
      "  CAST(output AS INTEGER) AS output,",
      "  CAST(reasoning AS INTEGER) AS reasoning,",
      "  CAST(input + cached + output + reasoning AS INTEGER) AS total",
      "FROM totals;",
      "SQL",
    ].join("\n"),
  ];
}

function getCodexUsageCommand() {
  return [
    "bash",
    "-c",
    [
      "shopt -s nullglob",
      `files=(${CODEX_HOME}/state_*.sqlite)`,
      "(( $" +
        '{#files[@]} )) || { echo "No Codex state database found" >&2; exit 1; }',
      'db="$' + '{files[-1]}"',
      "command -v sqlite3 &>/dev/null || apt-get install -y sqlite3 &>/dev/null || true",
      "command -v python3 &>/dev/null || apt-get install -y python3 &>/dev/null || true",
      'sqlite3 "$db" "SELECT rollout_path FROM threads WHERE rollout_path != \'\' ORDER BY id DESC" |',
      "while IFS= read -r path; do",
      `  [ "\${path:0:1}" = / ] || path="${CODEX_HOME}/$path"`,
      '  [ -f "$path" ] || continue',
      '  cat "$path"',
      "done | python3 -c '",
      "import json, sys",
      "sessions = set()",
      "messages = 0",
      'totals = {"input": 0, "cached": 0, "output": 0, "reasoning": 0}',
      "def walk(value, path=()):",
      "    if isinstance(value, (int, float)) and not isinstance(value, bool):",
      '        key = str(path[-1] if path else "").lower()',
      '        full = ".".join(path).lower()',
      '        if (key in ("input", "input_tokens", "prompt_tokens") or "input_tokens" in full or "prompt_tokens" in full) and ("token" in full or "usage" in full): totals["input"] += value',
      '        if (key in ("cached", "cached_tokens") or "cache" in full) and ("token" in full or "usage" in full): totals["cached"] += value',
      '        if (key in ("output", "output_tokens", "completion_tokens") or "output_tokens" in full or "completion_tokens" in full) and ("token" in full or "usage" in full): totals["output"] += value',
      '        if (key in ("reasoning", "reasoning_tokens") or "reasoning" in full) and ("token" in full or "usage" in full): totals["reasoning"] += value',
      "    elif isinstance(value, dict):",
      "        for key, child in value.items(): walk(child, path + (str(key),))",
      "    elif isinstance(value, list):",
      "        for index, child in enumerate(value): walk(child, path + (str(index),))",
      "for line in sys.stdin:",
      "    if not line.strip(): continue",
      "    try: record = json.loads(line)",
      "    except Exception: continue",
      '    if record.get("session_id"): sessions.add(record["session_id"])',
      '    if record.get("type") == "event_msg" and "message" in str(record.get("payload", {}).get("type", "")): messages += 1',
      "    walk(record)",
      "print(json.dumps([{",
      '    "sessions": len(sessions),',
      '    "messages": messages,',
      '    "input": int(totals["input"]),',
      '    "cached": int(totals["cached"]),',
      '    "output": int(totals["output"]),',
      '    "reasoning": int(totals["reasoning"]),',
      '    "total": int(sum(totals.values()))',
      "}]))",
      "'",
    ].join("\n"),
  ];
}

function printUsage(rows) {
  const labelWidth = Math.max(...rows.map(([label]) => label.length));

  for (const [label, value] of rows) {
    console.log(`${label.padEnd(labelWidth)}  ${value}`);
  }
}
