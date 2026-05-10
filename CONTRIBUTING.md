# Contributing

Thanks for your interest in contributing!

## Development setup

```sh
git clone https://github.com/grepguard/sandbar.git
cd sandbar
npm install
```

### Local testing

Link the package locally to test changes without publishing:

```sh
npm link
```

This creates a global `sandbar` command that points to your local repo. To remove it:

```sh
npm unlink -g sandbar
```

## Scripts

- `npm run check` — lint, format and organize imports (writes changes)

## Releasing (Maintainers Only)

> **Note:** Publishing is done manually by maintainers.

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
4. Log in to npm (if not already):
   ```sh
   npm login
   ```
5. Publish to npm:
   ```sh
   npm publish
   ```

GitHub Actions will automatically create a GitHub Release from the tag.
