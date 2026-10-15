# Changelog

## 1.2.0 - 2026-10-15

- README and runbook checks read headings the CommonMark way: headings inside fenced or indented code no longer count, setext headings and closing `#`s do.
- Sections can use the names READMEs actually use (Usage, Installation, Testing, Layout, ...), and a heading with nothing under it is reported as empty instead of passing.
- `scaffold` reads the target folder's package.json: install command from the lockfile or `packageManager` (`npm ci`, `pnpm install --frozen-lockfile`, `yarn install --immutable`), only scripts that exist, node version from `engines` or `.nvmrc`.
- `--min-score` rejects values outside 0 to 100.
- Our own RUNBOOK.md now passes `lint-runbook`.
- CI on Node 20, 22 and 24.

## 1.1.0 - 2026-02-25

- Added CLI output-path support for `scaffold` via `--out`.
- Added README quality gate via `check --min-score`.
- Added optional JSON output mode for `check`.
- Added evaluation helper with explicit pass/fail semantics.
- Added `.gitignore`, runbook doc, and test coverage updates.

## 1.0.0 - 2026-02-23

- Initial runbook scaffolder and README section checker.
