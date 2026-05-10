# 🏖️ sandbar

Local-first sandbox for isolated, observable and traceable execution of AI agents.

## Install

```sh
npm install -g sandbar
```

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

### Create

Create a sandbox from the current project config with a generated name:

```sh
sandbar create
```

>**Note**: Generated names are unique, so you can create multiple sandboxes from the same workspace.

Or pass a specific name:

```sh
sandbar create test
```

### List

List running Sandbar containers:

```sh
sandbar list
```

### Install and connect AI agents

Install an agent inside a running Sandbar container (example: `opencode`):

```sh
sandbar install opencode test
```

Run an agent task inside a running Sandbar container:

```sh
sandbar connect test --agent opencode --prompt "add a new file called hello.js"
```

### Kill 

Stop and remove a Sandbar container:

```sh
sandbar kill test
```

## Release

To create a new release:

1. Update the version in `package.json`.
2. Commit and push the change:
   ```sh
   git add package.json
   git commit -m "Bump version to v1.0.0"
   git push origin main
   ```
3. Create and push a tag:
   ```sh
   git tag v1.0.0
   git push origin v1.0.0
   ```

GitHub Actions will automatically create a release from the tag.
