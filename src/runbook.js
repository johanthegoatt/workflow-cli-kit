export function scaffoldRunbook(config) {
  const projectName = config.projectName || "new-project";
  const cwd = config.cwd || ".";
  const commands = config.commands?.length
    ? config.commands
    : ["npm install", "npm test", "npm run dev"];

  return [
    `# ${projectName} Runbook`,
    "",
    "## Purpose",
    `Run and verify ${projectName} in a reproducible way.`,
    "",
    "## Environment",
    `- cwd: ${cwd}`,
    "- node: 18+",
    "",
    "## Commands",
    ...commands.map((command) => `- ${command}`),
    "",
    "## Verification",
    "- Confirm process exits without errors.",
    "- Confirm expected output is produced."
  ].join("\n");
}

const REQUIRED_HEADINGS = ["# ", "## Purpose", "## Environment", "## Commands", "## Verification"];

export function lintRunbook(runbookText) {
  const text = String(runbookText || "");
  const missing = REQUIRED_HEADINGS.filter((heading) => !text.includes(heading));
  return {
    missing,
    pass: missing.length === 0
  };
}
