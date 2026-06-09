export const opencode = {
  runCommand: ["opencode", "run", "--dangerously-skip-permissions"],
  installer: {
    description: "Install opencode 1.15.5 and expose it on PATH",
    script: [
      "set -euo pipefail",
      "export DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC",
      "apt update",
      "apt -y upgrade",
      "apt -y install curl ca-certificates tzdata git",
      "git config --global --add safe.directory /workspace",
      "git config --global user.name 'Sandbar Agent'",
      "git config --global user.email 'sandbar-agent@users.noreply.github.com'",
      "git config --global credential.helper '!f() { echo username=x-token; echo password=$GIT_PAT; }; f'",
      "curl -fsSL https://deb.nodesource.com/setup_22.x | bash -",
      "apt -y install nodejs",
      "npm install -g opencode-ai@1.15.5",
      "opencode --version",
    ].join("\n"),
  },
};
