# Workflow CLI Kit Runbook

## Purpose

Scaffold project runbooks and enforce README quality standards from the terminal.

## Setup

```powershell
cd workflow-cli-kit
npm install
```

## Scaffold a Runbook

```powershell
cd workflow-cli-kit
npm start -- scaffold demo-project . --out RUNBOOK.generated.md
```

## Check README Quality

```powershell
cd workflow-cli-kit
npm start -- check README.md --min-score 80 --json
```

## Verify

```powershell
cd workflow-cli-kit
npm test
```
