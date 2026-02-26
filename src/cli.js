import fs from "node:fs";
import path from "node:path";

import { evaluateReadme } from "./readmeCheck.js";
import { lintRunbook, scaffoldRunbook } from "./runbook.js";

function usage() {
  console.log("Usage:");
  console.log("  node src/cli.js scaffold <projectName> [cwd] [--out <outputPath>]");
  console.log("  node src/cli.js check <readmePath> [--min-score <0-100>] [--json]");
  console.log("  node src/cli.js lint-runbook <runbookPath> [--json]");
}

function scaffoldCommand(args) {
  const positional = [];
  let outPath = "";
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === "--out") {
      index += 1;
      outPath = args[index] || "";
      continue;
    }
    positional.push(token);
  }

  const [projectName = "new-project", cwd = "."] = positional;
  const text = scaffoldRunbook({ projectName, cwd });

  if (outPath) {
    const absolute = path.resolve(process.cwd(), outPath);
    fs.writeFileSync(absolute, `${text}\n`, "utf8");
    console.log(`Runbook written to ${outPath}`);
  } else {
    console.log(text);
  }
}

function checkCommand(args) {
  const positional = [];
  let minScore = 0;
  let outputJson = false;

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === "--min-score") {
      index += 1;
      minScore = Number(args[index] || 0);
      if (Number.isNaN(minScore)) {
        throw new Error("--min-score must be numeric.");
      }
      continue;
    }
    if (token === "--json") {
      outputJson = true;
      continue;
    }
    positional.push(token);
  }

  const [readmePath] = positional;
  if (!readmePath) {
    throw new Error("Missing README path.");
  }

  const absolute = path.resolve(process.cwd(), readmePath);
  const text = fs.readFileSync(absolute, "utf8");
  const report = evaluateReadme(text, minScore);

  if (outputJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`README score: ${report.score}`);
    console.log(`Required sections present: ${report.present}`);
    console.log(`Pass threshold (${report.minScore}): ${report.pass ? "yes" : "no"}`);
    if (report.missing.length > 0) {
      console.log(`Missing: ${report.missing.join(", ")}`);
    }
  }

  if (!report.pass) {
    process.exitCode = 2;
  }
}

function lintRunbookCommand(args) {
  const positional = [];
  let outputJson = false;

  for (const token of args) {
    if (token === "--json") {
      outputJson = true;
      continue;
    }
    positional.push(token);
  }

  const [runbookPath] = positional;
  if (!runbookPath) {
    throw new Error("Missing runbook path.");
  }

  const absolute = path.resolve(process.cwd(), runbookPath);
  const text = fs.readFileSync(absolute, "utf8");
  const report = lintRunbook(text);

  if (outputJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Runbook lint: ${report.pass ? "pass" : "fail"}`);
    if (report.missing.length > 0) {
      console.log(`Missing headings: ${report.missing.join(", ")}`);
    }
  }

  if (!report.pass) {
    process.exitCode = 2;
  }
}

function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "scaffold") {
    scaffoldCommand(args);
    return;
  }

  if (command === "check") {
    checkCommand(args);
    return;
  }

  if (command === "lint-runbook") {
    lintRunbookCommand(args);
    return;
  }

  usage();
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
