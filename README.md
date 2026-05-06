# sandbar

Local-first sandboxing for controlled and traceable AI agent execution.

## Usage

Create a sandbox from the current project:

```sh
sandbar create
```

By default, Sandbar starts an `ubuntu:24.04` Docker container and mounts the
current directory at `/workspace`.

Optional config:

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
