# 🏖️ sandbar

Local-first sandbox for isolated, observable and traceable execution of AI agents.

## Usage

Sandbar starts Docker containers from `.sandbar/config.json`:

```json
{
  "image": "ubuntu:24.04",
  "workspace": ".",
  "mountTarget": "/workspace",
  "command": ["sleep", "infinity"]
}
```

Create a sandbox from the current project with a generated name:

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
