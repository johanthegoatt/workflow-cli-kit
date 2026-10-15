import { normalize, sections } from "./markdown.js";

export const requiredSections = [
  "Description",
  "Features",
  "Run",
  "Test",
  "Project Structure"
];

// Other names READMEs use for the same section. Install and Usage come from
// the standard-readme spec (https://github.com/RichardLitt/standard-readme),
// "Getting started" and "Testing" from common GitHub templates.
export const sectionAliases = {
  Description: ["description", "about", "overview", "background", "introduction", "what is it", "what it does"],
  Features: ["features", "highlights", "what it can do", "capabilities"],
  Run: ["run", "running", "usage", "how to use", "getting started", "quick start", "quickstart", "install", "installation", "setup", "run it"],
  Test: ["test", "tests", "testing", "running tests", "running the tests", "run the tests"],
  "Project Structure": ["project structure", "structure", "layout", "project layout", "folder structure", "directory structure", "repository layout"]
};

function matches(section, headingText) {
  const h = normalize(headingText);
  return (sectionAliases[section] || [normalize(section)]).includes(h);
}

// A section counts when one of its headings has something under it. A
// heading with nothing but blank lines before the next heading is listed as
// empty, so `## Test` with no content doesn't pass the gate.
export function inspectSections(readmeText) {
  const all = sections(readmeText);
  const found = {};
  const empty = [];
  for (const section of requiredSections) {
    const hits = all.filter((s) => s.level >= 2 && matches(section, s.text));
    const filled = hits.find((s) => s.body.trim() !== "");
    if (filled) found[section] = filled.text;
    else if (hits.length) empty.push(section);
  }
  return { found, empty };
}

export function findMissingSections(readmeText) {
  const { found } = inspectSections(readmeText);
  return requiredSections.filter((section) => !found[section]);
}

export function scoreReadme(readmeText) {
  const { found, empty } = inspectSections(readmeText);
  const missing = requiredSections.filter((section) => !found[section]);
  const present = requiredSections.length - missing.length;
  const score = Math.round((present / requiredSections.length) * 100);

  return {
    score,
    present,
    missing,
    empty,
    matched: found
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
