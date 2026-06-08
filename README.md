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

Create a sandbox in isolated mode:

```sh
sandbar create test --mount-mode isolated
```

Or bind mode:

```sh
sandbar create test --mount-mode bind
```

> ***Note:*** Use bind mode when you want changes shared between the host and container.

Create a sandbox without copying or mounting the host workspace:

```sh
sandbar create test --empty-workspace
```

Copy or mount a different workspace path or container target:

```sh
sandbar create test --workspace . --mount-target /workspace
```

### List

List running Sandbar containers:

```sh
sandbar list
```

### Start

Start a stopped Sandbar container:

```sh
sandbar start test
```

### Stop

Stop a Sandbar container without removing it:

```sh
sandbar stop test
```

### Environment variables

Add environment variables in a running Sandbar container (stored in `~/.bashrc`):

```sh
sandbar env test CODEX_API_KEY=sk-xxx
```

> ***Note:*** This appends `export KEY="value"` to the container's `~/.bashrc`, so the var is available on every connection (shell or agent). No need to pass `--key`.

### Install

Install `opencode` inside a running Sandbar container:

```sh
sandbar install test --agent opencode
```

Or `codex`:

```sh
sandbar install test --agent codex
```

> ***Note:*** `codex` is configured with `gpt-5.5` and `model_reasoning_effort=xhigh`.

### Connect

Connect to a running Sandbar container (opens an interactive shell):

```sh
sandbar connect test
```

Run an agent task inside a running Sandbar container:

```sh
sandbar connect test --agent opencode --prompt "add a new file called hello.js"
```

> ***Note:*** Agents run in "yolo mode".

Or pass a file as the prompt:

```sh
sandbar connect test --agent opencode --file prompt.txt
```

Pass an API key to an agent one-time (not stored):

```sh
sandbar connect test --agent codex --prompt "hello" --key sk-xxx
```

> ***Note:*** `--key` passes the key via Docker exec environment for a single run. It is not persisted in the container. Use `sandbar env` to store it persistently.

### Logs

Logs agent conversation from a running Sandbar container:

```sh
sandbar logs test --agent codex
```

```sh
sandbar logs test --agent opencode
```

### Kill

Kill and remove a Sandbar container:

```sh
sandbar kill test
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](LICENSE)
