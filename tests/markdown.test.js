import test from "node:test";
import assert from "node:assert/strict";

import { headings } from "../src/markdown.js";
import { evaluateReadme, scoreReadme } from "../src/readmeCheck.js";

const full = [
  "# Demo",
  "## Description", "x",
  "## Features", "x",
  "## Run", "x",
  "## Test", "x",
  "## Project Structure", "x"
].join("\n");

test("headings inside fenced code blocks are not headings", () => {
  const readme = [
    "## Description", "A tool.",
    "Example README:",
    "```markdown",
    "## Features",
    "## Run",
    "## Test",
    "## Project Structure",
    "```"
  ].join("\n");
  const report = scoreReadme(readme);
  assert.equal(report.score, 20);
  assert.deepEqual(report.missing, ["Features", "Run", "Test", "Project Structure"]);
});

test("tilde fences, longer fences and indented code are skipped too", () => {
  const hs = headings(["~~~", "## Run", "~~~", "````", "```", "## Test", "````", "", "    ## Usage", "## Real"].join("\n"));
  assert.deepEqual(hs.map((h) => h.text), ["Real"]);
});

test("setext headings, closing hashes and leading spaces count", () => {
  const hs = headings(["Description", "-----------", "   ## Run ##", "Title", "====="].join("\n"));
  assert.deepEqual(hs.map((h) => [h.level, h.text]), [[2, "Description"], [2, "Run"], [1, "Title"]]);
});

test("a horizontal rule after a blank line is not a heading", () => {
  assert.deepEqual(headings(["text", "", "---"].join("\n")), []);
});

test("common section names are accepted: Usage, Installation, Testing, Layout", () => {
  const readme = [
    "## About", "x",
    "## Highlights", "x",
    "## Usage", "x",
    "## Running tests", "x",
    "## Layout", "x"
  ].join("\n");
  const report = scoreReadme(readme);
  assert.equal(report.score, 100);
  assert.equal(report.matched.Run, "Usage");
});

test("a heading with nothing under it is reported as empty, not present", () => {
  const readme = full.replace("## Test\nx", "## Test\n\n");
  const report = evaluateReadme(readme, 100);
  assert.equal(report.pass, false);
  assert.deepEqual(report.missing, ["Test"]);
  assert.deepEqual(report.empty, ["Test"]);
});

test("a section whose content is all subsections still counts", () => {
  const readme = full.replace("## Run\nx", "## Run\n### Windows\nx\n### macOS\ny");
  assert.equal(scoreReadme(readme).score, 100);
});

test("CRLF READMEs from Windows read the same", () => {
  assert.equal(scoreReadme(full.replace(/\n/g, "\r\n")).score, 100);
});
