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
  "workspace": ".",
  "mountTarget": "/workspace",
  "agents": ["opencode"]
}
```

If the config file does not exist, Sandbar creates this default config automatically.
Containers use `ubuntu:26.04` by default, the image is managed by Sandbar and does not need to be configured.

## Allowed agents

- `opencode`

## Commands

### Create

Create a sandbox from the current project config with a generated name:

```sh
sandbar create
```

Generated names are unique, so you can create multiple sandboxes from the same workspace.
If `ubuntu:26.04` is not available locally, Sandbar pulls it automatically.

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
sandbar install test --agent opencode
```

Connect to a running Sandbar container (opens an interactive shell):

```sh
sandbar connect test
```

Run an agent task inside a running Sandbar container:

```sh
sandbar connect test --agent opencode --prompt "add a new file called hello.js"
```

Or pass a file as the prompt:

```sh
sandbar connect test --agent opencode --file prompt.txt
```

### Kill 

Stop and remove a Sandbar container:

```sh
sandbar kill test
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](LICENSE)
