# Workflow CLI Kit

## Description
Workflow CLI Kit is a backend utility project that scaffolds runbooks and validates README quality against required section standards.

## Features
- Scaffold a runbook from the project itself: the install command comes from its lockfile or `packageManager` field (`npm ci`, `pnpm install --frozen-lockfile`, `yarn install --immutable` or `--frozen-lockfile` for Yarn 1), the commands are the scripts it really has, and the node version comes from `engines` or `.nvmrc`
- Check that a README has Description, Features, Run, Test and Project Structure, accepting the names READMEs use for them (Usage, Installation, Testing, Layout and others from the [standard-readme](https://github.com/RichardLitt/standard-readme) spec)
- Headings are read the [CommonMark](https://spec.commonmark.org/0.31.2/#atx-headings) way: a `## Run` inside a code example doesn't count, setext headings and closing `#`s do, and a heading with nothing under it is reported as empty
- Numeric README score and a `--min-score` gate (exit code 2 on fail) for CI
- Runbook lint for Purpose, Environment, Commands and Verification
- No dependencies

## Run
```bash
cd workflow-cli-kit
npm start -- scaffold sample-project ../my-app
```

Leave the name empty (`""`) to use the one in package.json.

Write scaffolded runbook to a file:

```bash
cd workflow-cli-kit
npm start -- scaffold sample-project . --out RUNBOOK.md
```

Check README with a quality gate:

```bash
cd workflow-cli-kit
npm start -- check README.md --min-score 80 --json
npm start -- lint-runbook RUNBOOK.md --json
```

## Test
```bash
cd workflow-cli-kit
npm test
```

## Project Structure
```text
workflow-cli-kit/
  src/
    cli.js
    markdown.js
    readmeCheck.js
    runbook.js
  tests/
    markdown.test.js
    runbook.test.js
    workflow.test.js
  package.json
  README.md
```
