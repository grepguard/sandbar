export const opencode = {
  runCommand: ["opencode", "run", "--dangerously-skip-permissions"],
  installer: {
    description: "Install opencode 1.15.5 and expose it on PATH",
    script: [
      "set -euo pipefail",
      "export DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC",
      "apt update",
      "apt -y upgrade",
      "apt -y install curl ca-certificates tzdata",
      "curl -fsSL https://deb.nodesource.com/setup_22.x | bash -",
      "apt -y install nodejs",
      "npm install -g opencode-ai@1.15.5",
      "opencode --version",
    ].join("\n"),
  },
};
