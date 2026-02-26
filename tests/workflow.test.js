import test from "node:test";
import assert from "node:assert/strict";

import { evaluateReadme, findMissingSections, scoreReadme } from "../src/readmeCheck.js";
import { lintRunbook, scaffoldRunbook } from "../src/runbook.js";

test("findMissingSections flags missing headings", () => {
  const readme = `## Description\nA\n## Run\nB`;
  const missing = findMissingSections(readme);

  assert.equal(missing.includes("Features"), true);
  assert.equal(missing.includes("Test"), true);
});

test("scoreReadme returns percentage score", () => {
  const readme = [
    "## Description",
    "x",
    "## Features",
    "x",
    "## Run",
    "x",
    "## Test",
    "x",
    "## Project Structure",
    "x"
  ].join("\n");

  const report = scoreReadme(readme);
  assert.equal(report.score, 100);
  assert.equal(report.present, 5);
  assert.equal(report.missing.length, 0);
});

test("scaffoldRunbook includes command block content", () => {
  const runbook = scaffoldRunbook({
    projectName: "demo",
    cwd: "demo-dir",
    commands: ["npm install", "npm test"]
  });

  assert.equal(runbook.includes("# demo Runbook"), true);
  assert.equal(runbook.includes("cwd: demo-dir"), true);
  assert.equal(runbook.includes("- npm test"), true);
});

test("evaluateReadme computes pass/fail against threshold", () => {
  const weakReadme = ["## Description", "x", "## Run", "x"].join("\n");
  const report = evaluateReadme(weakReadme, 80);

  assert.equal(report.pass, false);
  assert.equal(report.minScore, 80);
  assert.equal(report.missing.includes("Features"), true);
});

test("lintRunbook validates required sections", () => {
  const runbook = scaffoldRunbook({
    projectName: "demo",
    cwd: ".",
    commands: ["npm test"]
  });
  const report = lintRunbook(runbook);
  assert.equal(report.pass, true);
  assert.deepEqual(report.missing, []);
});
