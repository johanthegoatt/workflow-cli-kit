# Workflow CLI Kit Runbook

## Purpose

Scaffold project runbooks and enforce README quality standards from the terminal.

## Environment

- cwd: workflow-cli-kit
- node: 18+ (uses `node:test` and no dependencies)

## Commands

### Scaffold a runbook from a project's package.json

```powershell
npm start -- scaffold demo-project ../some-project --out RUNBOOK.generated.md
```

### Check README quality

```powershell
npm start -- check README.md --min-score 80 --json
```

### Lint a runbook

```powershell
npm start -- lint-runbook RUNBOOK.md
```

## Verification

```powershell
npm test
npm start -- lint-runbook RUNBOOK.md
```

Both exit with code 0.
