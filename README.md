# Workflow CLI Kit

## Description
Workflow CLI Kit is a backend utility project that scaffolds runbooks and validates README quality against required section standards.

## Features
- Generate project runbook markdown with standardized command blocks
- Validate README section completeness
- Produce numeric README quality score for quick checks
- Simple CLI for scaffold/check workflows
- Local-only tooling without external dependencies

## Run
```bash
cd workflow-cli-kit
npm start -- scaffold sample-project .
```

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
    readmeCheck.js
    runbook.js
  tests/
    workflow.test.js
  package.json
  README.md
```
