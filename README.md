# 🏖️ sandbar

Local-first sandbox for isolated, observable and traceable execution of AI agents.

## Install

```sh
npm install -g sandbar
```

## Allowed agents

- codex
- opencode

## Commands

### Create

Create an `ubuntu:26.04` Docker sandbox from the current directory with a
generated name:

```sh
sandbar create
```

> ***Note:*** Generated names are unique, so you can create multiple sandboxes from the same
workspace.

Or pass a specific name:

```sh
sandbar create test
```

> ***Note:*** By default, Sandbar uses isolated mode. It copies the current
> directory (`.`) to `/workspace` inside Docker once, so changes are not shared
> between the host and container.

Choose either isolated or bind mode:

```sh
sandbar create test --mount-mode isolated
sandbar create test --mount-mode bind
```

> ***Note:*** Use bind mode when you want changes shared between the host and container.

Copy or mount a different workspace path or container target:

```sh
sandbar create test --workspace . --mount-target /workspace
```

### List

List running Sandbar containers:

```sh
sandbar list
```

### Start and stop

Start a stopped Sandbar container:

```sh
sandbar start test
```

Stop a Sandbar container without removing it:

```sh
sandbar stop test
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

> ***Note:*** Agents run in "yolo mode"

Or pass a file as the prompt:

```sh
sandbar connect test --agent opencode --file prompt.txt
```

Pass an API key to an agent:

```sh
sandbar connect test --agent codex --prompt "hello" --key sk-xxx
```

> ***Note:*** `--key` currently only supports `codex`.

### Kill 

Stop and remove a Sandbar container:

```sh
sandbar kill test
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](LICENSE)
