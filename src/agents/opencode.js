export const opencode = {
  runCommand: ["opencode", "run", "--dangerously-skip-permissions"],
  installer: {
    description: "Install opencode and expose it on PATH",
    script: [
      "set -euo pipefail",
      "apt update",
      "apt -y upgrade",
      "apt -y install curl ca-certificates",
      "curl -fsSL https://opencode.ai/install | bash",
      "ln -sf /root/.opencode/bin/opencode /usr/local/bin/opencode",
      "opencode --version",
    ].join("\n"),
  },
};
