# 🏖️ sandbar

Local-first sandbox for isolated, observable and traceable execution of AI agents.

## Config

Sandbar starts Docker containers from `.sandbar/config.json`:

```json
{
  "image": "ubuntu:24.04",
  "workspace": ".",
  "mountTarget": "/workspace",
  "command": ["sleep", "infinity"],
  "agents": {
    "opencode": ["opencode", "run"]
  }
}
```

## Allowed agents

- `opencode`

## Commands

Create a sandbox from the current project config with a generated name:

```sh
sandbar create
```

Or pass a name:

```sh
sandbar create test
```

Generated names are unique, so you can create multiple sandboxes from the same workspace.

List running Sandbar containers:

```sh
sandbar list
```

Install an agent inside a running Sandbar container (example: `opencode`):

```sh
sandbar install opencode test
```

Run an agent task inside a running Sandbar container:

```sh
sandbar connect test --agent opencode --prompt "add a new file called hello.js"
```

Stop and remove a Sandbar container:

```sh
sandbar kill test
```
