# 🏖️ sandbar

Local-first sandbox for isolated, observable and traceable execution of AI agents.

## Usage

Create a sandbox from the current project:

```sh
sandbar create
```

Sandbar starts a Docker container based on `.sandbar/config.json`.

Required config:

```json
{
  "image": "ubuntu:24.04",
  "name": "my-sandbar",
  "workspace": ".",
  "mountTarget": "/workspace",
  "command": ["sleep", "infinity"]
}
```

Save it at `.sandbar/config.json`.
