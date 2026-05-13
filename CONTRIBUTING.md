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

1. Bump the version (this updates `package.json` and `package-lock.json` together, and creates a commit and tag):
   ```sh
   npm version patch   # or minor / major or the specific version
   ```
2. Push the commit and tag:
   ```sh
   git push origin main --follow-tags
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
