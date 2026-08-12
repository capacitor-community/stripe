# Contributing

This guide provides instructions for contributing to this Capacitor plugin.

## Developing

### Local Setup

1. Fork and clone the repo.
1. Install the dependencies.

```shell
npm install
```

1. Install SwiftLint if you're on macOS.

```shell
brew install swiftlint
```

### Scripts

#### `npm run build`

Build all plugin packages from the repository root. Each package compiles its web assets and generates its API documentation using `@rdlabo/capacitor-docgen`.

It will compile the TypeScript code from `src/` into ESM JavaScript in `dist/esm/`. These files are used in apps with bundlers when your plugin is imported.

Then, Rollup will bundle the code into a single file at `dist/plugin.js`. This file is used in apps without bundlers by including it as a script in `index.html`.

#### `npm run verify`

Run this from a package directory, or run `npm run verify --workspaces` from the repository root, to build and validate the web and native projects.

This is useful to run in CI to verify that the plugin builds for all platforms.

#### `npm run lint` / `npm run fmt`

Run these from a package directory, or append `--workspaces` when running them from the repository root. They check formatting and code quality, and `fmt` applies automatic fixes where possible.

This template is integrated with ESLint, Prettier, and SwiftLint. Using these tools is completely optional, but the [Capacitor Community](https://github.com/capacitor-community/) strives to have consistent code style and structure for easier cooperation.

# Note
`docgen --api DocGenType` is for Document. 
