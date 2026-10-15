import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { detectProject, installCommand, lintRunbook, projectCommands, scaffoldRunbook } from "../src/runbook.js";

function project(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wck-"));
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
  return dir;
}

test("npm with a lockfile installs with npm ci and only lists scripts that exist", () => {
  const dir = project({
    "package.json": JSON.stringify({ name: "shop", scripts: { build: "x", test: "y" }, engines: { node: ">=20" } }),
    "package-lock.json": "{}"
  });
  const p = detectProject(dir);
  assert.equal(p.manager, "npm");
  assert.deepEqual(projectCommands(p), ["npm ci", "npm run build", "npm test"]);
  const runbook = scaffoldRunbook({ project: p, cwd: "shop" });
  assert.match(runbook, /# shop Runbook/);
  assert.match(runbook, /- node: >=20/);
  assert.doesNotMatch(runbook, /npm run dev/);
  assert.match(runbook, /`npm test` exits with code 0/);
});

test("pnpm, Yarn 1, Yarn 2+ and the packageManager field", () => {
  assert.equal(installCommand(detectProject(project({ "package.json": "{}", "pnpm-lock.yaml": "" }))), "pnpm install --frozen-lockfile");
  assert.equal(installCommand(detectProject(project({ "package.json": "{}", "yarn.lock": "" }))), "yarn install --frozen-lockfile");
  assert.equal(installCommand(detectProject(project({ "package.json": "{}", "yarn.lock": "", ".yarnrc.yml": "" }))), "yarn install --immutable");
  const declared = detectProject(project({ "package.json": JSON.stringify({ packageManager: "yarn@4.1.0", scripts: { dev: "v" } }), "yarn.lock": "" }));
  assert.deepEqual(projectCommands(declared), ["yarn install --immutable", "yarn run dev"]);
});

test("no lockfile means a plain install, and .nvmrc gives the node version", () => {
  const p = detectProject(project({ "package.json": JSON.stringify({ scripts: { start: "s" } }), ".nvmrc": "22.11.0\n" }));
  assert.deepEqual(projectCommands(p), ["npm install", "npm start"]);
  assert.equal(p.node, "22.11.0");
});

test("a broken package.json is reported, not ignored", () => {
  assert.throws(() => detectProject(project({ "package.json": "{ nope" })), /not valid JSON/);
});

test("lintRunbook accepts the names runbooks use and checks real headings", () => {
  const ok = ["# App", "## Overview", "x", "## Prerequisites", "x", "## Steps", "x", "## Verify", "x"].join("\n");
  assert.equal(lintRunbook(ok).pass, true);
  const inCode = ["# App", "```", "## Purpose", "## Environment", "## Commands", "## Verification", "```"].join("\n");
  assert.deepEqual(lintRunbook(inCode).missing, ["## Purpose", "## Environment", "## Commands", "## Verification"]);
  const hollow = ["# App", "## Purpose", "x", "## Environment", "x", "## Commands", "", "## Verification", "x"].join("\n");
  assert.deepEqual(lintRunbook(hollow).empty, ["## Commands"]);
  assert.equal(lintRunbook("## Purpose\nx").missing[0], "# Title");
});

test("this repo's own RUNBOOK.md passes its own lint", () => {
  const text = fs.readFileSync(new URL("../RUNBOOK.md", import.meta.url), "utf8");
  assert.deepEqual(lintRunbook(text), { missing: [], empty: [], pass: true });
});
