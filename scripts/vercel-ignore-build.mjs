#!/usr/bin/env node
/**
 * Vercel Ignored Build Step.
 *
 * The contract Vercel defines for this command is inverted from the usual one:
 *
 *   exit 0  ->  skip the build
 *   exit 1  ->  run the build
 *
 * The decision itself lives in build-filter.mjs. This file is only the entry
 * point: it resolves the commit range, prints why, and maps the verdict onto
 * those two exit codes. See docs/releases.md for the release rules it serves.
 */

import { changedFiles, decide } from "./build-filter.mjs";

// An explicit override, for the rare case where the filter is wrong and the
// deploy is needed now.
if (process.env.VERCEL_FORCE_BUILD === "1") {
  console.log("build: VERCEL_FORCE_BUILD is set");
  process.exit(1);
}

let resolved;
try {
  resolved = changedFiles();
} catch (error) {
  console.log(`build: could not inspect the commit range (${error?.message ?? error})`);
  process.exit(1);
}

if (!resolved) {
  console.log("build: no usable commit range (shallow clone or first deployment)");
  process.exit(1);
}

const verdict = decide(resolved.files, { emptyRangeIsNoop: resolved.emptyRangeIsNoop });
const scope = `${resolved.range}, ${resolved.files.length} file(s)`;

if (verdict.build) {
  console.log(`build: ${verdict.reason} (${scope})`);
  for (const file of [...verdict.buildFiles, ...verdict.unknownFiles].slice(0, 8)) {
    console.log(`  - ${file}`);
  }
  process.exit(1);
}

console.log(`skip: ${verdict.reason} (${scope})`);
for (const file of verdict.skipFiles.slice(0, 8)) {
  console.log(`  - ${file}`);
}
process.exit(0);
