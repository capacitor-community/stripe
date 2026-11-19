# Contributing

This guide provides instructions for contributing to this Capacitor plugin.

## Developing

### Local Setup

1. Fork and clone the repo.
1. Use Node.js 22 or later and install the dependencies.

```shell
npm ci
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

This template is integrated with ESLint, Prettier, and SwiftLint. Run the relevant checks before submitting code changes so local results match CI.

## Documentation ownership

- The root README routes users to the appropriate package and summarizes support and shared responsibilities.
- Each package README covers installation and links to its focused guides in `packages/<package>/docs`. Those guides explain setup order, backend contracts, platform differences, and result handling.
- Demo READMEs explain how to run the examples and which preparation belongs to the maintainer. Demo-only authentication must not be presented as production authentication.
- API sections between `<docgen-index>` / `<docgen-api>` markers are generated. Change the source API JSDoc, then run `npm run docgen --workspace=<package-name>`; do not edit the generated sections directly. Preserve documentation-site frontmatter and `<!-- !::...:: -->` API inclusion markers.

For prose-only changes, check links, example contracts against the implementation, and `git diff --check`. For code changes, run the relevant workspace checks above. The Angular demo and demo Worker have their own dependency installations and check commands documented in their READMEs.
