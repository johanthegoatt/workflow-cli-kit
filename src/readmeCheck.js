export const requiredSections = [
  "Description",
  "Features",
  "Run",
  "Test",
  "Project Structure"
];

function headingPattern(section) {
  return new RegExp(`^##\\s+${section}\\s*$`, "im");
}

export function findMissingSections(readmeText) {
  return requiredSections.filter((section) => !headingPattern(section).test(readmeText));
}

export function scoreReadme(readmeText) {
  const missing = findMissingSections(readmeText);
  const present = requiredSections.length - missing.length;
  const score = Math.round((present / requiredSections.length) * 100);

  return {
    score,
    present,
    missing
  };
}

export function evaluateReadme(readmeText, minScore = 0) {
  const report = scoreReadme(readmeText);
  return {
    ...report,
    minScore,
    pass: report.score >= minScore
  };
}
