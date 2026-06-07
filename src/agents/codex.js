export const codex = {
  runCommand: [
    "codex",
    "exec",
    "--yolo",
    "--model",
    "gpt-5.5",
    "-c",
    "model_reasoning_effort=xhigh",
  ],
  installer: {
    description: "Install Codex CLI and expose it on PATH",
    script: [
      "set -euo pipefail",
      "apt update",
      "apt -y upgrade",
      "apt -y install curl ca-certificates bubblewrap git",
      "git config --global --add safe.directory /workspace",
      "curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh",
      "ln -sf /root/.local/bin/codex /usr/local/bin/codex",
      "codex --version",
    ].join("\n"),
  },
};
