# Releases and build budget

The last billing cycle spent 41 remote builds on a site that ships a handful of
real changes a week. Almost none of them were caused by the site changing. They
were caused by pushing: audit screenshots, plan documents, copy notes, and
re-deploys of commits that had already been built. Vercel starts a build for
every push to a connected branch, and it decides that from the push alone,
before it reads `.vercelignore` or anything else in the repository.

The target is eight or fewer per cycle. Three things get us there, and only the
first is automatic.

## 1. The trigger filter

`vercel.json` sets an `ignoreCommand`, which Vercel runs before it provisions a
build:

```json
{ "ignoreCommand": "node scripts/vercel-ignore-build.mjs" }
```

The contract is inverted from the usual shell convention:

| exit code | meaning |
| --- | --- |
| `0` | skip the build |
| `1` | run the build |

`scripts/build-filter.mjs` holds the decision and `scripts/vercel-ignore-build.mjs`
is the entry point. The filter reads the commit range and classifies every
changed path:

- **Build** — `app/`, `components/`, `lib/`, `public/`, `content/`, `data/`,
  `types/`, `scripts/`, `package.json`, the lockfile, `next.config.mjs`,
  `tsconfig.json`, `vercel.json`, `proxy.ts`, `postcss.config.mjs`,
  `keystatic.config.ts`.
- **Skip** — `audits/`, `artifacts/`, `docs/`, `wiki/`, `tmp/`, `tests/`,
  `.github/`, `.claude/`, and loose files at the repository root such as
  `README.md` or a stray `.pdf`.
- **Unknown** — anything else.

One build path in the commit builds the whole commit. Only when every path is
on the skip list does the build get skipped.

Everything fails toward building. An unclassified path builds. A diff that will
not resolve builds. A shallow clone with no reachable parent builds. The two
outcomes are not symmetric: a needless build costs a few minutes of quota, a
wrongly skipped build is a production deploy that silently never happened.

Two escape hatches:

- `VERCEL_FORCE_BUILD=1` as a project environment variable forces a build.
- Re-deploying the identical SHA skips, because that commit already built.

Adding a new top-level directory means adding it to one of the two lists in
`scripts/build-filter.mjs`. Until then it counts as unknown and builds, which is
noisy but never wrong. `tests/vercel-ignore-build.test.ts` covers the
classification and the decision:

```bash
npx playwright test tests/vercel-ignore-build.test.ts
```

That run needs no dev server; `playwright.config.ts` lists it as node-only.

## 2. QA output leaves the repository

`audits/` and `artifacts/` are gitignored and no longer tracked. History is
untouched, so the old blobs stay in the object database; this only stops new
ones arriving. `next.config.mjs` keeps its `outputFileTracingExcludes` for the
same paths, because tracing still sweeps the working tree on a CLI deploy.

New QA output should go somewhere that is not a git push:

- **GitHub Actions artifact** — the default. Have the QA job write to
  `tmp/shots/` and finish with `actions/upload-artifact`, retention 14 days.
  The screenshots stay attached to the run that produced them, which is where
  anyone reviewing that run will look.
- **Object storage** — for anything that has to outlive a run or be linked from
  a document: an S3 or R2 bucket with a dated prefix, `qa/2026-08-03/...`.
  Paste the URL into the audit note rather than the image.

Either way the repository holds the finding, not the pixels.

## 3. Release rules

These are the habits, and they matter more than the filter. The filter only
catches commits that could never have mattered; these keep the ones that could
matter from each taking a build.

- **Work on a feature branch.** Intermediate commits belong there. Connect
  Preview deployments to the branches you actually want previewed, not to every
  branch.
- **One Preview per working session.** Push the finished state, not each step.
  A session that produced eleven commits still only needs one Preview of the
  last one.
- **Promote, do not rebuild.** A Preview that has been verified becomes
  Production through *Promote to Production* in the dashboard, or
  `vercel promote <url>`. That reuses the existing build. Merging the same work
  into `main` afterwards would build it a second time for no reason.
- **Documentation and audit results do not deploy.** The filter enforces this,
  but write the commit that way in the first place: keep record-only changes in
  their own commit rather than mixed into a runtime change, or they inherit its
  build.
- **Never deploy the same SHA twice.** Pick one path per commit, either the git
  integration or `vercel deploy` from the CLI, never both. Two paths on one
  commit is two builds for one artifact.

## Budget

| | before | after |
| --- | --- | --- |
| every push builds | yes | only when a shipping path changed |
| audit and doc commits | build | skip |
| duplicate SHA deploys | build | skip |
| intermediate session commits | build | stay on a branch |

Eight builds a cycle is roughly two verified releases a week with room for a
rebuild. If the number climbs again, read the *Ignored Build Step* line in the
deployment log: it prints the reason and the files behind every decision.
