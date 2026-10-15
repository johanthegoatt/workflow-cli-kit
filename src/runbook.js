import fs from "node:fs";
import path from "node:path";

import { headings, normalize, sections } from "./markdown.js";

// Which package manager a project uses, from the lockfile it commits or the
// "packageManager" field Corepack reads (https://nodejs.org/api/corepack.html).
// Install commands are the lockfile-exact ones each tool documents for CI:
// npm ci (https://docs.npmjs.com/cli/commands/npm-ci), pnpm install
// --frozen-lockfile, yarn install --immutable (Yarn 2+) or --frozen-lockfile (Yarn 1).
export function detectProject(dir) {
  const read = (name) => {
    try {
      return fs.readFileSync(path.join(dir, name), "utf8");
    } catch {
      return null;
    }
  };
  const has = (name) => fs.existsSync(path.join(dir, name));
  let pkg = null;
  const raw = read("package.json");
  if (raw) {
    try {
      pkg = JSON.parse(raw);
    } catch {
      throw new Error(`package.json in ${dir} is not valid JSON.`);
    }
  }

  const declared = String(pkg?.packageManager || "").split("@");
  let manager = declared[0] || null;
  let major = Number((declared[1] || "").split(".")[0]) || null;
  if (!manager) {
    if (has("pnpm-lock.yaml")) manager = "pnpm";
    else if (has("yarn.lock")) manager = "yarn";
    else if (has("bun.lockb") || has("bun.lock")) manager = "bun";
    else manager = "npm";
  }
  if (manager === "yarn" && !major) major = has(".yarnrc.yml") ? 2 : 1;

  const node = pkg?.engines?.node || (read(".nvmrc") || read(".node-version") || "").trim() || null;
  return {
    name: pkg?.name || path.basename(path.resolve(dir)),
    manager,
    managerMajor: major,
    locked: has("package-lock.json") || has("npm-shrinkwrap.json") || has("pnpm-lock.yaml") || has("yarn.lock") || has("bun.lockb") || has("bun.lock"),
    node,
    scripts: pkg?.scripts || {}
  };
}

export function installCommand(project) {
  const { manager, managerMajor, locked } = project;
  if (manager === "pnpm") return locked ? "pnpm install --frozen-lockfile" : "pnpm install";
  if (manager === "yarn") {
    if (!locked) return "yarn install";
    return managerMajor >= 2 ? "yarn install --immutable" : "yarn install --frozen-lockfile";
  }
  if (manager === "bun") return locked ? "bun install --frozen-lockfile" : "bun install";
  return locked ? "npm ci" : "npm install";
}

function runScript(manager, name) {
  if (manager === "npm") return name === "test" || name === "start" ? `npm ${name}` : `npm run ${name}`;
  return `${manager} ${name === "test" ? "test" : `run ${name}`}`;
}

// The project's own commands, in the order someone would run them, using
// only scripts that exist.
export function projectCommands(project) {
  const order = ["build", "lint", "typecheck", "test", "start", "dev"];
  const names = order.filter((name) => project.scripts[name]);
  return [installCommand(project), ...names.map((name) => runScript(project.manager, name))];
}

export function scaffoldRunbook(config) {
  const project = config.project || null;
  const projectName = config.projectName || project?.name || "new-project";
  const cwd = config.cwd || ".";
  const commands = config.commands?.length
    ? config.commands
    : project
      ? projectCommands(project)
      : ["npm install", "npm test"];
  const node = project?.node || "18+";
  const verify = project?.scripts?.test
    ? [`- \`${runScript(project.manager, "test")}\` exits with code 0.`]
    : ["- Confirm process exits without errors."];

  return [
    `# ${projectName} Runbook`,
    "",
    "## Purpose",
    `Run and verify ${projectName} in a reproducible way.`,
    "",
    "## Environment",
    `- cwd: ${cwd}`,
    `- node: ${node}`,
    ...(project ? [`- package manager: ${project.manager}`] : []),
    "",
    "## Commands",
    ...commands.map((command) => `- ${command}`),
    "",
    "## Verification",
    ...verify,
    "- Confirm expected output is produced."
  ].join("\n");
}

// Sections a runbook needs, with the other names runbooks use for them.
export const RUNBOOK_SECTIONS = {
  Purpose: ["purpose", "overview", "about", "summary"],
  Environment: ["environment", "requirements", "prerequisites", "setup", "before you start"],
  Commands: ["commands", "steps", "procedure", "usage", "how to run"],
  Verification: ["verification", "verify", "checks", "check it worked", "validation"]
};

export function lintRunbook(runbookText) {
  const text = String(runbookText || "");
  const hs = headings(text);
  const all = sections(text);
  const missing = [];
  const empty = [];
  if (!hs.some((h) => h.level === 1 && h.text)) missing.push("# Title");
  for (const [section, names] of Object.entries(RUNBOOK_SECTIONS)) {
    const hits = all.filter((s) => s.level >= 2 && names.includes(normalize(s.text)));
    if (!hits.length) missing.push(`## ${section}`);
    else if (!hits.some((s) => s.body.trim())) empty.push(`## ${section}`);
  }
  return {
    missing,
    empty,
    pass: missing.length === 0 && empty.length === 0
  };
}
