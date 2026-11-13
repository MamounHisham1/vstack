## What
<!-- One-paragraph summary of the change. -->

## Why
<!-- Decision + rejected alternatives. -->

## Test checklist
- [ ] `node scripts/build-skills-json.mjs` passes (if skills changed)
- [ ] Site previewed with `python3 -m http.server --directory docs` (if docs/site changed)
- [ ] Sanitization check: no personal data or secrets in the diff

## Slice order (v-build batches only)
<!-- For decomposed features: PR N of M, link sibling PRs, note merge order. Delete if N/A. -->
