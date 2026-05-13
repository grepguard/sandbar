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

>**Note**: The config file must exist in your project and will not be generated automatically.

## Allowed agents

- `opencode`

## Commands

### Create

Create a sandbox from the current project config with a generated name:

```sh
sandbar create
```

>**Note**: Generated names are unique, so you can create multiple sandboxes from the same workspace.

>**Note**: If the image is not installed or locally available, sandbar will pull it automatically.

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
